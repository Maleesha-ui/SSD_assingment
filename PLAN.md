# PLAN.md — Remediation Plan for Vulnerability V10: Missing Authorization on User Profiles & Directory

**Target Application:** Funeral Services Management Platform  
**Target Vulnerability:** V10 (OWASP A01:2021 — Broken Access Control / Missing Authorization / IDOR)  
**Lead Auditor & Remediation Architect:** Senior Application Security Engineer (Google Antigravity)  
**Status:** PROPOSED — PENDING APPROVAL  

---

## 1. Scope & Objective

Remediate missing authorization, horizontal/vertical IDOR, existence enumeration, and unconstrained directory access across `/api/users*` endpoints. Ensure strict adherence to the Principle of Least Privilege (PoLP) and defense-in-depth security invariants across authentication, authorization, input validation, serialization, and audit logging layers.

---

## 2. Authorization Matrix (Confirming Section 5.1)

| Route | Verb | Unauthenticated | `customer` | `funeral_staff` / `hearse_driver` | `manager` / `funeral_manager` | `admin` |
|---|---|---|---|---|---|---|
| `/api/users` | `GET` | 401 | 403 | 403 | 200 (Scoped) | 200 (Full) |
| `/api/users/me` | `GET` | 401 | 200 (Self-scoped) | 200 (Self-scoped) | 200 (Self-scoped) | 200 (Full) |
| `/api/users/:userId` (self) | `GET` | 401 | 200 (Self-scoped) | 200 (Self-scoped) | 200 (Self-scoped) | 200 (Full) |
| `/api/users/:userId` (other) | `GET` | 401 | 403 | 403 | 200 (Manager-scoped) | 200 (Full) |
| `/api/users/:userId` (self) | `PUT`/`PATCH` | 401 | 200 (Self-DTO whitelist) | 200 (Self-DTO whitelist) | 200 (Self-DTO whitelist) | 200 (Admin DTO) |
| `/api/users/:userId` (other) | `PUT`/`PATCH` | 401 | 403 | 403 | 403 | 200 (Admin DTO) |
| `/api/users/:userId` | `DELETE` | 401 | 403 | 403 | 403 | 204 (Soft/Hard Delete) |
| `/api/users/:userId/role` | `PATCH`/`PUT` | 401 | 403 | 403 | 403 | 200 (+ Step-Up Token) |
| `/api/users/update-profile` *(Compat)* | `PUT` | 401 | 200 (Self-DTO whitelist) | 200 (Self-DTO whitelist) | 200 (Self-DTO whitelist) | 200 (Self-DTO whitelist) |
| `/api/users/delete-account` *(Compat)* | `DELETE` | 401 | 200 (Self) | 200 (Self) | 200 (Self) | 200 (Self) |

### Uniformity & Anti-Enumeration Invariants
1. If caller does not possess self-ownership or role clearance (`admin` or `manager`), the request is rejected immediately at the middleware boundary with `403 Forbidden` (`{"message":"Forbidden: Insufficient privileges."}`).
2. Non-existent IDs requested by unauthorized users return `403 Forbidden` (identical timing and payload), eliminating differential existence oracles.
3. Only authorized actors (`admin`/`manager`) receive a `404 Not Found` when requesting an ID that does not exist in the database.
4. Non-ObjectId values on any `:userId` parameter return `400 Bad Request` (`{"message":"Invalid user ID format."}`) before reaching Mongoose queries.

---

## 3. Architecture & Component Changes

```mermaid
flowchart TD
    Client[HTTP Request] --> RateLimiter[User Rate Limiter: 60/min Auth, 10/min Unauth]
    RateLimiter --> Protect[protect: JWT Verification]
    
    Protect --> RouteCheck{Route Target}
    
    RouteCheck -->|GET /api/users| AuthorizeAdminManager[authorize('admin', 'manager')]
    AuthorizeAdminManager --> QueryValidator[validateDirectoryQuery: Whitelist & Pagination Cap]
    QueryValidator --> GetAllUsers[getAllUsers Handler]
    GetAllUsers --> AuditDir[AuditLog: user.directory.read]
    AuditDir --> SerializeDir[serializeUser: Scoped per Role]
    SerializeDir --> Response200A[200 OK Paginated]
    
    RouteCheck -->|GET /api/users/:userId| RequireSelfOrRole[requireSelfOrRole('admin', 'manager')]
    RequireSelfOrRole -->|Invalid ObjectId| Resp400[400 Bad Request]
    RequireSelfOrRole -->|Not Self & Not Role| Resp403[403 Forbidden Uniform]
    RequireSelfOrRole -->|Valid Self or Role| GetUser[getUserProfile Handler]
    GetUser --> AuditRead[If actor !== target: AuditLog user.profile.read.other]
    AuditRead --> SerializeProfile[serializeUser: Scoped per Role]
    SerializeProfile --> Response200B[200 OK Profile]

    RouteCheck -->|PUT /api/users/:userId| RequireSelfOrRolePut[requireSelfOrRole('admin', 'manager')]
    RequireSelfOrRolePut --> ValidateDtoPut[validateDto: Strict DTO Whitelist]
    ValidateDtoPut --> UpdateUser[updateUserProfile Handler]
    UpdateUser --> AuditUpdate[AuditLog: user.profile.update]
    AuditUpdate --> Response200C[200 OK Updated]
```

