# DETECTION.md — Vulnerability V15: Token Leakage via URL Query String (OAuth Flow)

**Audit Date:** 2026-09-25  
**Target Application:** Funeral Services Management Platform  
**Auditor:** Senior Application Security Engineer (Google Antigravity)  
**Vulnerability Classification:** CWE-598 (Information Exposure Through Query Strings in GET Request) / CWE-200 (Exposure of Sensitive Information) / OAuth 2.0 Security Best Current Practice (RFC 6819 §4.3.4, OAuth 2.1 BCP)  
**Severity:** HIGH (CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:N/A:N — Base Score: 6.5)

---

## 1. Executive Summary

A comprehensive static and dynamic security assessment was conducted to evaluate the presence of **Vulnerability V15 (Token Leakage via URL Query String in OAuth Flow)**.

The investigation confirmed that the backend's Google OAuth 2.0 callback handler (`googleCallbackHandler`) issues a long-lived JSON Web Token (JWT) and directly appends it as a cleartext URL query parameter (`?token=...`) when redirecting the user's browser back to the Single Page Application (SPA) frontend. The frontend SPA (`AuthCallback.jsx` and `CompleteProfile.jsx`) parses this sensitive bearer credential from `window.location.search` via `new URLSearchParams`, subsequently persisting it to `localStorage`.

This pattern exposes user JWT bearer tokens across multiple high-risk exfiltration vectors:
1. Browser History logs (`window.history`).
2. Web server, reverse proxy, load balancer, and CDN access logs.
3. Outbound `Referer` headers when loading third-party assets or external links.
4. Shoulder surfing, screen recording, and accidental URL sharing.
5. Corporate DLP / proxy cache inspection.

---

## 2. Static Code Inspection (Section 3.1 Requirements)

Every required pattern was scanned across the full repository codebase. Below is the verified file, line, and code evidence.

### 2.1 Pattern: `?token=`
**Matches Found:** 2

1. **`backend/controllers/authController.js` (Line 307)**
   ```javascript
   if (!user.isProfileComplete) {
     return res.redirect(`${clientUrl}/complete-profile?token=${token}&isNew=true`);
   }
   ```
2. **`backend/controllers/authController.js` (Line 310)**
   ```javascript
   return res.redirect(`${clientUrl}/auth/callback?token=${token}`);
   ```

### 2.2 Pattern: `&token=`
**Matches Found:** 0 (clean; all token parameters are passed as first parameter `?token=`).

### 2.3 Pattern: `access_token=` and `accessToken=`
**Matches Found:** 0 in application routing/query strings. `accessToken` is only used as a function parameter in the Passport strategy callback signature:
- `backend/config/passport.js:17`: `async (req, accessToken, refreshToken, profile, done) => { ... }`

### 2.4 Pattern: `res.redirect(...token...)` and `res.redirect(...jwt...)`
**Matches Found:** 2 (identical to §2.1 above)
- `backend/controllers/authController.js:307`: `res.redirect(`${clientUrl}/complete-profile?token=${token}&isNew=true`)`
- `backend/controllers/authController.js:310`: `res.redirect(`${clientUrl}/auth/callback?token=${token}`)`

### 2.5 Pattern: `window.location = ...token...` / `location.href = ...token`
**Matches Found:** 0 direct assignments of tokens.
`location.href` and `window.location` are used for:
- `frontend/src/components/auth/GoogleAuthButton.jsx:39`: `window.location.href = `${backendBaseUrl}/api/auth/google`;`
- `frontend/src/context/AuthContext.jsx:56, 62`: `window.location.href = '/login?expired=true';`
- `frontend/src/services/api.js:42`: `window.location.href = '/login?expired=true';`

### 2.6 Pattern: `new URLSearchParams(...).set('token', ...)`
**Matches Found:** 0 server-side or client-side URL builders setting `token`. The server constructs the URL via string interpolation (`?token=${token}`).

### 2.7 Pattern: `history.pushState(...token` / `replaceState`
**Matches Found:** 0. Neither `pushState` nor `replaceState` is currently utilized to scrub or sanitize the leaked token from the browser address bar upon arrival.

### 2.8 Pattern: OAuth Callback Handlers
- **Route Definition:** `backend/routes/authRoutes.js:38-45`
  ```javascript
  router.get(
    '/google/callback',
    passport.authenticate('google', {
      failureRedirect: `${clientUrl}/login?error=google_auth_failed`,
      session: false,
    }),
    googleCallbackHandler
  );
  ```
