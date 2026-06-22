from datetime import datetime 
from fastapi import APIRouter, Depends, HTTPException
from app.models.mobile_verification import MobileVerification
from app.models.user import User
from app.schemas import user
from twilio.rest import Client
from app.core.config import settings
from app.api.routes.auth import get_db
from app.schemas.user import PhoneOTPRequest, PhoneOtpResponse
from sqlalchemy.orm import Session

router = APIRouter()


client = Client(
    settings.TWILIO_ACCOUNT_SID,
    settings.TWILIO_AUTH_TOKEN
)

@router.post("/send-phone-otp")
def send_otp(data: PhoneOTPRequest, db: Session = Depends(get_db)):
    mobile = data.mobile
    user = db.query(User).filter(
    User.mobile == mobile
    ).first()

    if user:
      raise HTTPException(
        400,
        "Mobile already registered")
    
    print("SID:", settings.TWILIO_ACCOUNT_SID)
    print("TOKEN:", settings.TWILIO_AUTH_TOKEN[:5] + "...")
    print("VERIFY:", settings.TWILIO_VERIFY_SERVICE_SID)
    
    verification = client.verify \
        .v2 \
        .services(settings.TWILIO_VERIFY_SERVICE_SID) \
        .verifications \
        .create(
            to=f"+91{mobile}",
            channel="sms"
        )

    return {"message": "OTP sent"}

@router.post("/verify-phone-otp")
def verify_otp(data: PhoneOtpResponse, db: Session = Depends(get_db)):
    print(data.model_dump())


    mobile  = data.mobile
    otp = data.otp
    check = client.verify \
        .v2 \
        .services(settings.TWILIO_VERIFY_SERVICE_SID) \
        .verification_checks \
        .create(
            to=f"+91{mobile}",
            code=otp
        )

    if check.status != "approved":
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP"
        )
    verification = db.query(
        MobileVerification
    ).filter(
        MobileVerification.mobile == mobile
    ).first()

    if verification:
        verification.is_verified = True
        verification.verified_at = datetime.utcnow()

    else:
        verification = MobileVerification(
            mobile=mobile,
            is_verified=True,
            verified_at=datetime.utcnow()
        )
        db.add(verification)

    db.commit()
    return {
     "message": "Mobile number verified successfully"    
    }

@router.get("/twilio-test")
def twilio_test():

    account = client.api.accounts(
        settings.TWILIO_ACCOUNT_SID
    ).fetch()

    return {
        "name": account.friendly_name,
        "status": account.status
    }

@router.get("/verify-test")
def verify_test():

    service = client.verify.v2.services(
        settings.TWILIO_VERIFY_SERVICE_SID
    ).fetch()

    return {
        "sid": service.sid,
        "friendly_name": service.friendly_name
    }