### 3.1 Middleware Components
1. **`requireSelfOrRole(...roles)` (`backend/middleware/auth.js`):**
   - Validates `mongoose.Types.ObjectId.isValid(req.params.userId)` -> returns `400 Bad Request`.
   - Checks `req.user && String(req.user._id) === String(req.params.userId)` (`isSelf`).
   - Checks `req.user && roles.includes(req.user.role)` (`hasRole`).
   - If neither, returns `403 Forbidden`.
   - Attaches `req.targetUserId = req.params.userId; req.isSelf = isSelf;`.
2. **`userRateLimiter` (`backend/middleware/rateLimiter.js`):**
   - Sliding window limiter on `/api/users*`: 60 req/min for authenticated user IDs, 10 req/min for unauthenticated IPs.
   - Emits 429 Too Many Requests when threshold exceeded.
3. **`validateDirectoryQuery` (`backend/middleware/validate.js`):**
   - Whitelist query params: `role`, `branch`, `status`, `q`, `page`, `limit`, `sort`.
   - Forbid unknown query parameters with `400 Bad Request`.
   - Enforce pagination: `page >= 1`, default `20`, hard cap `limit = 100`.
   - Whitelist sort fields: `createdAt`, `name`, `fullName`, `role`. Unknown sort fields return `400`.
   - Validate `role` is valid enum; invalid values return `400`.

### 3.2 Serialization Layer (`backend/utils/userSerializer.js`)
Centralized role-aware serializer function: `serializeUser(userDoc, viewerUser)`
- **Viewer = `admin`:** Full user document; sensitive credentials stripped (`password`, `__v`). Includes administrative details, audit fields, and all profiles.
- **Viewer = `manager`:** Operational fields (`_id`, `name`, `email`, `role`, `status`, `phone`, `address`, `staffProfile`, `driverProfile`, `managerProfile`, `staffDetails`, `driverDetails`, `createdAt`). Internal security flags (`passwordResetRequired`, MFA secrets, step-up tokens) omitted.
- **Viewer = `customer` / `staff` (Self-Read):** Own profile (`_id`, `name`, `email`, `role`, `status`, `avatar`, `phone`, `address`, `orders`, `isProfileComplete`, `createdAt`). Internal administration details omitted.
- **Viewer = `customer` / `staff` (Other):** Blocked at middleware (fallback in serializer returns `null`).

### 3.3 Mongoose Schema Hardening (`backend/models/User.js`)
- `password`: Add `select: false` to schema definition.
- `phone`: Add `select: false` (explicitly re-selected in queries for authorized viewers).
- `passwordResetRequired`: Add `{ type: Boolean, default: false, select: false }`.
- `schema.set('toJSON')`:
  ```javascript
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.passwordResetRequired;
    delete ret.__v;
    return ret;
  }
  ```

### 3.4 Controller Updates (`backend/controllers/userController.js`)
- **`getAllUsers`:**
  - Restricted to `admin` and `manager`.
  - Applies pagination (`page`, `limit`), search query (`q`), and filters (`role`, `status`).
  - Returns `{ data: User[], page, limit, total, totalPages }`.
  - Serializes items via `serializeUser(u, req.user)`.
  - Emits audit log: `user.directory.read` with `{ filters, page, limit, resultCount }`.
- **`getUserProfile`:**
  - Authorized via `requireSelfOrRole('admin', 'manager')`.
  - Emits audit log `user.profile.read.other` if `String(req.user._id) !== String(targetId)`.
  - Applies `serializeUser(user, req.user)`.
