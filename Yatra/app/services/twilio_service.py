from twilio.rest import Client
from app.core.config import settings

account_sid = settings.TWILIO_ACCOUNT_SID
auth_token = settings.TWILIO_AUTH_TOKEN
TWILIO_VERIFY_SERVICE_SID = settings.TWILIO_VERIFY_SERVICE_SID

client = Client(
    account_sid,
    auth_token
)

verification_check = client.verify \
    .v2 \
    .services('VA4249b7f660b6acfae6bf5b294f144227') \
    .verification_checks \
    .create(to='+919910630819', code='[Code]')

print(verification_check.status)

check = client.verify \
    .v2 \
    .services(TWILIO_VERIFY_SERVICE_SID) \
    .verification_checks \
    .create(
        to="+919876543210",
        code="123456"
    )

if check.status == "approved":
    print("OTP verified")