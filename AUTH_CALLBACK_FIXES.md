# Auth Callback Fixes - Integration Guide

## Summary
This document outlines the fixes made to the website's Supabase auth callback handler (`/auth/callback/index.html`) to properly handle password reset, email confirmation, and deep linking to the mobile app.

---

## What Changed

### 1. **Token Parameter Extraction**
**Issue:** The callback page wasn't extracting the `token` parameter that Supabase sends for PKCE authentication flows.

**Fix:** Added `token` to parameter parsing:
```javascript
token: search.get("token") || hash.get("token")
```

**Impact:** The mobile app will now receive the PKCE token needed to verify password reset and email confirmation requests.

---

### 2. **Auth Data Format Change**
**Issue:** Auth data was being encoded as base64 JSON and passed as a single `auth` parameter:
```
❌ OLD: crave://reset-password?auth=eyJhY2Nlc3NfdG9rZW4i...
```

**Fix:** Changed to direct query parameters:
```
✅ NEW: crave://reset-password?token=pkce_xxx&type=recovery
```

**Implementation:**
- Token is passed as `?token=pkce_xxx`
- Type is passed as `&type=recovery` (or `signup`, etc.)
- Session tokens (if available) are passed individually as `access_token` and `refresh_token`

**Impact:** Your app's deep link handler must now parse individual query parameters instead of decoding a base64 JSON blob.

---

### 3. **Target Routing Priority**
**Issue:** Password reset was sometimes routing to login instead of the reset screen.

**Fix:** Changed `determineTarget()` to check `type === "recovery"` FIRST before other routing logic.

**Routing Logic (Priority Order):**
1. **`type=recovery`** → Always routes to `crave://reset-password`
2. **`redirect_to=crave://...`** → Uses the specified deep link path
3. **Custom `target`** → Uses the custom target parameter
4. **Default** → Routes to `crave://login` (includes signup confirmation)

---

## Deep Link Formats

### Password Reset
```
crave://reset-password?token=pkce_abc123...&type=recovery
```

### Email Confirmation
```
crave://login?token=pkce_xyz789...&type=signup
```

### Custom Target (Backward Compatible)
```
crave://[target]?token=pkce_def456...
```

---

## Mobile App Integration Requirements

### 1. Update Deep Link Handler
Your app must now handle query parameters directly:

**Old approach (remove):**
```javascript
// DON'T DO THIS ANYMORE
const authData = JSON.parse(atob(params.auth));
```

**New approach (implement):**
```javascript
// DO THIS INSTEAD
const token = params.token;          // PKCE token for recovery/signup
const type = params.type;            // "recovery", "signup", etc.
const accessToken = params.access_token;  // Session token (if available)
const refreshToken = params.refresh_token; // Session token (if available)
```

### 2. Screen Routing
- `crave://reset-password` → Navigate to password reset screen
- `crave://login` → Navigate to login screen
- `crave://[target]` → Navigate to specified target screen

### 3. Token Handling
The `token` parameter contains the PKCE token that must be exchanged with Supabase to complete the auth flow:

**For Password Reset:**
```javascript
// Exchange PKCE token with Supabase
const { data, error } = await supabase.auth.verifyOtp({
  token_hash: tokenFromDeepLink,
  type: 'recovery'
});
```

**For Email Confirmation:**
```javascript
// Exchange PKCE token with Supabase
const { data, error } = await supabase.auth.verifyOtp({
  token_hash: tokenFromDeepLink,
  type: 'email'
});
```

### 4. Debug Logging
The website callback page now includes console logging:
```javascript
console.log("Deep link:", deepLink);
```

Check browser console on desktop to verify the generated deep link format.

---

## Testing Checklist

- [ ] Password reset email opens app and navigates to reset screen
- [ ] Reset screen can successfully exchange the PKCE token with Supabase
- [ ] Email confirmation opens app and navigates to login screen
- [ ] Confirmation screen can successfully exchange the PKCE token with Supabase
- [ ] Deep link parameters are properly parsed (no base64 JSON decoding)
- [ ] QR codes on desktop show correct deep link format
- [ ] Mobile deep link opens app correctly

---

## Example Deep Link Scenarios

### Scenario 1: Password Reset
**Email link:**
```
https://auth.cravesocial.app/auth/v1/verify?token=pkce_123&type=recovery&redirect_to=crave://
```

**Generated deep link:**
```
crave://reset-password?token=pkce_123&type=recovery
```

### Scenario 2: Email Confirmation
**Email link:**
```
https://auth.cravesocial.app/auth/v1/verify?token=pkce_456&type=signup
```

**Generated deep link:**
```
crave://login?token=pkce_456&type=signup
```

### Scenario 3: Custom Redirect
**Callback URL:**
```
https://cravesocial.app/auth/callback?token=pkce_789&target=profile
```

**Generated deep link:**
```
crave://profile?token=pkce_789
```

---

## Backward Compatibility

The following features remain unchanged:
- Mobile/desktop device detection
- QR code generation for desktop users
- "Open in App" button
- Fallback messaging for devices without app installed
- Custom `target` parameter support

---

## Files Modified

- `/auth/callback/index.html` - Complete script rewrite for proper parameter handling

---

## Questions or Issues?

If you encounter any issues with deep linking or parameter parsing:
1. Check browser console logs on the callback page
2. Verify the deep link format matches examples above
3. Ensure your app's deep link handler is updated to parse individual parameters
4. Test with both password reset and email confirmation flows

