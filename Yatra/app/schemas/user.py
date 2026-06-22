from pydantic import BaseModel, EmailStr, Field, validator


def sanitize_input(value: str) -> str:
    if not isinstance(value, str):
        return value
    return value.strip()


class RegisterUser(BaseModel):
    username: str
    # email: EmailStr | None = None
    mobile: str | None = None
    password: str=Field(..., min_length=8)

    # _sanitize_username = validator("username", pre=True, always=True)(sanitize_input)
    # _sanitize_email = validator("email", pre=True, always=True)(lambda v: sanitize_input(v).lower())


class LoginUser(BaseModel):
    login: str
    password: str

    _sanitize_login = validator("login", pre=True, always=True)(sanitize_input)

class RegisterRequest(BaseModel):
    username: str
    mobile: str
    password: str=Field(..., min_length=8)

    _sanitize_username = validator("username", pre=True, always=True)(sanitize_input)
    _sanitize_mobile = validator("mobile", pre=True, always=True)(sanitize_input)

class PhoneOTPRequest(BaseModel):
    mobile: str

class PhoneOtpResponse(BaseModel):
    mobile: str
    otp: str
