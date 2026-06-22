from app.core.totp import (
    generate_secret,
    generate_uri,
    verify_totp
)

class TOTPService:

    @staticmethod
    def enable_2fa(user):

        secret = generate_secret()

        user.totp_secret = secret

        uri = generate_uri(
            secret,
            user.email
        )

        return uri

    @staticmethod
    def verify(user, code):

        return verify_totp(
            user.totp_secret,
            code
        )
    
    