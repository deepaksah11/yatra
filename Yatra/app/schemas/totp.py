from pydantic import BaseModel



class VerifyTOTPResponse(BaseModel):
    success: bool

class VerifyRequest(BaseModel):
    code: str

class VerifyTOTPLoginRequest(BaseModel):
    otp:str
    type: str
    email: str
    mobile:str

class VerifyTotpRequest(BaseModel):
    code: str
    user_id: int



