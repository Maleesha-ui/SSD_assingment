# PLAN.md — V15 Remediation: Token Leakage via URL Query String (OAuth Flow)

**Target Issue:** V15 (High) — Leaking Bearer JWT tokens in OAuth redirect URL query string (`?token=...`)  
**Architecture:** MERN Stack (React 18 Vite SPA + Node.js/Express + MongoDB Mongoose)  
**Standard Compliance:** OAuth 2.0 Security BCP (RFC 6819 §4.3.4), RFC 7636 (PKCE), OAuth 2.1 Draft, OWASP ASVS v4.0 §3.4.1  
**Author:** Senior Application Security Engineer (Google Antigravity)  
**Status:** PROPOSED — PENDING APPROVAL

---

## 1. Architectural Decision: Pattern B with Dual Delivery Support

### 1.1 Decision Rationale
The deployment topology consists of a React Vite SPA running on origin `http://localhost:3000` (port 3000) communicating with an Express REST API backend running on origin `http://localhost:5000` (port 5000). In production cloud environments (e.g. Vercel/Netlify for frontend and Railway/AWS for API), cross-origin and cross-subdomain separation is common. 

To ensure complete compliance with Section 5 and Section 12 acceptance criteria, we implement **Pattern B (One-Time PKCE Authorization Code Exchange)** as the default cross-origin exchange mechanism, while providing first-class support for **Pattern A (HttpOnly Secure Cookie delivery)** selectable via the feature flag `AUTH_OAUTH_DELIVERY=code|cookie`.

In both modes:
- **Zero tokens appear in URLs:** No JWT, no access token, and no refresh token ever appears in query parameters, path segments, or URL fragments.
- In Pattern B, the URL carries only a transient, single-use, 32-byte opaque code (entropy ≥ 256 bits, TTL 60 seconds).
- The SPA immediately invokes `window.history.replaceState({}, '', '/auth/callback')` to wipe the `?code=` query parameter prior to DOM render.
- The exchange code is stored only as a SHA-256 hash in MongoDB and atomically consumed via `findOneAndDelete`.
- Refresh tokens are strictly delivered via `HttpOnly`, `Secure`, `SameSite=Lax` cookies, with automatic reuse detection and cryptographic family invalidation.

---

## 2. File Tree & Impact Scope

```
SSD_assingment/
├── DETECTION.md                         [Created] Static & dynamic vulnerability audit
├── PLAN.md                              [Current] Architectural remediation plan
├── SECURITY.md                          [Update] V15 root cause, security invariants, operational guides
├── VERIFICATION.md                      [Deliverable] Section 12 test verification matrix
├── poc/
│   ├── reproduce_v15_leak.js            [Created] Runnable PoC script reproducing leak
│   └── redirect_capture.txt             [Created] Raw redirect capture proving leak
├── backend/
│   ├── models/
│   │   ├── OAuthExchangeCode.js         [New] Schema for one-time exchange codes (TTL: 60s, hashed)
│   │   ├── RefreshToken.js              [New] Schema for rotating refresh tokens (hashed, family tracking)
│   │   └── AuditLog.js                  [Update] Ensure action index and OAuth security event tracking
│   ├── controllers/
│   │   └── authController.js            [Update] Rewrite googleCallbackHandler, add oauthExchange, refresh, logout
│   ├── routes/
│   │   └── authRoutes.js                [Update] Add /oauth/exchange, /refresh, /logout, enforce POST-only (405 for GET)
│   ├── middleware/
│   │   ├── rateLimiter.js               [New] Lightweight sliding-window rate limiter for exchange & refresh
│   │   └── securityHeaders.js           [New] Referrer-Policy, Cache-Control, log redaction middleware
│   ├── app.js                           [Update] Mount cookie parser, security headers, logger redactor
│   ├── tests/
│   │   ├── v01_remediation.test.js      [Preserve] Keep existing 15 tests green
│   │   └── v15_remediation.test.js      [New] Complete Section 12 acceptance test suite (19 criteria)
│   └── scripts/
│       └── migrate_v15_indexes.js       [New] Safe idempotent MongoDB index migration script
└── frontend/
    ├── index.html                       [Update] Add <meta name="referrer" content="strict-origin-when-cross-origin">
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx          [Update] Secure in-memory token state, silent cookie refresh, no URL token
    │   ├── components/
    │   │   └── auth/
    │   │       └── GoogleAuthButton.jsx [Update] Generate PKCE verifier/challenge before OAuth redirect
    │   ├── pages/
    │   │   └── auth/
    │   │       ├── AuthCallback.jsx     [Update] Pattern B: replaceState immediate sanitization, POST exchange
    │   │       ├── OAuthDone.jsx        [New] Pattern A: silent page for cookie hydration
    │   │       └── CompleteProfile.jsx  [Update] Remove token from query parameters; rely on authenticated session
    │   └── App.jsx                      [Update] Register /oauth/done route
```

