# PLAN.md — Multi-Vulnerability Remediation: V01, V02, V03, V04

**Target System:** Funeral Services Management Platform (MERN Stack: React Vite + Node.js/Express + MongoDB Mongoose)  
**Security Standards:** OWASP ASVS v4.0, NIST SP 800-63B, OWASP Top 10 (A01: Broken Access Control, A02: Cryptographic Failures)  
**Author:** Senior Application Security Engineer (Google Antigravity)  
**Status:** FULLY EXECUTED & VERIFIED  

---

## 1. Remediation Architecture & Summary

| Vulnerability ID | Vulnerability Name | OWASP Category | Remediation Summary | Status |
|---|---|---|---|---|
| **V01** | Mass Assignment / Privilege Escalation to Admin | A01:2021 | Strict DTO whitelisting via `validateDto(publicRegisterDto)` rejecting unknown keys with 400. Literal server-side `role: 'customer'`. Admin-only step-up provisioning. | ✅ **MITIGATED** |
| **V02** | Unauthenticated CRUD on Core Services | A01:2021 | Applied `protect` + `authorize(...)` across 8 core routes (`/drivers`, `/vehicles`, `/assignments`, `/routes`, `/maintenance`, `/inventory`, `/supplier`, `/inventoryorder`, `/api/admin/debug`). Applied customer ownership checks via `requireOrderOwnership` & `requireUserOwnership`. Configured global axios interceptor on frontend. | ✅ **REMEDIATED** |
| **V03** | Plaintext Password Storage in `addStaff` | A02:2021 | Configured `select: false` on `password` in `User.js`. Added `pre('save')` hook with `bcrypt.genSalt(12)` and double-hashing guard. Added `comparePassword` and `toJSON`/`toObject` stripping. Sanitized `addStaff` controller. Executed migration script `v03-migrate-plaintext-passwords.js`. | ✅ **REMEDIATED** |
| **V04** | Weak JWT Secret (`JWT_SECRET=123`) | A02:2021 | Generated 256-bit cryptographically secure secret (64 hex chars). Added startup fail-fast check in `app.js` (halts if < 32 bytes or === `'123'`). Added zero-downtime rotation fallback `JWT_SECRET_PREVIOUS`. Updated `.env.example`. | ✅ **REMEDIATED** |

---

## 2. File Impact & Implementation Map

```
SSD_assingment/
├── DETECTION.md                                [Updated] Multi-vulnerability audit covering V01-V04 with file/line evidence & PoC
├── PLAN.md                                     [Current] Architecture plan & Postman testing guide
├── SECURITY.md                                 [Updated] Invariants, root causes, residual risks, rotation runbook
├── VERIFICATION.md                             [Updated] Section 11 machine-checkable acceptance results (29/29 tests pass)
├── poc/
│   ├── v01.txt, v01_confirm.js                 [Created] V01 evidence
│   ├── v02.txt, v02_confirm.js                 [Created] V02 evidence
│   ├── v03.txt, v03_confirm.js                 [Created] V03 evidence
│   └── v04.txt, v04_confirm.js                 [Created] V04 evidence
├── backend/
│   ├── .env                                    [Updated] Strong 256-bit secret + JWT_SECRET_PREVIOUS
│   ├── .env.example                            [Updated] Added 256-bit template & rotation guide
│   ├── app.js                                  [Updated] Added boot-time JWT entropy validation (fail-fast)
│   ├── models/
│   │   └── User.js                             [Updated] password select:false, pre('save') bcrypt 12, toJSON, comparePassword
│   ├── controllers/
│   │   ├── adminController.js                  [Updated] Sanitized addStaff to never leak credentials in responses
│   │   ├── adminUserController.js              [Updated] Added select('+password') to stepUpAuth
│   │   └── authController.js                   [Updated] Added select('+password') to login, upgraded register salt to 12
│   ├── middleware/
│   │   ├── auth.js                             [Updated] Supported JWT_SECRET_PREVIOUS for zero-downtime rotation
│   │   ├── authMiddleware.js                   [Updated] Supported JWT_SECRET_PREVIOUS for rotation
│   │   └── ownership.js                        [New] Resource ownership guards for user profile & orders
│   ├── routes/
│   │   ├── DriverRoutes.js                     [Updated] Protected with protect & authorize (admin, manager, driver)
│   │   ├── VehicleRoutes.js                    [Updated] Protected with protect & authorize (admin, manager, staff, driver)
│   │   ├── AssignmentRoutes.js                 [Updated] Protected with protect & authorize (admin, manager, driver, staff)
│   │   ├── RouteRoutes.js                      [Updated] Protected with protect & authorize (admin, manager, driver, staff)
│   │   ├── MaintenanceRoutes.js                [Updated] Protected with protect & authorize (admin, manager)
│   │   ├── InventoryRoutes.js                  [Updated] Protected with protect & authorize (admin, manager, staff)
│   │   ├── SupplierRoutes.js                   [Updated] Protected with protect & authorize (admin, manager)
│   │   ├── InventoryOrderRoutes.js             [Updated] Protected with protect & authorize (admin, manager)
│   │   ├── adminRoutes.js                      [Updated] Secured /debug route with protect, admin
│   │   ├── userRoutes.js                       [Updated] Secured with authorize and requireUserOwnership, removed /testing
│   │   ├── orderRoutes.js                      [Updated] Secured with authorize and requireOrderOwnership
│   │   └── paymentRoutes.js                    [Updated] Secured with authorize and requireUserOwnership
│   ├── scripts/
│   │   └── v03-migrate-plaintext-passwords.js  [Created] Idempotent migration hashing legacy plaintext passwords
│   └── tests/
│       ├── v02_remediation.test.js             [Created] 20 acceptance tests verifying CRUD protection & RBAC
│       └── v03_v04_remediation.test.js         [Created] 9 acceptance tests verifying bcrypt, secret entropy, and tokens
└── frontend/
    └── src/
        └── index.jsx                           [Updated] Attached JWT token to all global axios requests
```

