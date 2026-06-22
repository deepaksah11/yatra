
from sqlalchemy import Boolean, Column, Integer, String, DateTime

from app.db.base import Base


class MobileVerification(Base):
    __tablename__ = "mobile_verifications"

    id = Column(Integer, primary_key=True)
    mobile = Column(String(15), unique=True)
    is_verified = Column(Boolean, default=False)
    verified_at = Column(DateTime, nullable=True)