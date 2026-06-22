import pyotp

def generate_secret():
    return pyotp.random_base32()

def generate_uri(secret, email):
    return pyotp.TOTP(secret).provisioning_uri(
        name=email,
        issuer_name="Yatra"
    )

def verify_totp(secret, code):
    totp = pyotp.TOTP(secret)
    return totp.verify(code, valid_window=1)