# DETECTION.md — Vulnerability V10: Missing Authorization on User Profiles & Directory

**Audit Date:** 2026-09-26  
**Target Application:** Funeral Services Management Platform  
**Auditor:** Senior Application Security Engineer (Google Antigravity)  
**Vulnerability Classification:** OWASP Top 10 2021: A01:2021 — Broken Access Control / CWE-862 (Missing Authorization) / CWE-639 (Insecure Direct Object Reference - IDOR) / CWE-200 (Exposure of Sensitive Information)  
**Severity:** HIGH (CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:L/A:N — Base Score: 7.1)

---

## 1. Executive Summary

A comprehensive static code analysis and dynamic runtime verification were conducted to evaluate the presence of **Vulnerability V10: Missing Authorization on User Profiles & Directory**.

The audit revealed that endpoints mounted under `/api/users` enforce only base authentication (`protect`) without any role-based access control (RBAC) or resource ownership checks:
1. **Full Directory Exfiltration (`GET /api/users`):** Any authenticated user—including a low-privileged customer or external actor—can retrieve the entire user directory, dumping names, emails, phone numbers, addresses, account roles, and order records across all customers, staff, drivers, managers, and administrators.
2. **Insecure Direct Object Reference (`GET /api/users/:userId`):** Any authenticated caller can pass any user's MongoDB `ObjectId` to read full private profiles and associated order histories without an ownership or role check (horizontal and vertical privilege escalation).
3. **Database Cast Exception & Existence Oracle:** Malformed IDs trigger unhandled Mongoose `CastError` exceptions returning `500 Internal Server Error`, while non-existent user IDs return `404 Not Found` contrasted with `200 OK` for existing users, giving attackers a reliable existence enumeration oracle.
4. **Missing Output Serialization:** Neither schema-level `toJSON` transforms nor controller serializers filter out sensitive attributes. Internal fields (`passwordResetRequired`, internal roles) and unneeded PII are leaked directly into HTTP response bodies.

---

## 2. Phase 1 — Static Route Inventory & Code Audit

### 2.1 Route Inventory

The following table catalogs every user-, profile-, and directory-related endpoint discovered in the backend codebase:

