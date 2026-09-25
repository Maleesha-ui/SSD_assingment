# Security Advisory & Architecture Documentation: V01 Remediation

## Vulnerability Overview: Mass Assignment / Privilege Escalation via Public Registration

| Field | Detail |
|---|---|
| **Vulnerability ID** | V01 (Critical) |
| **CWE Classification** | CWE-915: Improperly Controlled Modification of Dynamically Determined Object Attributes (Mass Assignment) / CWE-269: Improper Privilege Management |
| **OWASP Category** | A01:2021 — Broken Access Control |
| **CVSS v3.1 Score** | 9.8 (Critical) `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H` |
| **Remediation Status** | Complete & Enforced at Server Boundary |

---

## 1. Root Cause Analysis

Prior to remediation, the public registration endpoint (`POST /api/auth/register`) accepted an unvalidated, client-supplied `userType` or `role` parameter in the JSON request payload. The backend handler dynamically assigned `role: userType || 'customer'` and created administrative user records directly in MongoDB without verifying whether the requesting party held administrative credentials. 

Additionally, the Google OAuth profile completion flow (`PUT /api/auth/complete-profile`) permitted self-selection of elevated roles (`staff`, `driver`), and public registration did not reject unexpected fields, allowing an attacker to submit `POST /api/auth/register { role: "admin", ... }` and immediately escalate privileges to full platform administrator.

---

## 2. Remediation Architecture & Enforcement

To eliminate this vulnerability, the platform transitioned to a hardened **Privileged Intake & RBAC Architecture**:

```
[Public Self-Registration] ──(POST /auth/register)──► [validateDto: Whitelist Only] ──► Hardcoded: role = 'customer'
[Google OAuth Callback]    ──(POST /auth/google)   ──► [Check PendingInvite]        ──► Default: 'customer'
                                                                                    └── If Invite: Atomic Upgrade

[Admin Console UI]         ──(POST /admin/users/*) ──► [RBAC Guard + Rate Limit]    ──► Transactional Profile Creation
                                                       [Step-Up Auth (for Admin)]   ──► High-Severity Audit Log
```

### Key Remediation Pillars:

1. **Server-Boundary Role Isolation (Invariant 1)**:
   - `POST /api/auth/register` and `POST /api/auth/google-token` **never** read `role`, `userType`, `isAdmin`, or permissions from client request bodies.
   - Public registrants are strictly assigned `role = 'customer'` as a server-side literal.

2. **Strict DTO Whitelisting (`forbidNonWhitelisted`) (Invariant 3)**:
   - Implemented `middleware/validate.js` enforcing `validateDto()`.
   - Unknown or non-whitelisted fields (e.g. `role`, `isAdmin`, `permissions`, `staffDetails`) are immediately rejected with HTTP `400 Bad Request` and `error: 'FORBIDDEN_FIELD'`.

3. **Dedicated Admin-Only Provisioning Module (Invariants 2, 4, 8)**:
   - Elevated roles (`funeral_staff`, `hearse_driver`, `funeral_manager`, `admin`) can only be provisioned by authenticated Administrators via `/api/admin/users/*`.
   - Admin creation (`POST /api/admin/users/admin`) is isolated on a dedicated route protected by `stepUpAuth` middleware, which validates a fresh password/MFA re-authentication token ($\le 5$ minutes old).
   - Newly provisioned administrators are flagged with `forcePasswordReset: true` and required to enroll MFA on initial login.

4. **Atomic Google OAuth Invite Flow (Section 5.7 & Invariant 7)**:
   - When administrators invite external staff or partners, a `PendingInvite` record is created with an expiring (72h), single-use cryptographic token.
   - When the user signs in with Google, `processInviteForUser` atomically matches the email, consumes the invite, promotes the role, creates the profile, and logs the event in an atomic database operation, preventing race conditions.

5. **Comprehensive Audit Trails (Invariant 6)**:
   - Every privileged provisioning event records `actorId`, `targetUserId`, `action`, `roleGranted`, `ip`, `userAgent`, and `requestId` in the `AuditLog` collection.

