from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "mysql+pymysql://root:9910@localhost/yatratest"
    allowed_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ]
    SMTP_HOST: str
    SMTP_PORT: int
    MAIL_ADDRESS: str
    MAIL_PASSWORD: str
    SECRET_KEY: str
    ALGORITHM: str 
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_EXPIRE_DAYS: int = 60
    TWILIO_ACCOUNT_SID: str
    TWILIO_AUTH_TOKEN: str
    TWILIO_VERIFY_SERVICE_SID: str


    class Config:
        env_file = ".env"
    

settings = Settings()