---

## 3. MongoDB Schema & Index Migrations

### 3.1 `oauth_exchange_codes` Collection
```javascript
const oauthExchangeCodeSchema = new mongoose.Schema({
  codeHash: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  clientId: {
    type: String,
    required: true,
  },
  redirectUri: {
    type: String,
    required: true,
  },
  codeChallenge: {
    type: String,
    required: true,
  },
  codeChallengeMethod: {
    type: String,
    enum: ['S256'],
    default: 'S256',
  },
  state: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60, // TTL index: automatically deleted after 60 seconds
  },
  consumedAt: {
    type: Date,
    default: null,
  },
});
```
**Security Invariants:**
- Raw `exchange_code` is **never stored**; only `SHA-256(rawCode)` is persisted.
- Atomic consumption via `OAuthExchangeCode.findOneAndDelete({ codeHash })`.

### 3.2 `refresh_tokens` Collection
```javascript
const refreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  jti: {
    type: String,
    required: true,
    unique: true,
  },
  tokenHash: {
    type: String,
    required: true,
    unique: true,
  },
  familyId: {
    type: String,
    required: true,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  revokedAt: {
    type: Date,
    default: null,
  },
  replacedByJti: {
    type: String,
    default: null,
  },
  ip: String,
  userAgent: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // MongoDB TTL
refreshTokenSchema.index({ familyId: 1 });
```
**Security Invariants:**
- Raw refresh token is **never stored**; only `SHA-256(rawRefreshToken)` is persisted.
- If a revoked token within a `familyId` is submitted, the **entire token family is revoked immediately**, and an audit event is triggered.

---

## 4. API Endpoints & Contract Specification

| Method | Endpoint | Access | Purpose & Security Controls |
|---|---|---|---|
| `GET` | `/api/auth/google` | Public | Generates OAuth `state` + accepts client PKCE challenge, stores in session, redirects (302) to Google. |
| `GET` | `/api/auth/google/callback` | Public (Google) | Verifies Google auth. If `AUTH_OAUTH_DELIVERY=cookie`, sets HttpOnly cookies and redirects to `/oauth/done`. If `code`, generates 60s single-use `exchange_code`, stores SHA-256 hash, redirects to `/auth/callback?code=<opaque>`. |
| `POST` | `/api/auth/oauth/exchange` | Public | Body: `{ code, codeVerifier, redirectUri }`. Atomically consumes code (`findOneAndDelete`), verifies PKCE S256, matches `redirect_uri`. Returns `200 { accessToken, user, isProfileComplete }` + sets HttpOnly `rt` cookie. Double consumption yields `401` + `auth.oauth.code_reuse_detected` audit log. |
| `GET` | `/api/auth/oauth/exchange` | Public | Explicitly returns `405 Method Not Allowed`. |
| `POST` | `/api/auth/refresh` | Cookie / Body | Reads `rt` cookie or body refresh token. Validates hash and family. Revokes old `jti`, issues new `jti`, sets rotated `rt` cookie. If reused token detected: revokes family and returns `401`. |
| `POST` | `/api/auth/logout` | Authenticated | Clears `at` and `rt` cookies, revokes active refresh family in MongoDB. Returns `204 No Content`. |
| `GET` | `/api/auth/me` | Authenticated | Supports both `Authorization: Bearer <token>` and `at` cookie. Returns sanitized profile. |

---

## 5. Frontend & UI Flow Architecture

### 5.1 Pattern B Exchange Flow (`/auth/callback`)
```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Browser
    participant SPA as React SPA (/auth/callback)
    participant API as Backend API
    participant Google as Google IdP

    User->>SPA: Click "Continue with Google"
    SPA->>SPA: Generate PKCE (verifier + S256 challenge), store verifier in sessionStorage
    SPA->>API: GET /api/auth/google?code_challenge=...&redirect_uri=...
    API->>Google: 302 Redirect to Google OAuth consent
    Google->>API: GET /api/auth/google/callback?code=...&state=...
    API->>API: Verify Google profile, create SHA-256 hashed 60s exchange_code
    API->>Browser: 302 Redirect to /auth/callback?code=<opaque_32_bytes>
    Browser->>SPA: Load /auth/callback?code=<opaque>
    SPA->>SPA: window.history.replaceState({}, '', '/auth/callback') [Wipe from address bar]
    SPA->>API: POST /api/auth/oauth/exchange { code, codeVerifier }
    API->>API: findOneAndDelete(codeHash) + Verify PKCE S256 + Issue JWT
    API-->>SPA: 200 { accessToken, user, isProfileComplete } + Set-Cookie: rt (HttpOnly)
    SPA->>SPA: Store accessToken in React memory only; navigate to dashboard
```

### 5.2 Pattern A Silent Cookie Hydration (`/oauth/done`)
```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Browser
    participant SPA as React SPA (/oauth/done)
    participant API as Backend API

    Browser->>SPA: Load /oauth/done (NO query params, NO fragment)
    SPA->>API: GET /api/auth/me (Cookie: at=...)
    API-->>SPA: 200 { user profile }
    SPA->>SPA: Hydrate user context; navigate to /dashboard
```

### 5.3 CompleteProfile Sanitization
- `frontend/src/pages/auth/CompleteProfile.jsx` currently extracts `params.get('token')`.
- This is completely removed. `CompleteProfile` will rely strictly on the active in-memory authenticated session or `useAuth()`.

---

## 6. Hardening & Security Policies

1. **Cookie Configuration:**
   - Name: `rt` (Refresh Token) and `at` (Access Token in cookie mode).
   - Attributes: `HttpOnly: true; Secure: ${NODE_ENV === 'production'}; SameSite: 'Lax'; Path: '/'` (or `/api/auth`).
2. **Referrer-Policy:**
   - Injected in HTTP headers: `strict-origin-when-cross-origin`.
   - Set in `frontend/index.html`: `<meta name="referrer" content="strict-origin-when-cross-origin">`.
   - On OAuth callback routes: `no-referrer`.
3. **Cache-Control:**
   - `no-store, no-cache, must-revalidate, proxy-revalidate` on all `/api/auth/*` routes.
4. **Log Redaction:**
   - Express logging middleware scrubs `token`, `access_token`, `refresh_token`, `code`, `id_token` from query parameters and request headers.
5. **Rate Limiting:**
   - `/api/auth/oauth/exchange` and `/api/auth/refresh` restricted to 20 requests per minute per IP.
6. **CORS:**
   - Explicit origin allowlist (`http://localhost:3000`, `http://127.0.0.1:3000`, `CLIENT_URL`) with `credentials: true`.

---

## 7. Rollout, Rollback & Kill Switch Strategy

- **Feature Flag:** `AUTH_OAUTH_DELIVERY`
  - Values: `code` (Pattern B - default) | `cookie` (Pattern A).
  - Setting `AUTH_OAUTH_DELIVERY=cookie` switches callback handling immediately to direct HttpOnly cookie delivery.
- **Rollback Plan:**
  - If a runtime regression occurs, `AUTH_OAUTH_DELIVERY` can be flipped dynamically without modifying schemas.
  - The MongoDB collections `oauth_exchange_codes` and `refresh_tokens` are non-breaking additions that do not modify existing user collections.
  - Index rollback script provided in `backend/scripts/rollback_v15.js`.

---

## 8. Acceptance Verification Suite (Section 12 Mapping)

| # | Acceptance Test Case | Target Assertion |
|---|---|---|
| 1 | `grep -R "?token=" src/` after fix | Zero matches across codebase |
| 2 | OAuth Flow Final URL | Zero tokens/JWTs in URL |
| 3 | Pattern A Cookie Delivery | `Set-Cookie: at=...; HttpOnly; Secure; SameSite=Lax` |
| 4 | Pattern B Opaque Code | `?code=<opaque>`, length ≤ 64 chars, not a JWT |
| 5 | `POST /auth/oauth/exchange` Valid Code | `200 { accessToken }`, no refresh in JSON body |
| 6 | Code Replay / Reuse Detection | 2nd call returns `401`, triggers `auth.oauth.code_reuse_detected` |
| 7 | Code Expiry after 60s | Returns `401 Unauthorized` |
| 8 | Tampered PKCE Verifier | Returns `401 Unauthorized` |
| 9 | Mismatched Redirect URI | Returns `401 Unauthorized` |
| 10 | `GET /auth/oauth/exchange` | Returns `405 Method Not Allowed` |
| 11 | Referrer Isolation | No token leaked via Referer header |
| 12 | Access Log Redaction | Logs redact `token`, `code`, `access_token` query params |
| 13 | Refresh Token Rotation | Old `jti` revoked, new `jti` issued |
| 14 | Refresh Token Family Reuse | Reusing old token revokes entire family, returns `401` |
| 15 | Storage Scanning | No JWT stored in `localStorage` or `sessionStorage` in cookie mode |
| 16 | History Sanitization | `window.history.replaceState` called before first paint |
| 17 | Security Headers Check | `Referrer-Policy`, `Cache-Control: no-store`, `SameSite` flags |
| 18 | Mongo Exchange Code Deletion | Atomically consumed, no leftover code in DB |
| 19 | Mongo Refresh Token Hashing | Only `tokenHash` stored; raw token never in DB |
