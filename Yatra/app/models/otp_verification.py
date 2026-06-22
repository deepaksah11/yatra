from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Integer
from sqlalchemy import Boolean
from sqlalchemy import DateTime

from app.db.base import Base


class OTPVerification(Base):
    __tablename__ = "otp_verification"

    id = Column(Integer, primary_key=True)

    email = Column(String(255), nullable=False)

    otp_hash = Column(String(255), nullable=False)

    expires_at = Column(DateTime, nullable=False)

    attempts = Column(Integer, default=0)

    is_verified = Column(Boolean, default=False)