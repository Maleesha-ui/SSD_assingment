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