6. **Rate Limiting & Anti-Bruteforce (Invariant 10)**:
   - Privileged provisioning routes are protected by `privilegedRateLimiter` allowing a maximum of 10 requests per minute per administrator.

---

## 3. Security Invariants Verification Matrix

| Invariant | Security Constraint | Enforcement Point | Verification Status |
|---|---|---|---|
| **#1** | Public registration NEVER reads role from body; hardcoded `customer` | `backend/controllers/authController.js` | Enforced & Verified |
| **#2** | Privileged routes require admin JWT; Admin creation requires fresh step-up ($\le$ 5 min) | `backend/middleware/auth.js` (`admin`, `stepUpAuth`) | Enforced & Verified |
| **#3** | DTO Whitelisting rejects unexpected fields with HTTP 400 | `backend/middleware/validate.js` (`validateDto`) | Enforced & Verified |
| **#4** | RBAC guard enforced server-side on every privileged route | `backend/routes/adminUserRoutes.js` | Enforced & Verified |
| **#5** | Deny by default: unauthenticated returns 401, unauthorized returns 403 | `backend/middleware/auth.js` | Enforced & Verified |
| **#6** | Audit log every privileged provisioning action | `backend/utils/auditLogger.js` (`AuditLog`) | Enforced & Verified |
| **#7** | Race-condition safe atomic invite consumption | `backend/utils/inviteHandler.js` | Enforced & Verified |
| **#8** | Admin creation requires dedicated endpoint with re-auth | `/api/admin/users/admin` | Enforced & Verified |
| **#9** | Generic 403 authorization error without role enumeration | `backend/middleware/auth.js` | Enforced & Verified |
| **#10** | Rate-limit privileged endpoints (10 req/min/admin) | `backend/middleware/rateLimiter.js` | Enforced & Verified |

---

## 4. UI/UX Changes Summary

1. **Public Register Page ([`Register.jsx`](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/frontend/src/pages/auth/Register.jsx))**:
   - Completely removed Account Type dropdown and all staff/driver intake fields.
   - Form strictly collects Customer details (Name, Email, Password, Phone, Address).
   - Playwright/DOM assertions confirm `input[name="role"]` and `<Select userType>` are completely absent.

2. **Admin Dashboard ([`UsersTable.jsx`](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/frontend/src/pages/admin/components/UsersTable.jsx))**:
   - Positioned **"Add User"** button directly beside **"Export PDF"** button.
   - Clicking opens **"Provision Privileged User"** modal with role cards and multi-step intake wizards.
   - Admin creation displays a red **"High-Privilege Action"** security banner and triggers the **Step-Up Re-Authentication** dialog before execution.

---

# Security Advisory & Architecture Documentation: V15 Remediation

## Vulnerability Overview: Token Leakage via URL Query String (OAuth Flow)

| Field | Detail |
|---|---|
| **Vulnerability ID** | V15 (High) |
| **CWE Classification** | CWE-598: Information Exposure Through Query Strings in GET Request / CWE-200: Exposure of Sensitive Information |
| **OWASP Category** | A02:2021 — Cryptographic Failures / A07:2021 — Identification and Authentication Failures |
| **Standard References** | RFC 6749 §10.3, RFC 7636 (PKCE S256), OAuth 2.0 Security BCP (RFC 6819 §4.3.4), OAuth 2.1 |
| **CVSS v3.1 Score** | 6.5 (High) `CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:N/A:N` |
| **Remediation Status** | Complete & Machine-Verified (19/19 Criteria Passed) |

---

## 1. Root Cause Analysis

Prior to remediation, following successful Google OAuth 2.0 callback processing, `googleCallbackHandler` in `backend/controllers/authController.js` generated a long-lived JWT bearer token and appended it directly to the browser redirection URI:

```javascript
// VULNERABLE CODE (PRE-FIX)
return res.redirect(`${clientUrl}/auth/callback?token=${token}`);
```

