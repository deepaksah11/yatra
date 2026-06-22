from sqlalchemy import Boolean, Column, Integer, String
from app.db.base import Base


class User(Base):
    __tablename__ = "users"


    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(50), unique=True, nullable=True, index=True)
    password_hash = Column(String(255))
    mobile = Column(String(15), unique=True, nullable=True)
    is_mobile_verified = Column(Boolean, default=False)


    totp_secret = Column(String(255), nullable=True)
    is_2fa_enabled = Column(Boolean, default=False)

    # id = Column(Integer, primary_key=True, index=True)
    # username = Column(String(50), unique=True, index=True)
    # email = Column(String(255), unique=True, index=True)
    # password_hash = Column(String(255))