---

## 3. RBAC Enforcement Matrix (V02)

| Resource Route | HTTP Method | Endpoint | Allowed Roles | Middleware Enforcement | Purpose |
|---|---|---|---|---|---|
| **Drivers** | `GET` | `/drivers/`, `/drivers/:id` | `admin`, `manager`, `funeral_manager`, `hearse_driver`, `driver` | `protect, authorize(...)` | Fleet driver records |
| **Drivers** | `POST`, `PUT`, `DELETE` | `/drivers/`, `/drivers/:id` | `admin`, `manager`, `funeral_manager` | `protect, authorize(...)` | Add / modify drivers |
| **Vehicles** | `GET` | `/vehicles/`, `/vehicles/:id` | `admin`, `manager`, `funeral_manager`, `funeral_staff`, `staff`, `hearse_driver`, `driver` | `protect, authorize(...)` | Fleet view |
| **Vehicles** | `POST`, `PUT`, `DELETE` | `/vehicles/`, `/vehicles/:id` | `admin`, `manager`, `funeral_manager` | `protect, authorize(...)` | Manage vehicles |
| **Assignments** | `GET` | `/assignments/`, `/:id` | `admin`, `manager`, `funeral_manager`, `hearse_driver`, `driver`, `funeral_staff`, `staff` | `protect, authorize(...)` | Dispatch schedule |
| **Assignments** | `POST`, `PUT`, `DELETE` | `/assignments/`, `/:id` | `admin`, `manager`, `funeral_manager` | `protect, authorize(...)` | Dispatch scheduling |
| **Routes** | `GET` | `/routes/` | `admin`, `manager`, `funeral_manager`, `hearse_driver`, `driver`, `funeral_staff`, `staff` | `protect, authorize(...)` | Operational routes |
| **Routes** | `POST` | `/routes/` | `admin`, `manager`, `funeral_manager` | `protect, authorize(...)` | Define routes |
| **Maintenance** | `GET`, `POST`, `PUT`, `DELETE`| `/maintenance/**` | `admin`, `manager`, `funeral_manager` | `protect, authorize(...)` | Fleet servicing logs |
| **Inventory** | `GET` | `/inventory/**` | `admin`, `manager`, `funeral_manager`, `funeral_staff`, `staff` | `protect, authorize(...)` | Stock checks |
| **Inventory** | `POST`, `PUT`, `DELETE` | `/inventory/**` | `admin`, `manager`, `funeral_manager` | `protect, authorize(...)` | Stock adjustments |
| **Suppliers** | `GET`, `POST`, `PUT`, `DELETE`| `/supplier/**` | `admin`, `manager`, `funeral_manager` | `protect, authorize(...)` | Supplier contacts |
| **Inventory Orders**| `GET`, `POST`, `PUT`, `DELETE`| `/inventoryorder/**`| `admin`, `manager`, `funeral_manager` | `protect, authorize(...)` | Purchase orders |
| **Admin Debug**| `GET` | `/api/admin/debug` | `admin` | `protect, admin` | Diagnostic API |
| **Users** | `GET` | `/api/users/` | `admin`, `manager`, `funeral_manager` | `protect, authorize(...)` | User registry |
| **Users** | `GET` | `/api/users/:userId` | Resource Owner OR `admin`, `manager` | `protect, requireUserOwnership` | Profile view (IDOR guard) |
| **Orders** | `GET` | `/api/orders/` | `admin`, `manager`, `funeral_manager` | `protect, authorize(...)` | Order registry |
| **Orders** | `GET`, `PUT` | `/api/orders/:id` | Resource Owner OR `admin`, `manager` | `protect, requireOrderOwnership` | View/edit order (IDOR guard)|
| **Orders** | `DELETE` | `/api/orders/:id` | `admin`, `manager` | `protect, authorize(...)` | Order cancellation |
| **Payments** | `GET` | `/api/payments/` | `admin`, `manager`, `funeral_manager` | `protect, authorize(...)` | Ledger view |
| **Payments** | `GET` | `/api/payments/user/:userId` | Resource Owner OR `admin`, `manager` | `protect, requireUserOwnership` | Payment history |