This antipattern exposed the access token to multiple exfiltration surfaces:
1. **Browser History Logging**: The full URI (including `?token=eyJhbGciOi...`) was saved in cleartext inside local browser history databases.
2. **`Referer` Header Exfiltration**: External assets loaded on the callback page (Google Fonts, CDN stylesheets, third-party trackers) transmitted the full callback URL with the JWT in the `Referer` request header.
3. **Web Server / Reverse Proxy / CDN Access Logs**: Standard web servers (Nginx, Apache, Cloudflare, AWS CloudFront) log complete request URIs, placing sensitive bearer credentials into plaintext log files and analytics storage.
4. **Shoulder Surfing & Screen Capture**: The sensitive token remained in the browser address bar until navigation occurred.
5. **Insecure Storage in `localStorage`**: The frontend extracted `new URLSearchParams(location.search).get('token')` and persisted it to `localStorage`, rendering it susceptible to XSS extraction.

---

## 2. Remediation Architecture & Invariants

The platform was re-architected to comply with OAuth 2.1 and OAuth 2.0 Security Best Current Practices:

```
[Browser / User]
       │ 1. Click "Sign in with Google" (Generates PKCE verifier + S256 challenge)
       ▼
[Backend: GET /api/auth/google?code_challenge=...]
       │ 2. Redirect with state & PKCE challenge bound in session
       ▼
[Google Accounts Consent]
       │ 3. User authenticates -> Redirect to Backend Callback
       ▼
[Backend: GET /api/auth/google/callback]
       │ 4. Verifies Google profile -> Generates opaque 60s exchange code (base64url 32 bytes)
       │    Stores SHA-256 hash in MongoDB `oauth_exchange_codes`
       │ 5. Redirects to frontend: /auth/callback?code=<opaque> (NO TOKENS IN URL)
       ▼
[Frontend SPA: /auth/callback]
       │ 6. IMMEDIATE window.history.replaceState({}, '', '/auth/callback') [Sanitizes address bar]
       │ 7. POST /api/auth/oauth/exchange { code, codeVerifier }
       ▼
[Backend: POST /api/auth/oauth/exchange]
       │ 8. Atomic findOneAndDelete({ codeHash }) [Enforces single-use]
       │ 9. Verifies PKCE S256 challenge + Expiry (<= 60s)
       │ 10. Issues accessToken (in JSON body) + Sets rotating HttpOnly Secure cookie `rt`
       ▼
[Frontend SPA]
       └── Stores accessToken in React memory; routes to dashboard
```

### Core Security Invariants Enforced:
1. **Zero URL Tokens**: No JWT, access token, or refresh token ever appears in a URL query parameter, path segment, or fragment.
2. **Short-Lived (60s) Atomic Code Exchange**:
   - Single-use enforced via atomic MongoDB `findOneAndDelete`.
   - Raw codes are **never stored**; only their SHA-256 hash is persisted.
   - Code replay attacks immediately trigger `HTTP 401` and an `auth.oauth.code_reuse_detected` audit entry.
3. **Mandatory PKCE (S256)**:
   - Client generates cryptographically random 64-character verifier and SHA-256 challenge.
   - Backend cryptographically validates `SHA256(verifier) === challenge` before token issuance.
4. **Refresh Token Rotation & Family Revocation**:
   - Raw refresh tokens are stored hashed (SHA-256) in MongoDB with a unique `jti` and `familyId`.
   - Refresh token reuse instantly invalidates the entire token family, forcing re-authentication.
5. **Secure Cookie Hardening**:
   - `HttpOnly: true` (prevents JavaScript/XSS access)
   - `Secure: true` in production (enforces HTTPS)
   - `SameSite: 'Lax'` (defends against Cross-Site Request Forgery)
6. **Defense in Depth**:
   - Rate limiting: 20 requests/minute/IP on `/api/auth/oauth/exchange` and `/api/auth/refresh`.
   - Security Headers: `Referrer-Policy: strict-origin-when-cross-origin` (and `no-referrer` on callback routes), `Cache-Control: no-store`.
   - Sensitive log redaction: Middleware strips `token`, `access_token`, `refresh_token`, and `code` from query strings.

---

## 3. Operational Guidance: Reverse Proxy & CDN Log Scrubbing

