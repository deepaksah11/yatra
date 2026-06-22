from fastapi_mail import ConnectionConfig
from app.core.config import settings
from fastapi_mail import FastMail
from fastapi_mail import MessageSchema

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_ADDRESS,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_ADDRESS,
    MAIL_PORT=settings.SMTP_PORT,
    MAIL_SERVER=settings.SMTP_HOST,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True
)



async def send_otp_email(
    email: str,
    otp: str
):
    message = MessageSchema(
        subject="Email Verification OTP",
        recipients=[email],
        body=f"""
        Your OTP is: {otp}

        This OTP expires in 30 seconds.
        """,
        subtype="plain"
    )

    fm = FastMail(conf)

    await fm.send_message(message)