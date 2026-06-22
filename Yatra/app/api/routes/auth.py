from datetime import datetime, timedelta
import email

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.mobile_verification import MobileVerification
from app.schemas.loginRequest import LoginRequest
from app.models.otp_verification import OTPVerification
from app.services.otp_service import verify_otp
from app.services.email_service import send_otp_email
from app.db.session import SessionLocal
from app.models.user import User
from app.schemas.user import RegisterUser, LoginUser
from app.auth import hash_password, verify_password
from app.services.otp_service import create_otp_hash, generate_otp
from app.services.login_service import create_access_token, create_refresh_token, verify_refresh_token
from app.repository.user_repository import get_user_by_email, get_user_by_mobile
from fastapi import HTTPException
from app.core.config import settings
from urllib import request
import pyotp

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/register")
def register(data: RegisterUser, db: Session = Depends(get_db)):

    # existing_email = db.query(User).filter(User.email == user.email).first()
    # if existing_email:
    #     return {"message": "Email already exists"}

    # existing_username = db.query(User).filter(User.username == user.username).first()
    # if existing_username:
    #     return {"message": "Username already exists"}

    verification = db.query(
        MobileVerification
    ).filter(
        MobileVerification.mobile == data.mobile,
        MobileVerification.is_verified == True
    ).first()

    if not verification:
        raise HTTPException(
            status_code=400,
            detail="Please verify mobile first"
        )
    existing_user = db.query(User).filter(
        User.mobile == data.mobile
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Mobile already registered"
        )
    
    user = User(
        username=data.username,
        mobile=data.mobile,
        password_hash=hash_password(
            data.password
        ),
        is_mobile_verified=True
    )

    db.add(user)
    db.delete(verification)



    # otp_record = db.query(
    # OTPVerification
    # ).filter(
    # OTPVerification.email == user.email,
    # OTPVerification.is_verified == True
    # ).first()   
    
    # if not otp_record:
        # return {"message": "Email not verified. Please verify your email before registering."}
    
    # otp_record.is_verified = True
    # db.delete(otp_record)

    # new_user = User(
    #     username=user.username,
    #     email=user.email,
    #     password_hash=hash_password(user.password),
    # )

    # db.add(new_user)
    db.commit()
    return {"message": "Registration Success"}


@router.post("/login")
def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
    ):

    user = get_user_by_email(db, request.login) or get_user_by_mobile(db, request.login)
    
    print("user =", user)
    print("type =", type(user))
    if not user:
        raise HTTPException(400, "Invalid credentials")
    
    if not verify_password(request.password, user.password_hash):
        raise HTTPException(400, "Invalid credentials")
    
    if user.is_2fa_enabled:
        return {
            "requires_2fa": True,
            "user_id": user.id
        }


    access_token = create_access_token(
        {"sub": str(user.id)}
    )

    refresh_token = create_refresh_token(
        {"sub": str(user.id)}
    )

    return {
        
    "access_token": access_token,
    "refresh_token": refresh_token,
    "token_type": "bearer",
    "requires_2fa": False,
}
    

    # db_user = db.query(User).filter(
    #     (User.username == user.login) | (User.email == user.login)
    # ).first()

    # if not db_user:
    #     return {"message": "User not found"}

    # if not verify_password(user.password, db_user.password_hash):
    #     return {"message": "Wrong password"}

    # return {"message": "Login Success", "user": db_user.username}


@router.post("/create-otp")   
async def create_otp(email: str, db: Session = Depends(get_db)):
    # Implementation for creating OTP
        otp = generate_otp()
        otp_hash = create_otp_hash(otp)
        record = OTPVerification(
            email=email,
            otp_hash=otp_hash,
            expires_at=datetime.utcnow() + timedelta(seconds=60)
        )
        db.add(record)
        db.commit()
        await send_otp_email(
        email,
        otp
        )

        return {
        "message": "OTP sent successfully"
        }
        

@router.post("/verify-otp")
def verification_otp(email: str, otp: str, db: Session = Depends(get_db)):
    # Implementation for verifying OTP
    record = db.query(OTPVerification).filter(OTPVerification.email == email).first()
    if not record:
        return {"message": "No OTP request found for this email"}

    if record.is_verified:
        return {"message": "OTP already verified"}

    if datetime.utcnow() > record.expires_at:
        return {"message": "OTP has expired"}

    if not verify_otp(otp, record.otp_hash):
        record.attempts += 1
        db.commit()
        return {"message": "Invalid OTP"}

    record.is_verified = True
    db.commit()
    return {"message": "OTP verified successfully"}

@router.post("/refresh")
async def refresh_token(
    refresh_token: str
):
    payload = verify_refresh_token(
        refresh_token
    )

    new_access_token = create_access_token(
        {"user_id": payload["user_id"]}
    )

    return {
        "access_token": new_access_token
    }

