from datetime import datetime, timedelta
from jose import jwt
from app.core.config import settings
from jose import jwt, JWTError, ExpiredSignatureError
from fastapi import HTTPException

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM

def create_refresh_token(data: dict):

    payload = data.copy()

    expire = datetime.utcnow() + timedelta(days=7)

    payload.update({
        "exp": expire,
        "type": "refresh"
    })

    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

def create_access_token(data: dict):

    payload = data.copy()

    expire = datetime.utcnow() + timedelta(minutes=15)

    payload.update({
        "exp": expire,
        "type": "access"
    })

    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )




def verify_refresh_token(refresh_token: str):
    try:
        payload = jwt.decode(
            refresh_token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=401,
                detail="Invalid refresh token"
            )

        return payload

    except ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Refresh token expired"
        )

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )