import secrets
import string
import hmac
import hashlib

def generate_otp(length=6):
    digits = string.digits
    return ''.join(
        secrets.choice(digits)
        for _ in range(length)
    )
    


SECRET_KEY = b"your-super-secret-key"

def create_otp_hash(otp):
    return hmac.new(
        SECRET_KEY,
        otp.encode(),
        hashlib.sha256
    ).hexdigest()
    
def verify_otp(user_input, stored_hash):
    calculated = create_otp_hash(user_input)
    return hmac.compare_digest(calculated, stored_hash)