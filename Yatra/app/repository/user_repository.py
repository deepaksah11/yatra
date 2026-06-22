import email
from app.models.user import User


def get_user_by_email(db, email):
    return db.query(User).filter(User.email == email).first()

def get_user_by_mobile(db, mobile):
    return db.query(User).filter(User.mobile == mobile).first()