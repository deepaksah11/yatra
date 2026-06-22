# TOTP MFA Implementation Guide

## Overview

This document describes the complete TOTP (Time-based One-Time Password) Multi-Factor Authentication (MFA) implementation for the Yatra application.

## Architecture

### Backend (FastAPI - Python)

#### New Endpoints Created:

1. **POST /enable-totp**
   - Generates a random TOTP secret
   - Creates a QR code for the user
   - Returns base64-encoded QR code to frontend
   - Requires: JWT Authorization header

2. **POST /verify-totp-setup**
   - Verifies the 6-digit TOTP code during setup
   - Enables 2FA for the user (`is_2fa_enabled = True`)
   - Requires: JWT Authorization header + 6-digit code

3. **POST /verify-totp-login**
   - Verifies TOTP code during login
   - Issues access and refresh tokens on success
   - Requires: user_id (from login response) + 6-digit code

4. **POST /disable-totp**
   - Disables 2FA for the user
   - Clears the TOTP secret
   - Requires: JWT Authorization header

### Frontend (React)

#### Updated Components:

1. **Auth.jsx** (Authentication Modal)
   - Added TOTP verification step after password login
   - Displays TOTP input form when `requires_2fa: true`
   - Shows 6-digit code input field with numeric keyboard
   - Handles back navigation to login

2. **App.jsx** (Main Navigation)
   - Added logout button to navbar
   - Shows "Logout" button when user is logged in
   - Clears all authentication tokens from localStorage
   - Updates login state

3. **Dashboard.jsx** (User Dashboard)
   - Added "Enable 2FA" section
   - Displays QR code for scanning
   - Allows verification with 6-digit code
   - Shows 2FA status
   - Allows disabling 2FA

4. **Enable2FA.jsx** (Dedicated 2FA Setup Page)
   - Comprehensive 2FA setup interface
   - Step-by-step instructions
   - Ability to enable/disable 2FA

## User Flows

### 1. First Time Login (Without 2FA)

```
User → Login with Email/Password
  ↓
Backend validates credentials
  ↓
Backend returns: { access_token, refresh_token, requires_2fa: false }
  ↓
Frontend stores tokens
  ↓
Redirect to Dashboard
```

### 2. Enable 2FA from Dashboard

```
User clicks "Enable 2FA"
  ↓
Frontend sends GET /enable-totp with JWT
  ↓
Backend generates secret + QR code
  ↓
Frontend displays QR code
  ↓
User scans with authenticator app (Google Authenticator, Microsoft Authenticator, Authy)
  ↓
User enters 6-digit code
  ↓
Frontend sends POST /verify-totp-setup with code + JWT
  ↓
Backend validates code against secret
  ↓
Backend sets is_2fa_enabled = True
  ↓
Frontend shows success message
```

### 3. Login with 2FA Enabled

```
User → Login with Email/Password
  ↓
Backend validates credentials
  ↓
Backend checks is_2fa_enabled = True
  ↓
Backend returns: { requires_2fa: true, user_id: X }
  ↓
Frontend shows TOTP verification form
  ↓
User enters 6-digit code from authenticator app
  ↓
Frontend sends POST /verify-totp-login with code + user_id
  ↓
Backend validates TOTP code (valid_window=1 allows 30-second time drift)
  ↓
Backend returns: { access_token, refresh_token }
  ↓
Frontend stores tokens
  ↓
Redirect to Dashboard
```

### 4. Logout

```
User clicks "Logout" button in navbar
  ↓
Frontend clears:
  - access_token
  - refresh_token
  - username
  - is_2fa_enabled
  ↓
Frontend redirects to home page
  ↓
Login button reappears in navbar
```

## Database Schema

### User Model Updates

```python
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(50), unique=True)
    password_hash = Column(String(255))

    # MFA Fields
    totp_secret = Column(String(255), nullable=True)      # TOTP secret (base32)
    is_2fa_enabled = Column(Boolean, default=False)       # 2FA enabled flag
```

## Security Features

