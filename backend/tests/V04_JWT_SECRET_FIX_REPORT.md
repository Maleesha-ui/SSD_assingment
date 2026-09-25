# V04 Vulnerability Fix Report
## Weak JWT Signing Secret - OWASP A02: Cryptographic Failures

**Report Date:** September 25, 2026  
**Application:** Funeral Management System (MERN Stack)  
**Vulnerability ID:** V04  
**Severity:** HIGH  
**Status:** REMEDIATED

## Summary

The backend's active local configuration contained a three-digit numeric `JWT_SECRET`, used directly for JWT signing and verification. This made token forgery feasible if the key were guessed. The local secret has been replaced with a cryptographically random 48-byte value. Its value is intentionally omitted from this report.

The backend now rejects missing or weak JWT secrets during startup. JWT signing explicitly uses HS256, and verification accepts only HS256.

## Affected Functionality

- Registration, login, Google token authentication, and profile completion issue JWTs through `authController.generateToken`.
- Protected API routes verify JWTs in `middleware/auth.js` and `middleware/authMiddleware.js`.
- Admin step-up authentication issues and verifies short-lived JWTs in `adminUserController` and `middleware/auth.js`.

## Remediation

1. Replaced the weak local `JWT_SECRET` with a random 48-byte value. The local `.env` is ignored by Git and is not tracked.
2. Added `backend/config/jwtSecrets.js` to require secrets of at least 32 bytes and reject numeric-only, repeated-character, common weak, and placeholder values.
3. Added startup validation in `backend/app.js`; missing or weak JWT configuration prevents the backend from starting.
4. Updated JWT signing and verification to use shared validated secret helpers.
5. Explicitly selected HS256 for signing and restricted verification to HS256.
6. Added optional `STEP_UP_SECRET` configuration. If unset, the step-up key derives from the validated random JWT secret.
7. Updated `backend/.env.example` with blank secret fields and strength guidance.

## Files Changed

- `backend/.env` (local ignored configuration; not tracked)
- `backend/.env.example`
- `backend/app.js`
- `backend/config/jwtSecrets.js`
- `backend/controllers/authController.js`
- `backend/controllers/adminUserController.js`
- `backend/middleware/auth.js`
- `backend/middleware/authMiddleware.js`

## Verification

- Confirmed the configured secret is 96 bytes without printing it.
- Normal and step-up HS256 signing/verification round-trips passed.
- Weak numeric secret was rejected by validation.
- HS384 token was rejected by the HS256-only verification configuration.
- Application startup rejected a weak `JWT_SECRET`.
- `node --check` and editor diagnostics passed for changed JavaScript files.
- The full Jest suite was not run.

## Deployment Notes

- Set a unique, cryptographically random `JWT_SECRET` of at least 32 bytes in each deployment environment. Production configuration was not inspected.
- Prefer a separate random `STEP_UP_SECRET` of at least 32 bytes.
- Rotating the signing key invalidates existing JWTs, so users may need to sign in again.
- The Express session-secret fallback is separate from JWT signing and was not changed by this remediation.