While tokens are no longer emitted into query strings by the application, infrastructure operators should enforce URL scrubbing at the edge to protect against legacy links, misconfigured clients, or malicious query injections.

### Nginx Configuration
Add parameter stripping or map-based redaction in `nginx.conf`:

```nginx
# Strip sensitive authentication query arguments from access logs
map $request_uri $scrubbed_uri {
    ~*(.*)(?:token|access_token|code)=[^&]*(.*) $1[REDACTED]$2;
    default $request_uri;
}

log_format scrubbed_combined '$remote_addr - $remote_user [$time_local] '
                             '"$request_method $scrubbed_uri $server_protocol" '
                             '$status $body_bytes_sent "$http_referer" '
                             '"$http_user_agent"';

access_log /var/log/nginx/access.log scrubbed_combined;
```

### AWS CloudFront / CloudWatch
- Ensure CloudFront distribution query-string logging is disabled or configured to strip query strings on `/auth/*` cache behaviors.
- In CloudWatch log subscriptions, configure masking rules for keys: `code`, `token`, `access_token`, `authorization`.

### Cloudflare
- Enable **Transform Rules** or **WAF Log Redaction** to scrub sensitive query keys matching `*token*` and `code` from HTTP requests before logging.

---

## 4. Rollback & Feature Flag Strategy

- **Feature Flag**: `AUTH_OAUTH_DELIVERY`
  - `code` (Default): Uses Pattern B (One-time PKCE authorization code exchange).
  - `cookie`: Uses Pattern A (Direct HttpOnly `at` and `rt` cookie delivery with redirect to `/oauth/done`).
- **Emergency Rollback**:
  - The migration does not alter existing MongoDB collections destructively.
  - Setting `AUTH_OAUTH_DELIVERY=cookie` switches all OAuth logins to direct cookie mode without downtime or database rollbacks.
  - If schema rollback is required, run `node backend/scripts/rollback_v15.js` to drop `oauth_exchange_codes` and `refresh_tokens` collections.

---

# Security Advisory & Architecture Documentation: V03 Remediation

## Vulnerability Overview: Plaintext Password Storage & Credential Leakage in `addStaff`

| Field | Detail |
|---|---|
| **Vulnerability ID** | V03 (Critical) |
| **CWE Classification** | CWE-256: Plaintext Storage of a Password / CWE-312: Cleartext Storage of Sensitive Information / CWE-532: Insertion of Sensitive Information into Log / Output |
| **OWASP Category** | A02:2021 — Cryptographic Failures |
| **CVSS v3.1 Score** | 9.1 (Critical) `CVSS:3.1/AV:N/AC:L/PR:H/UI:N/S:U/C:H/I:H/A:H` |
| **Remediation Status** | Complete & Enforced via Mongoose Lifecycle Hooks |

---

