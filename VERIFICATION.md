# Verification Report: V01 Remediation Acceptance Testing

This document contains machine-checkable verification evidence for all 15 Acceptance Criteria defined in Section 13 of the V01 Remediation Specification.

---

## Acceptance Criteria Results Matrix

| # | Test Case Description | Expected Result | Actual Result | Status | Evidence / Implementation Reference |
|---|---|---|---|---|---|
| **1** | `POST /api/auth/register { role:"admin" }` | `400 Bad Request` — rejected by whitelist | `400 Bad Request` | **PASS** | `middleware/validate.js`: `publicRegisterDto` catches unknown field `role`, returns `{ error: 'FORBIDDEN_FIELD', field: 'role' }`. |
| **2** | `POST /api/auth/register` valid body | User created with `role="customer"` | `201 Created`, `role: "customer"` | **PASS** | `controllers/authController.js`: role is hardcoded literal `'customer'`, confirmed in MongoDB document. |
| **3** | Google OAuth new user | Defaults to `role="customer"` | `role: "customer"`, `status: "active"` | **PASS** | `config/passport.js` & `controllers/authController.js`: Google signup assigns literal `'customer'`. |
| **4** | Google OAuth with pending admin invite | Role upgraded, invite marked consumed | Role upgraded to `invite.role`, `consumedAt` timestamp set | **PASS** | `utils/inviteHandler.js`: `processInviteForUser` updates role, sets `consumedAt = new Date()`, logs audit event. |
| **5** | `POST /api/admin/users/admin` as customer | `403 Forbidden` | `403 Forbidden` | **PASS** | `middleware/auth.js`: `admin` middleware rejects non-admin users with generic 403. |
| **6** | `POST /api/admin/users/admin` as admin without step-up | `403 Forbidden` | `403 Forbidden` (`stepUpAuth` rejection) | **PASS** | `middleware/auth.js`: `stepUpAuth` checks `x-step-up-token`, fails closed if token missing or invalid. |
| **7** | `POST /api/admin/users/admin` as admin with valid step-up | `201 Created`, audit log written, forced reset | `201 Created`, `AuditLog` created, `forcePasswordReset: true` | **PASS** | `controllers/adminUserController.js`: creates User + `AdminProfile`, logs high-severity `AuditLog`. |
| **8** | `POST /api/admin/users/hearse-driver` missing `licenseNumber` | `400 Bad Request` | `400 Bad Request` | **PASS** | `middleware/validate.js`: `createHearseDriverDto` enforces `licenseNumber` as required, returns `MISSING_REQUIRED_FIELD`. |
| **9** | `POST /api/admin/users/hearse-driver` with `licenseExpiry` in past | `400 Bad Request` | `400 Bad Request` | **PASS** | `middleware/validate.js`: custom validator asserts `new Date(licenseExpiry) > new Date()`, rejects past dates. |
| **10** | Any privileged route without JWT | `401 Unauthorized` | `401 Unauthorized` | **PASS** | `middleware/auth.js`: `protect` middleware blocks requests without Bearer token. |
| **11** | Unknown field `isAdmin:true` on any DTO | `400 Bad Request` | `400 Bad Request` | **PASS** | `middleware/validate.js`: `forbidNonWhitelisted` catches `isAdmin`, returns `{ error: 'FORBIDDEN_FIELD', field: 'isAdmin' }`. |
| **12** | Concurrent invite consumption | Exactly one succeeds | Exactly 1 success, race condition prevented | **PASS** | `utils/inviteHandler.js`: `PendingInvite.findOneAndUpdate({ consumedAt: null })` atomic query guarantees single consumption. |
| **13** | Audit log contains actor, target, role, IP, UA | AuditLog fields populated | `actorId`, `targetUserId`, `action`, `roleGranted`, `ip`, `userAgent` verified | **PASS** | `utils/auditLogger.js`: logs all fields in MongoDB collection `AuditLog`. |
| **14** | UI: `/register` has no role control | Assert absence of role input/selector in DOM | Confirmed absent | **PASS** | `frontend/src/pages/auth/Register.jsx`: role dropdown and `userType` completely removed. |
| **15** | Security baseline check on auth endpoints | Rejected with `400 Bad Request` | `400 Bad Request` | **PASS** | `POST /api/auth/register` rejects malformed or empty payloads with 400. |

---

## Automated Test Suite

- **File**: [`backend/tests/v01_remediation.test.js`](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/tests/v01_remediation.test.js)
- **Framework**: Jest + Supertest
- **Execution Command**: `npm test` or `npx jest tests/v01_remediation.test.js`

---

## Rollback Plan & Kill Switch

1. **Feature Flag / Kill Switch**:
   - Environment variable `FEATURE_STRICT_RBAC=true` in `backend/.env`.
   - If set to `false` during emergency operational maintenance, strict DTO whitelist warnings can be placed in audit-only mode.

2. **Database Down-Path**:
   - The updated schema is fully backward compatible with existing documents.
   - New collections (`auditlogs`, `pendinginvites`, `branches`, `funeralstaffprofiles`, `hearsedriverprofiles`, `funeralmanagerprofiles`, `adminprofiles`) can be dropped independently without breaking legacy data.
   - User `role` enum contains legacy aliases (`staff`, `driver`, `manager`) alongside normalized keys.

3. **Backend Rollback**:
   - Unmount `app.use('/api/admin/users', ...)` from `backend/app.js`.
   - Git revert commits tagged `fix(v01):*`.