1. **Time-based OTP Validation**
   - Uses `valid_window=1` for 30-second time drift tolerance
   - Prevents replay attacks by time-based expiration

2. **JWT Tokens**
   - Access tokens expire in 15 minutes
   - Refresh tokens expire in 7 days
   - Tokens include user ID in `sub` claim

3. **Secret Storage**
   - TOTP secrets stored as base32 strings in database
   - Secrets never exposed to frontend

4. **Rate Limiting Ready**
   - Backend structure supports rate limiting implementation
   - Can be added via middleware or endpoint

## Testing Checklist

### Setup Phase

- [ ] User can enable 2FA from Dashboard
- [ ] QR code displays correctly
- [ ] QR code works with authenticator apps:
  - [ ] Google Authenticator
  - [ ] Microsoft Authenticator
  - [ ] Authy
  - [ ] FreeOTP

### Verification During Setup

- [ ] Valid 6-digit code enables 2FA
- [ ] Invalid code shows error
- [ ] Code with non-digit characters is rejected
- [ ] Code less than 6 digits is rejected
- [ ] 2FA status updates in Dashboard

### Login with 2FA

- [ ] Login prompts for TOTP on second page
- [ ] Valid TOTP code completes login
- [ ] Invalid TOTP code shows error
- [ ] Previous credentials remain after error
- [ ] User redirected to Dashboard after successful 2FA verification

### Logout

- [ ] Logout button visible in navbar when logged in
- [ ] Logout clears all tokens
- [ ] Logout redirects to home
- [ ] Login button reappears after logout

### Edge Cases

- [ ] Disabling and re-enabling 2FA works
- [ ] TOTP code valid window allows ~30 second drift
- [ ] Multiple login attempts with wrong code
- [ ] User without 2FA can login normally

## API Endpoints Reference

### Authentication Endpoints

```
POST /login
  Body: { login: "email@example.com", password: "password" }
  Response (2FA disabled): { access_token, refresh_token, token_type, requires_2fa: false }
  Response (2FA enabled): { requires_2fa: true, user_id: X }

POST /verify-totp-login
  Body: { code: "123456", user_id: X }
  Header: None (user_id passed in body)
  Response: { access_token, refresh_token, token_type, message }

POST /enable-totp
  Header: Authorization: Bearer <JWT>
  Response: { qr_code: "base64...", secret: "XXXXX..." }

POST /verify-totp-setup
  Header: Authorization: Bearer <JWT>
  Body: { code: "123456" }
  Response: { message: "2FA enabled successfully" }

POST /disable-totp
  Header: Authorization: Bearer <JWT>
  Response: { message: "2FA disabled successfully" }
```

## Frontend Local Storage

```javascript
localStorage.getItem("access_token"); // JWT for API calls
localStorage.getItem("refresh_token"); // Token to refresh access
localStorage.getItem("username"); // User's login identifier
localStorage.getItem("is_2fa_enabled"); // "true" or "false"
```

## Recommended Next Steps

1. **Rate Limiting**: Add rate limiting to login and TOTP verification endpoints
2. **Backup Codes**: Generate backup codes for account recovery
3. **Device Tracking**: Track and list connected devices
4. **Email Notifications**: Notify user when 2FA is enabled/disabled
5. **TOTP Secret Export**: Allow users to export/backup their secret
6. **Session Management**: Implement session tracking and logout from all devices

## Troubleshooting

### QR Code Not Scanning

- Ensure lighting is adequate
- Check that authenticator app has camera permissions
- Try a different authenticator app

### "Invalid TOTP code" Error

- Check that device time is synchronized
- Try a code from a few seconds ago/future (within 30s)
- Verify QR code was scanned correctly
- Check that secret matches in database

### Logout Not Working

- Clear browser cache/cookies
- Check that localStorage is being cleared
- Verify API call returns 200 status

## Dependencies

### Backend

- fastapi
- pyotp
- qrcode
- sqlalchemy
- python-jose
- bcrypt

### Frontend

- react
- axios
- react-router-dom
- bootstrap (for styling)

Install required backend package if missing:

```bash
pip install pyotp qrcode pillow
```
