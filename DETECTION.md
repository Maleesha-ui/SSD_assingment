# DETECTION.md — Vulnerability Detection & Static/Dynamic Audit: V01, V02, V03, V04

**Audit Date:** 2026-09-25  
**Target Application:** Funeral Services Management Platform (MongoDB / Express / React Stack)  
**Auditor:** Senior Application Security Engineer (Google Antigravity)  
**Operating Mode:** Detect → Confirm → Plan → Execute → Verify  

---

## 1. Executive Summary

A comprehensive source code review and dynamic penetration assessment were executed across the codebase for the four designated vulnerability classifications:

| Vulnerability ID | Vulnerability Name | OWASP Classification | Severity | Confirmed Verdict | Remediation Status |
|---|---|---|---|---|---|
| **V01** | Mass Assignment / Privilege Escalation to Admin | A01:2021 — Broken Access Control | Critical | ❌ **NOT PRESENT (Mitigated)** | Mitigated by DTO Whitelisting |
| **V02** | Unauthenticated CRUD on Core Services | A01:2021 — Broken Access Control | Critical | ⚠️ **VULNERABLE** | Deferred per user instructions |
| **V03** | Plaintext Password Storage & Leakage in `addStaff` | A02:2021 — Cryptographic Failures | Critical | ✅ **VULNERABLE** | **REMEDIATED** |
| **V04** | Weak JWT Secret (`JWT_SECRET=123`) | A02:2021 — Cryptographic Failures | Critical | ✅ **VULNERABLE** | **REMEDIATED** |

---

## 2. V01: Mass Assignment / Privilege Escalation to Admin

### 2.1 Static Code Inspection
1. **Public Registration Handler:**
   - **File:** [`backend/routes/authRoutes.js:22`](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/routes/authRoutes.js#L22)
     ```javascript
     router.post('/register', validateDto(publicRegisterDto), register);
     ```
   - **File:** [`backend/middleware/validate.js:54-74`](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/middleware/validate.js#L54-L74)
     ```javascript
     const publicRegisterDto = {
       allowedFields: ['name', 'fullName', 'email', 'password', 'phone', 'address'],
       requiredFields: ['email', 'password'],
     };
     ```
     `validateDto` rejects any field not in `allowedFields` with `400 Bad Request` and `error: 'FORBIDDEN_FIELD'`.
   - **File:** [`backend/controllers/authController.js:46`](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/controllers/authController.js#L46)
     ```javascript
     role: 'customer', // Strictly hardcoded server-side
     ```
2. **Google OAuth Callback:**
   - [`backend/config/passport.js:63`](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/config/passport.js#L63) strictly assigns `role: 'customer'`.
   - [`backend/controllers/authController.js:256`](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/controllers/authController.js#L256) strictly assigns `role: 'customer'`.

### 2.2 Proof of Concept & Verdict
Attempting to send `{"role": "admin"}` to `/api/auth/register` returns `400 Bad Request`:
```json
{
  "message": "Field 'role' is not allowed or unrecognized.",
  "error": "FORBIDDEN_FIELD",
  "field": "role"
}
```
**Verdict:** ❌ **NOT PRESENT (Mitigated)**

---

## 3. V02: Unauthenticated CRUD on Core Services

### 3.1 Static Code Inspection
Eight core service route files mounted in [`backend/app.js:91-99`](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/app.js#L91-L99) lack auth middleware:
- `/drivers` ([`backend/routes/DriverRoutes.js`](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/routes/DriverRoutes.js))
- `/vehicles` ([`backend/routes/VehicleRoutes.js`](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/routes/VehicleRoutes.js))
- `/assignments` ([`backend/routes/AssignmentRoutes.js`](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/routes/AssignmentRoutes.js))
- `/routes` ([`backend/routes/RouteRoutes.js`](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/routes/RouteRoutes.js))
- `/maintenance` ([`backend/routes/MaintenanceRoutes.js`](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/routes/MaintenanceRoutes.js))
- `/inventory` ([`backend/routes/InventoryRoutes.js`](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/routes/InventoryRoutes.js))
- `/supplier` ([`backend/routes/SupplierRoutes.js`](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/routes/SupplierRoutes.js))
- `/inventoryorder` ([`backend/routes/InventoryOrderRoutes.js`](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/backend/routes/InventoryOrderRoutes.js))

### 3.2 Proof of Concept & Verdict
PoC test in [`poc/v02.txt`](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/poc/v02.txt) confirmed 11/11 tested endpoints returned `200 OK` without JWT.  
**Verdict:** ⚠️ **VULNERABLE** (Scope deferred per user request).

---

## 4. V03: Plaintext Password Storage in `addStaff`

### 4.1 Static Code Inspection (Pre-Remediation)
1. **Handler Flaw in `adminController.js:244-259`:**
   ```javascript
   exports.addStaff = async (req, res) => {
     try {
       const { name, email, password, staffDetails } = req.body;
       const user = await User.create({
         name,
         email,
         password, // DIRECT PLAINTEXT PASSING
         role: 'staff',
         staffDetails,
       });
       await Staff.create({ userId: user._id });
       res.status(201).json({ message: 'Staff added successfully', user }); // LEAKAGE IN RESPONSE
     } catch (error) { ... }
   };
   ```
2. **Model Flaws in `models/User.js:6-12`:**
   - Missing `select: false` on `password`.
   - Missing `pre('save')` hook with bcrypt cost ≥ 12.
   - Missing `toJSON` / `toObject` transform removing `ret.password`.
   - Missing `comparePassword` instance method.

### 4.2 Proof of Concept ([`poc/v03.txt`](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/poc/v03.txt))
- Calling `POST /api/admin/staff/add` returned `201 Created` with `"password": "PlainTextStaffPass123!"` exposed in response JSON.
- MongoDB record inspection showed unhashed cleartext password.

### 4.3 Verdict
✅ **VULNERABLE** (Remediation executed).

---

## 5. V04: Weak JWT Secret (`JWT_SECRET=123`)

### 5.1 Static Code Inspection (Pre-Remediation)
1. **Config in `backend/.env:3`:**
   ```env
   JWT_SECRET=123
   ```
2. **Entropy Measurement:**
   - 3 characters / 3 bytes (24 bits) vs requirement of ≥ 32 bytes (256 bits).
   - Trivially brute-forced in milliseconds or guessed by attackers.
3. **Offline Token Forgery:**
   - Any attacker knowing or guessing `'123'` could independently forge an administrator JWT token (`jwt.sign({ role: 'admin' }, '123')`) and access all protected endpoints.
4. **Missing Startup Check:**
   - Server booted silently without validating `process.env.JWT_SECRET`.

### 5.2 Proof of Concept ([`poc/v04.txt`](file:///d:/SLIIT/YEAR%2004/Secure%20Software%20Development/Assignment/SSD_assingment/poc/v04.txt))
Verified 3-byte secret length and forged admin token creation.

### 5.3 Verdict
✅ **VULNERABLE** (Remediation executed).