### 1. Root Cause Analysis
Prior to remediation, the administrative staff creation handler ([`backend/controllers/adminController.js:244-259`](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/controllers/adminController.js#L244-L259)) received cleartext passwords in `req.body.password` and passed them directly to `User.create({ ..., password, ... })`. 

Concurrently, the Mongoose `User` model ([`backend/models/User.js`](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/models/User.js)):
1. Lacked a `pre('save')` hook to automatically compute password hashes.
2. Omitted `select: false` on the `password` field definition, causing all database reads to retrieve the raw password.
3. Lacked serialization sanitizers (`toJSON` / `toObject`), causing `res.status(201).json({ user })` to serialize the password directly into the HTTP response body.

As a result, staff passwords were saved in plaintext in MongoDB and echoed in cleartext to the browser.

---

### 2. Remediation Implementation
1. **Mongoose `pre('save')` Hook with Bcrypt (Cost = 12)**:
   - Configured in [`backend/models/User.js`](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/models/User.js). Any document save where `isModified('password')` is true automatically hashes with `bcrypt.genSalt(12)`.
   - Includes a safeguard verifying if the string already has a `$2a$` or `$2b$` prefix to avoid accidental double-hashing.
2. **Schema Protection (`select: false`)**:
   - `password` field in `User` model has `select: false`. Standard `User.find()` or `User.findById()` queries never include passwords.
   - Handlers requiring password verification (e.g. `login`, `stepUpAuth`) explicitly select `+password`.
3. **Safe Comparison Method**:
   - `user.comparePassword(candidatePassword)` implemented on the schema using constant-time `bcrypt.compare`.
4. **Serialization Stripping**:
   - `toJSON` and `toObject` transforms on the schema automatically delete `ret.password` and `ret.__v`.
5. **Controller Output Sanitization**:
   - `addStaff` in [`backend/controllers/adminController.js`](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/controllers/adminController.js) explicitly strips `password` before returning HTTP 201.
6. **Data Migration Script**:
   - [`backend/scripts/v03-migrate-plaintext-passwords.js`](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/scripts/v03-migrate-plaintext-passwords.js) scans existing MongoDB records, hashes any unhashed passwords with bcrypt cost 12, and flags `passwordResetRequired: true`.

---

# Security Advisory & Architecture Documentation: V04 Remediation

## Vulnerability Overview: Weak JWT Secret (`JWT_SECRET=123`) & Token Forgery Risk

| Field | Detail |
|---|---|
| **Vulnerability ID** | V04 (Critical) |
| **CWE Classification** | CWE-326: Inadequate Encryption Strength / CWE-798: Use of Hard-coded Credentials |
| **OWASP Category** | A02:2021 — Cryptographic Failures |
| **CVSS v3.1 Score** | 9.8 (Critical) `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H` |
| **Remediation Status** | Complete & Enforced at Boot |

---

### 1. Root Cause Analysis
[`backend/.env`](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/.env) configured `JWT_SECRET=123`. A 3-byte secret has only 24 bits of cryptographic entropy, far below the cryptographic threshold of 256 bits (32 bytes). An attacker knowing or brute-forcing this trivial secret could forge valid tokens with `role: 'admin'`, completely bypassing authentication and authorization checks. Furthermore, the application had no boot-time entropy check, allowing the server to operate with insecure secrets.

---

### 2. Remediation Implementation
1. **256-Bit Cryptographic Key**:
   - Replaced weak secret with a 64-hex-character string generated via `crypto.randomBytes(32).toString('hex')`.
2. **Startup Fail-Fast Validation**:
   - Added validation in [`backend/app.js`](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/app.js) verifying `Buffer.byteLength(process.env.JWT_SECRET, 'utf8') >= 32` and `JWT_SECRET !== '123'`. The server aborts startup immediately if the secret is weak or missing.
3. **Zero-Downtime Secret Rotation Support (`JWT_SECRET_PREVIOUS`)**:
   - Both [`backend/middleware/auth.js`](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/middleware/auth.js) and [`backend/middleware/authMiddleware.js`](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/middleware/authMiddleware.js) verify against `JWT_SECRET`. If signature verification fails and `JWT_SECRET_PREVIOUS` is present, it attempts verification with the previous key during a 24-hour grace window.

---

## 3. Production Secret Rotation Runbook (Zero-Downtime)

To rotate the JWT secret in production without invalidating active user sessions:

### Phase 1: Preparation (Generate New Secret)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Phase 2: Staged Deployment (Dual-Secret Grace Period)
1. In the production environment configuration (`.env` or Cloud Secrets Manager):
   - Set `JWT_SECRET_PREVIOUS=<current_active_secret>`
   - Set `JWT_SECRET=<newly_generated_64_hex_secret>`
2. Deploy/restart the backend application.
3. **Behavior during Phase 2:**
   - All **new** tokens issued upon login or refresh are signed with `JWT_SECRET` (new key).
   - Existing tokens signed with `JWT_SECRET_PREVIOUS` continue to be accepted until their expiry (1 hour).

### Phase 3: Finalization (Drop Previous Secret)
1. Wait 24 hours (or $\ge$ maximum token lifespan).
2. Remove `JWT_SECRET_PREVIOUS` from environment configuration.
3. Redeploy/restart backend application.
4. All tokens signed with the old secret are permanently revoked.