| Method | Path | Mounted At | Middleware Chain | Handler | Source File:Line |
|---|---|---|---|---|---|
| `GET` | `/` | `/api/users` | `protect` | `getAllUsers` | [backend/routes/userRoutes.js:6](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/routes/userRoutes.js#L6) |
| `GET` | `/:userId` | `/api/users` | `protect` | `getUserProfile` | [backend/routes/userRoutes.js:8](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/routes/userRoutes.js#L8) |
| `PUT` | `/update-profile` | `/api/users` | `protect` | `updateUserProfile` | [backend/routes/userRoutes.js:10](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/routes/userRoutes.js#L10) |
| `DELETE` | `/delete-account` | `/api/users` | `protect` | `deleteUserAccount` | [backend/routes/userRoutes.js:12](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/routes/userRoutes.js#L12) |
| `GET` | `/testing` | `/api/users` | *(None / Public)* | `async (req, res)` | [backend/routes/userRoutes.js:14](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/routes/userRoutes.js#L14) |
| `GET` | `/` | `/api/admin/users`, `/admin/users` | `protect`, `admin`, `privilegedRateLimiter()` | `getAllUsers` | [backend/routes/adminUserRoutes.js:47](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/routes/adminUserRoutes.js#L47) |
| `PATCH` | `/:id/role` | `/api/admin/users`, `/admin/users` | `protect`, `admin`, `privilegedRateLimiter()` | `updateUserRole` | [backend/routes/adminUserRoutes.js:48](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/routes/adminUserRoutes.js#L48) |
| `PUT` | `/:id/role` | `/api/admin/users`, `/admin/users` | `protect`, `admin`, `privilegedRateLimiter()` | `updateUserRole` | [backend/routes/adminUserRoutes.js:49](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/routes/adminUserRoutes.js#L49) |
| `DELETE` | `/:id` | `/api/admin/users`, `/admin/users` | `protect`, `admin`, `privilegedRateLimiter()` | `deleteUser` | [backend/routes/adminUserRoutes.js:50](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/routes/adminUserRoutes.js#L50) |
| `GET` | `/users` | `/api/admin` | `protect`, `admin` | `getAllUsers` *(undefined)* | [backend/routes/adminRoutes.js:31](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/routes/adminRoutes.js#L31) |
| `GET` | `/me` | `/api/auth`, `/auth` | `protect` | `getMe` | [backend/routes/authRoutes.js:26](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/routes/authRoutes.js#L26) |
| `PUT` | `/complete-profile` | `/api/auth`, `/auth` | `protect` | `completeProfile` | [backend/routes/authRoutes.js:27](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/routes/authRoutes.js#L27) |
| `GET` | `/profile` | `/api/staff` | `protect`, `staff` | `getStaffProfile` | [backend/routes/staffRoutes.js:21](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/routes/staffRoutes.js#L21) |
| `PUT` | `/profile` | `/api/staff` | `protect`, `staff` | `updateStaffProfile` | [backend/routes/staffRoutes.js:22](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/routes/staffRoutes.js#L22) |

---

### 2.2 Middleware & Ownership Audit

Audit of `/api/users/*` routes:

1. **`GET /api/users`:**
   - **`protect` applied?** YES ([backend/routes/userRoutes.js:6](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/routes/userRoutes.js#L6)).
   - **`authorize(...)` applied?** **NO.** Missing role restriction. Customers, drivers, and staff can access this directory route.
   - **Ownership check?** **N/A / NONE.** Handler performs an unconstrained `User.find().select('-password').populate(...)` without filtering or role checks.
   - **Result:** **FLAGGED — VULNERABLE TO FULL DIRECTORY LEAK.**

2. **`GET /api/users/:userId`:**
   - **`protect` applied?** YES ([backend/routes/userRoutes.js:8](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/routes/userRoutes.js#L8)).
   - **`authorize(...)` applied?** **NO.**
   - **Ownership check inside handler?** **NO.** Code inspection of [backend/controllers/userController.js:25-44](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/controllers/userController.js#L25-L44):
     ```javascript
     exports.getUserProfile = async (req, res) => {
       try {
         const userId = req.params.userId;
         const user = await User.findById(userId)
           .select('-password')
           .populate({
             path: 'orders',
             select: 'orderNumber totalAmount status createdAt',
             options: { sort: { createdAt: -1 } }
           })
           .lean();

         if (!user) return res.status(404).json({ message: 'User not found' });

         const staffData = user.role === 'staff' ? await Staff.findOne({ userId }).select('tasks leaveRequests attendance leaveBalance') : null;
         res.json({ ...user, staffData });
       } catch (error) {
         res.status(500).json({ message: error.message });
       }
     };
     ```
     There is **zero verification** that `req.params.userId === req.user._id` or that `['admin', 'manager'].includes(req.user.role)`.
   - **Result:** **FLAGGED — VULNERABLE TO IDOR (HORIZONTAL & VERTICAL PRIVILEGE ESCALATION).**

3. **`PUT /api/users/update-profile` & `DELETE /api/users/delete-account`:**
   - Both operate strictly on `req.user._id` ([backend/controllers/userController.js:49, 62](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/controllers/userController.js#L49)).
   - However, no standard RESTful verbs (`PUT /api/users/:userId`, `PATCH /api/users/:userId`, `DELETE /api/users/:userId`) exist on `/api/users`. Requests to those paths return 404 HTML fallback from Express.

---

### 2.3 Serialization & Data Model Audit

1. **Does `GET /api/users` return full user documents?**
   - **YES.** Returns `_id`, `name`, `email`, `role`, `status`, `phone`, `address`, `createdAt`, `updatedAt`, `orders`, and embedded `staffDetails` / `driverDetails`.
2. **Does `GET /api/users/:userId` return the same shape regardless of the caller's relationship?**
   - **YES.** It returns the entire populated document with all PII and order history to any authenticated caller regardless of whether they are the owner, a stranger, or an admin.
3. **Mongoose Schema & `toJSON` audit ([backend/models/User.js](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/models/User.js)):**
   - `password`: Does **not** have `select: false` on the schema.
   - `phone`: Does **not** have `select: false`.
   - `passwordResetRequired`: Not yet defined with `select: false` on the User schema.
   - `toJSON` transform: **DOES NOT EXIST** on `userSchema`.
   - Field stripping currently relies solely on ad-hoc `.select('-password')` in individual query builders.

---

## 3. Phase 2 — Runtime Confirmation (PoC Reproduction)

Dynamic testing was executed against the live application server (`http://localhost:5000`) using test actors:
- **Actor A — Unauthenticated**
- **Actor B — Authenticated as `customer`** (Token for ID `6ab6b1257d5969e6fb3bfb31`, role `customer`)
- **Actor C — Authenticated as `admin` & `manager`** (Token for Admin ID `6ab6ab3c1b313e5eb70d535c`, Manager ID `68246b5359cae8f0a85eb7e6`)
- **Target Victims:**
  - Victim Customer (`v15_victim@example.com`, ID: `6ab694c69260aa809be76296`)
  - Target Admin (`v03_v04_test_admin@test.com`, ID: `6ab6ab3c1b313e5eb70d535c`)

The test script is stored at [poc/reproduce_v10_exposure.js](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/poc/reproduce_v10_exposure.js).

### 3.1 Actor A — Unauthenticated
Saved to [poc/v10_unauth.txt](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/poc/v10_unauth.txt):
```http
GET /api/users HTTP/1.1
Host: localhost:5000

HTTP/1.1 401
Content-Type: application/json; charset=utf-8

{
  "message": "Not authorized, no token provided"
}
```
*Verdict: Clean for unauthenticated requests due to `protect` middleware.*

---

### 3.2 Actor B — Authenticated Customer
Saved to [poc/v10_customer.txt](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/poc/v10_customer.txt):

#### Probe 1: Customer calls `GET /api/users` (Directory Exfiltration)
```http
GET /api/users HTTP/1.1
Host: localhost:5000
Authorization: Bearer <Customer-JWT>

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 26146

[
  {
    "_id": "67e394bcfb18f94406a61680",
    "name": "tharushi",
    "email": "tha@gmail.com",
    "role": "admin",
    ...
  },
  {
    "_id": "67ea8afb2b795c1aa022fbf4",
    "name": "Vihi Bandara",
    "email": "vihinsa2@gmail.com",
    "role": "customer",
    "phone": "0714397766",
    "address": "239/10 Uduwana Temple Road, Uduwana",
    ...
  },
  ... (full database user directory returned)
]
```
**CRITICAL VULNERABILITY CONFIRMED:** A basic customer received a 200 OK response with a 26 KB payload containing all user documents and PII in the entire system.

#### Probe 2: Customer calls `GET /api/users/:victimId` (Horizontal IDOR)
```http
GET /api/users/6ab694c69260aa809be76296 HTTP/1.1
Host: localhost:5000
Authorization: Bearer <Customer-JWT>

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "_id": "6ab694c69260aa809be76296",
  "name": "V15 Victim User",
  "email": "v15_victim@example.com",
  "googleId": "google_oauth_victim_12345",
  "authProvider": "google",
  "isProfileComplete": true,
  "role": "customer",
  "status": "active",
  "orders": []
}
```
**CRITICAL VULNERABILITY CONFIRMED:** Customer successfully read a completely unrelated victim customer's private account record.

#### Probe 3: Customer calls `GET /api/users/:adminId` (Vertical IDOR)
```http
GET /api/users/6ab6ab3c1b313e5eb70d535c HTTP/1.1
Host: localhost:5000
Authorization: Bearer <Customer-JWT>

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "_id": "6ab6ab3c1b313e5eb70d535c",
  "name": "V03 V04 Test Admin",
  "email": "v03_v04_test_admin@test.com",
  "passwordResetRequired": false,
  "role": "admin",
  "status": "active",
  "orders": []
}
```
**CRITICAL VULNERABILITY CONFIRMED:** Customer successfully read an administrator's internal account profile.

---

### 3.3 Enumeration & IDOR Probes
Saved to [poc/v10_enumeration.txt](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/poc/v10_enumeration.txt):

1. **ID Walking Test:**
   ```text
   Target ID: 6ab6b1257d5969e6fb3bfb31 -> Status: 200 Body length: 346 bytes
   Target ID: 6ab694c69260aa809be76296 -> Status: 200 Body length: 371 bytes
   Target ID: 68246b5359cae8f0a85eb7e6 -> Status: 200 Body length: 363 bytes
   Target ID: 6ab6ab3c1b313e5eb70d535c -> Status: 200 Body length: 366 bytes
   ```
   *Result:* 100% success rate walking user IDs as a standard customer.

2. **Malformed ObjectId Probe:**
   `GET /api/users/not-an-objectid` with Customer JWT:
   ```http
   HTTP/1.1 500 Internal Server Error
   {
     "message": "Cast to ObjectId failed for value \"not-an-objectid\" (type string) at path \"_id\" for model \"User\""
   }
   ```
   *Result:* Uncaught Mongoose `CastError` leaking internal ODM error and model names (`User`).

3. **Non-Existent ObjectId (Differential Existence Oracle):**
   `GET /api/users/60c72b2f9b1d8b2bad888888` with Customer JWT:
   ```http
   HTTP/1.1 404 Not Found
   {
     "message": "User not found"
   }
   ```
   *Result:* Differential response oracle: Existing ID returns `200 OK`, non-existent ID returns `404 Not Found`.

---

## 4. Detection Verdict

### ✅ **VULNERABLE**

The codebase is undeniably vulnerable to:
1. Full directory enumeration and data exfiltration by any authenticated non-admin/non-manager user on `GET /api/users`.
2. Cross-account horizontal and vertical profile reading (IDOR) on `GET /api/users/:userId`.
3. Existence enumeration via differential 404 vs 200 status codes.
4. Stack/exception exposure (500 CastError) on non-ObjectId inputs.
5. Missing role-aware output serialization and defense-in-depth field masking.

Phase 1 (DETECTION) and runtime reproduction are complete. Proceed to Phase 2 (PLAN.md approval gate).
