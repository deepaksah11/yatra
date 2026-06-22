# Quick Start Guide - TOTP MFA Testing

## Prerequisites

Before testing, ensure your authenticator app is installed on your phone or device:

- Google Authenticator
- Microsoft Authenticator
- Authy
- Any other TOTP-compatible app

## Step 1: Start the Application

### Backend

```bash
cd d:\YatraB2B\Yatra
pip install -r requirements.txt  # Install dependencies including pyotp, qrcode
uvicorn app.main:app --reload
# Backend running on http://localhost:8000
```

### Frontend

```bash
cd d:\YatraB2B\Yatra_frontend
npm install
npm run dev
# Frontend running on http://localhost:5173
```

## Step 2: Test Registration & Login Without 2FA

1. Open browser → http://localhost:5173
2. Click "Sign In" → Click "Create Account"
3. Register with:
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com (or any test email)
   - Password: Test@123
4. Verify email (click "Send OTP" → "Verify")
5. Complete registration
6. Now login with email and password
7. You should be redirected to Dashboard immediately (no TOTP required)

## Step 3: Enable 2FA from Dashboard

1. On Dashboard, scroll to "Secure Your Account" section
2. Click "Enable 2FA with Authenticator"
3. A QR code will appear
4. Open your authenticator app on your phone
5. Click "+" to add new account
6. Scan the QR code
7. The app generates a 6-digit code (changes every 30 seconds)
8. Enter the 6-digit code in the form
9. Click "Verify & Enable"
10. Success! 2FA is now enabled

## Step 4: Test Login with 2FA

1. Open navbar → Click "Logout"
2. You should be back on home page
3. Click "Sign In"
4. Enter email and password → Click "Sign In"
5. **NEW**: Instead of going to Dashboard, you see "Two-Factor Authentication" screen
6. Open your authenticator app
7. Find the entry for "Yatra"
8. Enter the 6-digit code (it changes every 30 seconds)
9. Click "Verify Code"
10. Success! You're logged in and redirected to Dashboard

## Step 5: Test Logout Button

1. In the navbar (top right), you should see "Logout" button
2. Click it
3. You should be redirected to home page
4. "Sign In" button should reappear in navbar

## Step 6: Test TOTP Code Validation

### Valid Code

- Enter correct 6-digit code from authenticator app
- Should login successfully

### Invalid Code

- Enter wrong 6-digit code (e.g., "000000")
- Should show error: "Invalid TOTP code"
- Form clears for retry

### Expired Code

- If you wait more than 30 seconds, the code in app changes
- Old code will be rejected
- Use the new code from authenticator app

### Code Format

- Only numeric characters allowed
- Must be exactly 6 digits
- "Verify Code" button disabled until 6 digits entered

## Step 7: Test Disable 2FA

1. After logging in with 2FA, go to Dashboard
2. Scroll to "Secure Your Account"
3. You should see status: "✓ 2FA is enabled on your account"
4. Click "Disable 2FA"
5. Confirm the warning dialog
6. Success! 2FA is disabled
7. Logout and try login again - no TOTP prompt this time

## Step 8: Test Re-enabling 2FA

1. From Dashboard, click "Enable 2FA with Authenticator" again
2. A NEW QR code appears (different from before)
3. Open authenticator app
4. Scan the NEW QR code (or manually enter the secret if app provides that option)
5. Enter the 6-digit code
6. 2FA should be enabled again with the new secret

## Common Scenarios to Test

### Scenario 1: Multiple Failed TOTP Attempts

1. Login with 2FA enabled
2. Enter wrong code → Error
3. Try again with different wrong code → Error
4. Enter correct code → Success
   ✓ Expected: Multiple attempts should work until correct code entered

### Scenario 2: Rapid Code Entry

1. At login TOTP screen, enter code from authenticator app
2. Wait 5 seconds
3. Enter same code again
4. Login should fail (code expired after ~30 seconds)
5. Enter new code from app
6. Login should succeed
   ✓ Expected: Old codes should not work

### Scenario 3: Switch Between Devices

1. Enable 2FA on Desktop
2. Try to login on Mobile with same account
3. Mobile's authenticator app should generate same TOTP code
4. Login should work on Mobile
   ✓ Expected: TOTP works on any device with the account

### Scenario 4: Reinstall Authenticator App

1. Enable 2FA, save QR code or secret
2. Uninstall authenticator app
3. Reinstall authenticator app
4. Add account using same QR code/secret
5. Try to login
   ✓ Expected: TOTP should work the same way

## API Testing with cURL

### 1. Login without 2FA

```bash
curl -X POST http://localhost:8000/login \
  -H "Content-Type: application/json" \
  -d '{"login":"john@example.com","password":"Test@123"}'
```

Expected response (if 2FA not enabled):

```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "requires_2fa": false
}
```

Expected response (if 2FA enabled):

```json
{
  "requires_2fa": true,
  "user_id": 1
}
```

### 2. Enable TOTP

```bash
curl -X POST http://localhost:8000/enable-totp \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

Expected response:

```json
{
  "qr_code": "iVBORw0KGgoAAAANSUhEUgAA...",
  "secret": "JBSWY3DPEBLW64TMMQ======"
}
```

### 3. Verify TOTP Setup

```bash
curl -X POST http://localhost:8000/verify-totp-setup \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"code":"123456"}'
```

### 4. Verify TOTP Login

```bash
curl -X POST http://localhost:8000/verify-totp-login \
  -H "Content-Type: application/json" \
  -d '{"code":"123456","user_id":1}'
```

## Debugging

### Check Browser Console

- Open DevTools (F12)
- Check "Console" tab for any JavaScript errors
- Check "Network" tab to verify API calls

### Check Backend Logs

- Look at terminal where `uvicorn app.main:app --reload` is running
- You should see HTTP request logs
- Look for error messages

### Database Check

```sql
-- Check user 2FA status
SELECT id, email, is_2fa_enabled, totp_secret FROM users WHERE email='john@example.com';
```

### Test TOTP Directly (Python)

```python
import pyotp

# Use the secret from database
secret = "JBSWY3DPEBLW64TMMQ======"
totp = pyotp.TOTP(secret)

# Get current code
print(totp.now())  # Should match your authenticator app

# Verify a code
print(totp.verify("123456"))  # True or False
```

## Success Criteria

✓ All steps above complete without errors
✓ QR code displays and scans correctly
✓ TOTP verification works at login
✓ Logout button clears all session data
✓ Can re-enable 2FA after disabling it
✓ TOTP codes reject after ~30 seconds
✓ Multiple failed attempts eventually allow successful login

## Troubleshooting Common Issues

### Issue: "QR Code failed to generate"

**Solution**: Ensure `qrcode` and `pillow` packages are installed

```bash
pip install qrcode pillow
```

### Issue: "Authorization header missing" error

**Solution**: Make sure to send JWT token in Authorization header:

```
Authorization: Bearer <token_here>
```

### Issue: TOTP codes always fail

**Solution**:

- Check server time is accurate
- Verify secret in database matches authenticator app
- Try code from a different time window

### Issue: Can't logout

**Solution**: Check browser console and ensure API call succeeds

### Issue: Frontend can't connect to backend

**Solution**:

- Check backend is running on port 8000
- Check CORS is configured correctly
- Check no firewall blocking localhost:8000

## Next: Integration Testing

After manual testing, create automated tests:

- Unit tests for TOTP generation/verification
- Integration tests for complete MFA flow
- End-to-end tests using Selenium or Playwright

Refer to `TOTP_MFA_IMPLEMENTATION.md` for comprehensive documentation.