- **`updateUserProfile` & `patchUserProfile`:**
  - Validates body against strict DTO whitelist (`name`, `phone`, `address`, `avatar`).
  - Prohibits modification of `role`, `email`, `status`, `passwordResetRequired`, `isAdmin`.
  - Emits audit log `user.profile.update`.
- **`deleteUser`:**
  - Admin-only on `DELETE /api/users/:userId`.
  - Emits audit log `user.delete`.

### 3.5 Frontend Verification & Alignment
- Verify `frontend/src/services/api.js` and `frontend/src/pages/profile/ProfilePage.jsx` continue to function seamlessly via compatibility routes.
- Verify `frontend/src/pages/admin/dashboard/DashboardPage.jsx` and `UsersTable.jsx` continue to load directory data via authorized endpoints.

---

## 4. Acceptance Criteria Matrix (Machine-Checkable)

| # | Test Case Description | Expected Result |
|---|---|---|
| 1 | `GET /api/users` unauthenticated | `401 Unauthorized` |
| 2 | `GET /api/users` as `customer` | `403 Forbidden` |
| 3 | `GET /api/users` as `funeral_staff` | `403 Forbidden` |
| 4 | `GET /api/users` as `manager` | `200 OK`, paginated, scoped fields |
| 5 | `GET /api/users` as `admin` | `200 OK`, paginated, full administrative fields |
| 6 | `GET /api/users/:selfId` as `customer` | `200 OK`, self-scoped fields only |
| 7 | `GET /api/users/:otherId` as `customer` | `403 Forbidden` |
| 8 | `GET /api/users/:otherId` as `manager` | `200 OK`, manager-scoped fields |
| 9 | `GET /api/users/:otherId` as `admin` | `200 OK`, full fields |
| 10 | `GET /api/users/not-an-objectid` | `400 Bad Request` |
| 11 | `GET /api/users/:nonexistentId` as customer | `403 Forbidden` (Uniform anti-enumeration) |
| 12 | `PUT /api/users/:selfId` with `{ role:"admin" }` | `400 Bad Request` (DTO whitelist violation) |
| 13 | `PUT /api/users/:otherId` as customer | `403 Forbidden` |
| 14 | `DELETE /api/users/:anyId` as `manager` | `403 Forbidden` |
| 15 | `DELETE /api/users/:anyId` as `admin` | `204 No Content` |
| 16 | `GET /api/users?limit=100000` | Capped at `limit=100` |
| 17 | `GET /api/users?sort=password` | `400 Bad Request` |
| 18 | `GET /api/users?foo=bar` | `400 Bad Request` (Unknown query parameter) |
| 19 | Response body of `GET /api/users/:selfId` as customer | No `password`, no `passwordResetRequired`, no internal flags |
| 20 | 61st request to `GET /api/users` in 60s as same user | `429 Too Many Requests` |
| 21 | Audit log for `GET /api/users` | Entry written with actorId, filters, resultCount |
| 22 | Audit log for cross-user read | Entry written with actorId and targetUserId |
| 23 | Existing automated test suites (`v01`, `v15`) | All remain 100% GREEN |

---

## 5. Implementation Steps (Order of Execution)

1. **Step 1:** Create `backend/utils/userSerializer.js` defining `serializeUser(user, viewer)`.
2. **Step 2:** Update `backend/models/User.js` with `select: false` on `password`, `phone`, and `passwordResetRequired`, and configure schema `toJSON` transform.
3. **Step 3:** Add `requireSelfOrRole` middleware in `backend/middleware/auth.js`.
4. **Step 4:** Add `validateDirectoryQuery` and self/admin update DTO schemas in `backend/middleware/validate.js`.
5. **Step 5:** Add `userEndpointRateLimiter` in `backend/middleware/rateLimiter.js`.
6. **Step 6:** Refactor `backend/controllers/userController.js` to implement paginated, filtered, audited, and serialized directory and profile handlers.
7. **Step 7:** Reconfigure `backend/routes/userRoutes.js` with `protect`, `authorize('admin', 'manager')`, `requireSelfOrRole`, rate limiters, and DTO validators.
8. **Step 8:** Add comprehensive test suite in `backend/tests/v10_remediation.test.js` validating all 23 acceptance criteria.
9. **Step 9:** Execute test suites, verify all tests pass, and generate `VERIFICATION.md` and `SECURITY.md`.

---

## 6. Rollback Plan

- If any unexpected regression occurs, the route definitions in `backend/routes/userRoutes.js` and middleware compositions can be reverted cleanly via git checkout.
- No database migrations modify table schemas or delete persistent customer data. Schema field adjustments (`select: false`) are backward-compatible.