---

## 4. Postman Verification Guide

### 4.1 Testing V01 (Privilege Escalation Block)
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/auth/register`
- **Headers:** `Content-Type: application/json`
- **Body:**
  ```json
  { "name": "Attacker", "email": "attacker@example.com", "password": "Password123!", "role": "admin" }
  ```
- **Expected Status:** `400 Bad Request`
- **Expected Response:**
  ```json
  {
    "message": "Field 'role' is not allowed or unrecognized.",
    "error": "FORBIDDEN_FIELD",
    "field": "role"
  }
  ```

---

### 4.2 Testing V02 (Unauthenticated CRUD & Role Protection)

#### Test 1: Unauthenticated Call to Protected Route
- **Method:** `GET`
- **URL:** `http://localhost:5000/drivers`
- **Headers:** *(None)*
- **Expected Status:** `401 Unauthorized`
- **Expected Response:** `{ "message": "Not authorized, no token provided" }`

#### Test 2: Customer Token on Admin Endpoint
- **Method:** `POST`
- **URL:** `http://localhost:5000/drivers`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <customer_jwt_token>`
- **Body:** `{ "firstname": "John", "lastname": "Doe" }`
- **Expected Status:** `403 Forbidden`
- **Expected Response:** `{ "message": "Forbidden: Insufficient privileges." }`

#### Test 3: Admin Token on Admin Endpoint
- **Method:** `GET`
- **URL:** `http://localhost:5000/drivers`
- **Headers:** `Authorization: Bearer <admin_jwt_token>`
- **Expected Status:** `200 OK`

#### Test 4: Cross-Customer Profile Access (IDOR Prevention)
- Customer 1 token requesting Customer 2 ID:
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/users/<customer_2_id>`
- **Headers:** `Authorization: Bearer <customer_1_token>`
- **Expected Status:** `403 Forbidden`
- **Expected Response:** `{ "message": "Forbidden: You do not have permission to access another user's profile." }`

---

### 4.3 Testing V03 (Plaintext Passwords in `addStaff`)
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/admin/staff/add`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <admin_jwt_token>`
- **Body:**
  ```json
  {
    "name": "David Miller",
    "email": "david.miller@example.com",
    "password": "MySecretStaffPassword123!",
    "staffDetails": {
      "staffId": "ST-9041",
      "designation": "Coordinator",
      "department": "Logistics"
    }
  }
  ```
- **Expected Status:** `201 Created`
- **Expected Response (Notice: `password` is NOT returned):**
  ```json
  {
    "message": "Staff added successfully",
    "user": {
      "_id": "6ab6ad...",
      "name": "David Miller",
      "email": "david.miller@example.com",
      "role": "staff",
      "status": "active"
    }
  }
  ```
- **MongoDB Verification:** In MongoDB, `db.users.findOne({ email: "david.miller@example.com" })` stores `password` as `$2b$12$...` hash.

---

### 4.4 Testing V04 (Weak JWT Secret)
1. **Startup Check:** Setting `JWT_SECRET=123` halts the backend server on boot with:
   `CRITICAL SECURITY ERROR: JWT_SECRET must be set and provide >= 32 bytes (256 bits) of cryptographic entropy. Weak secrets like "123" are forbidden.`
2. **Forged Token Rejection:**
   - **Method:** `GET`
   - **URL:** `http://localhost:5000/api/auth/me`
   - **Headers:** `Authorization: Bearer <token_signed_with_unauthorized_key>`
   - **Expected Status:** `401 Unauthorized` (`{ "message": "Not authorized, token invalid" }`).
3. **Valid Token Acceptance:**
   - With the new 256-bit secret, legitimate tokens return `200 OK` and profile data.
