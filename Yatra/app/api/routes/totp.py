
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.schemas.totp import VerifyRequest, VerifyTOTPLoginRequest, VerifyTotpRequest
from app.api.routes.auth import get_db
from app.db.session import SessionLocal
from app.models.user import User
from app.core.config import settings
from app.services.login_service import create_access_token, create_refresh_token
from jose import jwt, JWTError
import pyotp
import qrcode
import io
import base64

router = APIRouter()

def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    """Extract current user from JWT token in Authorization header"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/enable-totp")
def enable_totp(
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate TOTP secret and QR code for enabling 2FA"""

    secret = pyotp.random_base32()
    user.totp_secret = secret
    db.commit()

    uri = pyotp.TOTP(secret).provisioning_uri(
        name=user.email or user.mobile,
        issuer_name="Yatra"
    )

    img = qrcode.make(uri)
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    qr_code = base64.b64encode(buffer.getvalue()).decode()

    return {
        "qr_code": qr_code,
        "secret": secret
    }

@router.post("/verify-totp-setup")
def verify_totp_setup(
    payload: VerifyRequest,
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify TOTP code during setup and enable 2FA"""

    if not user.totp_secret:
        raise HTTPException(status_code=400, detail="TOTP not initialized")

    totp = pyotp.TOTP(user.totp_secret)
    if not totp.verify(payload.code, valid_window=1):
        raise HTTPException(status_code=400, detail="Invalid TOTP code")

    user.is_2fa_enabled = True
    db.commit()

    return {"message": "2FA enabled successfully"}

@router.post("/verify-totp-login")
def verify_totp_login(
    payload: VerifyTotpRequest,
    db: Session = Depends(get_db)
):
    """Verify TOTP code during login"""
    user = db.query(User).filter(User.id == payload.user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user.is_2fa_enabled or not user.totp_secret:
        raise HTTPException(status_code=400, detail="2FA not enabled")

    totp = pyotp.TOTP(user.totp_secret)
    if not totp.verify(payload.code, valid_window=1):
        raise HTTPException(status_code=400, detail="Invalid TOTP code")

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "message": "Login successful"
    }

@router.post("/disable-totp")
def disable_totp(
    user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Disable 2FA for user"""
    
    user.is_2fa_enabled = False
    user.totp_secret = None
    db.commit()

    return {"message": "2FA disabled successfully"}