- **Handler Implementation:** `backend/controllers/authController.js:296-315`
  ```javascript
  exports.googleCallbackHandler = async (req, res) => {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    try {
      const user = req.user;
      if (!user) {
        return res.redirect(`${clientUrl}/login?error=auth_failed`);
      }

      const token = generateToken(user._id, user.role);

      if (!user.isProfileComplete) {
        return res.redirect(`${clientUrl}/complete-profile?token=${token}&isNew=true`);
      }

      return res.redirect(`${clientUrl}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Google callback error:', error);
      return res.redirect(`${clientUrl}/login?error=server_error`);
    }
  };
  ```

### 2.9 Cookies Configured with Insecure Attributes
- **Scan Result:** No authentication cookies are currently set by the backend (`res.cookie` is never called).
- Session middleware in `backend/app.js:47-55` uses `secure: process.env.NODE_ENV === 'production'`, but no JWT or access/refresh credentials are delivered via cookies.

### 2.10 Frontend Routes Reading `new URLSearchParams(window.location.search).get('token')`
**Matches Found:** 2 active routes

1. **`frontend/src/pages/auth/AuthCallback.jsx` (Lines 17-39):**
   ```javascript
   const params = new URLSearchParams(location.search);
   const token = params.get('token');
   ...
   const response = await api.get('/auth/me', {
     headers: { Authorization: `Bearer ${token}` }
   });
   applyAuthSession(token, user);
   ```
2. **`frontend/src/pages/auth/CompleteProfile.jsx` (Lines 62-77):**
   ```javascript
   const params = new URLSearchParams(location.search);
   const urlToken = params.get('token');
   const activeToken = urlToken || token || localStorage.getItem('token');
   ...
   if (urlToken) {
     applyAuthSession(urlToken, profile);
   }
   ```

---

## 3. Runtime Confirmation & Proof of Concept (PoC)

A dedicated reproducible PoC was developed in `poc/reproduce_v15_leak.js` and executed against the live application runtime and database.

### 3.1 PoC Execution Log
```
=== V15 Token Leakage via URL Query String PoC ===
[+] Connected to MongoDB
[+] Created test victim user: v15_victim@example.com
[!] Captured Redirect URL from googleCallbackHandler:
http://localhost:3000/auth/callback?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhYjY5NGM2OTI2MGFhODA5YmU3NjI5NiIsInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTc5MDM1MDUzNSwiZXhwIjoxNzkwMzU0MTM1fQ.uS8VmIaFfohMZ2f9YNhdqlIrgtjgoB4MCPnvEpZ1QPE
[!] VULNERABILITY CONFIRMED: JWT token present in URL query string!
    Query Param "token": eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhYjY5NGM2OTI2MGFhODA5YmU3NjI5NiIsInJvbGUiOiJjdXN0b21lciIsImlhdCI6MTc5MDM1MDUzNSwiZXhwIjoxNzkwMzU0MTM1fQ.uS8VmIaFfohMZ2f9YNhdqlIrgtjgoB4MCPnvEpZ1QPE
[+] Decoded Leaked Token: {"id":"6ab694c69260aa809be76296","role":"customer","iat":1790350535,"exp":1790354135}
Registering routes...
Routes registered successfully
MongoDB Connected: ac-0huokwy-shard-00-01.l6f8mrt.mongodb.net
GET /api/auth/me 200 733.075 ms - 153
[+] Calling GET /api/auth/me with leaked token: HTTP 200
    Response User Data: {"_id":"6ab694c69260aa809be76296","name":"V15 Victim User","email":"v15_victim@example.com","role":"customer","status":"active","isProfileComplete":true}
[+] Written evidence to poc/redirect_capture.txt
[+] PoC execution complete. VERDICT: VULNERABLE.
```

### 3.2 Evidence Artifact
Artifact saved to [`poc/redirect_capture.txt`](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/poc/redirect_capture.txt).

---

## 4. Leak Vector Analysis

| Vector | Exploitation Mechanism | Impact in Current Codebase |
|---|---|---|
| **Browser History** | Browser persists complete URL in navigation history | Any person or software with access to browser history can extract the token and impersonate the user until expiry (1 hour). |
| **Referer Headers** | SPA pages without `Referrer-Policy: no-referrer` leak full URL to external origins | `index.html` loads Google Fonts (`fonts.googleapis.com`), and components load Unsplash assets (`images.unsplash.com`). No Referrer-Policy is defined. |
| **Server & Proxy Logs** | Intermediary proxies, CDNs, and server access logs log HTTP GET request URIs | Every request to the frontend server logs the full query string containing the JWT. |
| **Address Bar / Social Engineering** | Full token remains visible in the browser address bar | Users taking screenshots, screen shares, or copying/pasting URLs directly leak their session token. |
| **LocalStorage Persistence** | Frontend extracts URL token and writes to `localStorage` | Vulnerable to Cross-Site Scripting (XSS) extraction. |

---

## 5. Verdict

**Verdict:** ✅ **VULNERABLE**

The codebase unambiguously exhibits Vulnerability V15. Remediation must be planned and executed in accordance with Section 4 and Section 5 of the remediation prompt.
