# Remediation Plan: V01 Mass Assignment & Privilege Escalation via Public Registration

## 1. Stack Confirmation & Adaptations

The repository is built with:
- **Backend**: Node.js + Express, MongoDB with Mongoose (adapted from Prisma while strictly maintaining all security invariants and relational constraints), JWT authentication, bcryptjs password hashing, Passport.js Google OAuth + Google Auth Library.
- **Frontend**: React 18 (Vite), Material-UI (MUI v5), Tailwind CSS, React Router v7, Axios, React Toastify.
- **Validation**: Strict DTO Whitelisting with rejection of unallowed/extra fields (`forbidNonWhitelisted` returning HTTP `400 Bad Request`).
- **Testing**: Jest + Supertest test suite covering all 15 acceptance criteria in Section 13.

All security invariants specified in Section 4 are non-negotiable and strictly enforced at the server boundary.

---

## 2. File Tree & Architecture Plan

```text
├── backend/
│   ├── app.js                          # Register /api/admin/users route & middleware
│   ├── config/
│   │   ├── passport.js                 # Harden Google OAuth to check PendingInvite & default to 'customer'
│   ├── controllers/
│   │   ├── authController.js           # Remove role/userType handling; hardcode 'customer'; atomic invite consumption
│   │   ├── adminUserController.js      # NEW: Privileged provisioning endpoints, step-up re-auth, invites, user management
│   ├── middleware/
│   │   ├── auth.js                     # Existing protect, admin + NEW stepUpAuth middleware (<= 5 min validity)
│   │   ├── validate.js                 # NEW: Strict DTO whitelisting & forbidNonWhitelisted middleware
│   │   ├── rateLimiter.js              # NEW: Rate limiting for privileged endpoints (10 req/min/admin)
│   ├── models/
│   │   ├── User.js                     # Update role enum, status enum ('active','pending_invite','suspended'), mfaEnabled
│   │   ├── PendingInvite.js            # NEW: Invite model (email, role, seedData, token, expiresAt, consumedAt, createdBy)
│   │   ├── AuditLog.js                 # NEW: Audit log model (actorId, targetUserId, action, roleGranted, ip, userAgent, requestId)
│   │   ├── Branch.js                   # NEW: Branch reference model for managedBranch validation
│   │   ├── FuneralStaffProfile.js      # NEW: Profile model matching Section 5.3
│   │   ├── HearseDriverProfile.js      # NEW: Profile model matching Section 5.4
│   │   ├── FuneralManagerProfile.js    # NEW: Profile model matching Section 5.5
│   │   ├── AdminProfile.js             # NEW: Profile model matching Section 5.6
│   ├── routes/
│   │   ├── authRoutes.js               # Enforce strict DTO validation on /register and Google endpoints
│   │   ├── adminUserRoutes.js          # NEW: Privileged routes (/funeral-staff, /hearse-driver, /funeral-manager, /admin, etc.)
│   ├── scripts/
│   │   ├── seed_admin.js               # NEW: Seed super-admin, initial branch, 0 staff
│   ├── tests/
│   │   ├── v01_remediation.test.js     # NEW: Comprehensive test suite verifying all 15 acceptance criteria
│   ├── utils/
│   │   ├── auditLogger.js              # NEW: Reusable audit logging utility
│   │   ├── passwordValidator.js        # NEW: Password complexity validator (>= 12 chars, character diversity)
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Register.jsx        # REMOVE role/userType selector completely; customer registration only
│   │   │   ├── admin/
│   │   │   │   ├── components/
│   │   │   │   │   ├── UsersTable.jsx  # ADD "Add User" button beside "Export PDF"; role & status filters
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── DashboardPage.jsx # Wire state and handler for "Add User" modal and refresh
│   │   │   │   ├── users/
│   │   │   │   │   ├── AddUserModal.jsx        # NEW: Role picker & wizard container dialog
│   │   │   │   │   ├── StepUpAuthDialog.jsx    # NEW: Password/MFA re-auth dialog for admin creation & role change
│   │   │   │   │   ├── forms/
│   │   │   │   │   │   ├── FuneralStaffForm.jsx   # NEW: Intake form for Section 5.3
│   │   │   │   │   │   ├── HearseDriverForm.jsx   # NEW: Intake form for Section 5.4
│   │   │   │   │   │   ├── FuneralManagerForm.jsx # NEW: Intake form for Section 5.5
│   │   │   │   │   │   ├── AdminForm.jsx          # NEW: Intake form for Section 5.6 (high privilege banner)
│   │   │   │   │   │   ├── InviteUserForm.jsx     # NEW: Send privileged email invite (Section 5.7)
│
├── PLAN.md                             # This plan
├── SECURITY.md                         # Security documentation on V01 root cause, fix, and invariants
└── VERIFICATION.md                     # Verification report with all 15 acceptance test results
```

---

## 3. Database Schema Updates & Migrations (Mongoose)

### 3.1 `User` Model Updates
- `role`: Enum `['customer', 'funeral_staff', 'hearse_driver', 'funeral_manager', 'admin']` (with aliases `staff`, `driver`, `manager` supported for backward compatibility). Default: `'customer'`.
- `status`: Enum `['active', 'pending_invite', 'suspended']`. Default: `'active'`.
- `mfaEnabled`: Boolean, default: `false`.
- Profile references:
  - `staffProfile`: ObjectId ref `FuneralStaffProfile`
  - `driverProfile`: ObjectId ref `HearseDriverProfile`
  - `managerProfile`: ObjectId ref `FuneralManagerProfile`
  - `adminProfile`: ObjectId ref `AdminProfile`

### 3.2 New Models
1. **`PendingInvite`**:
   - `email`: String, required, unique, lowercase, indexed.
   - `role`: Enum matching elevated roles.
   - `seedData`: Schema.Types.Mixed (pre-filled role profile data).
   - `token`: String, unique, indexed (crypto-generated random 64-char hex or signed JWT).
   - `expiresAt`: Date (now + 72 hours).
   - `consumedAt`: Date, default `null`.
   - `createdBy`: ObjectId ref `User` (the admin who issued the invite).
2. **`AuditLog`**:
   - `actorId`: ObjectId ref `User` (nullable for system events).
   - `targetUserId`: ObjectId ref `User`.
   - `action`: String (e.g. `'user.provision.funeral_staff'`, `'user.provision.admin'`).
   - `roleGranted`: String.
   - `ip`: String.
   - `userAgent`: String.
   - `requestId`: String.
   - `metadata`: Schema.Types.Mixed.
   - `createdAt`: Date, default `Date.now`, indexed with `actorId`.
3. **`Branch`**:
   - `name`: String, required, unique.
   - `code`: String, required, unique.
   - `address`: String.
   - `isActive`: Boolean, default `true`.
4. **Role Profiles**:
   - `FuneralStaffProfile`: `userId`, `employeeId` (unique), `department`, `branch` (ref Branch), `hireDate`, `employmentType` (`full-time`, `part-time`, `contract`), `certifications` `[{ name, expiry }]`, `emergencyContact` `{ name, relation, phone }`, `shift` (`morning`, `evening`, `night`, `rotating`).
   - `HearseDriverProfile`: `userId`, `employeeId` (unique), `licenseNumber` (unique), `licenseClass`, `licenseExpiry` (future Date), `medicalCertificateExpiry` (future Date), `backgroundCheckDate`, `assignedVehicleId`, `availabilitySchedule`, `emergencyContact` `{ name, relation, phone }`.
   - `FuneralManagerProfile`: `userId`, `employeeId` (unique), `managedBranch` (ref Branch), `reportingTo` (ref User), `hireDate`, `yearsOfExperience` (Number >= 0), `managementCertifications` `[{ name, expiry }]`, `emergencyContact` `{ name, relation, phone }`.
   - `AdminProfile`: `userId`, `employeeId` (unique), `accessTier` (`super_admin`, `ops_admin`, `support_admin`), `managedBranch`, `reportingTo`, `hireDate`, `yearsOfExperience`, `emergencyContact`, `forcePasswordReset` (Boolean, default `true`).

---

## 4. Endpoints & API Contract

### 4.1 Public Endpoints
- `POST /api/auth/register`:
  - **Allowed fields only**: `name` (or `fullName`), `email`, `password`, `phone` (optional), `address` (optional).
  - **Whitelist Enforcement**: If `role`, `userType`, `isAdmin`, `permissions`, or any unexpected field is provided $\rightarrow$ `400 Bad Request` with descriptive whitelist error.
  - **Server-side assignment**: `role = 'customer'`, `status = 'active'`.
  - Response: `201 Created` with sanitized user object (no password, no internal flags) + token.
- `POST /api/auth/google-token` & Passport Callback:
  - Validates Google token.
  - Checks if email matches an unconsumed `PendingInvite` (`consumedAt == null` and `expiresAt > Date.now()`):
    - **If invite matches**: In an atomic transaction, assign `role = invite.role`, instantiate profile from `invite.seedData`, mark `consumedAt = Date.now()`, write high-priority `AuditLog`, set `status = 'active'`.
    - **If no invite**: Set `role = 'customer'`, `status = 'active'`.
    - **If existing user**: Preserve existing role (never downgrade).

### 4.2 Privileged Admin Endpoints (Under `/api/admin/users`)
All routes require `protect` and `admin` middleware.
1. `POST /api/admin/users/funeral-staff` $\rightarrow$ Validate Section 5.3 fields $\rightarrow$ Transactionally create User + FuneralStaffProfile $\rightarrow$ Audit Log $\rightarrow$ `201 Created`.
2. `POST /api/admin/users/hearse-driver` $\rightarrow$ Validate Section 5.4 fields (check future expiry on licenses) $\rightarrow$ Transactionally create User + HearseDriverProfile $\rightarrow$ Audit Log $\rightarrow$ `201 Created`.
3. `POST /api/admin/users/funeral-manager` $\rightarrow$ Validate Section 5.5 fields (check valid `reportingTo` and `managedBranch`) $\rightarrow$ Transactionally create User + FuneralManagerProfile $\rightarrow$ Audit Log $\rightarrow$ `201 Created`.
4. `POST /api/admin/users/admin` $\rightarrow$ Require `stepUpAuth` token ($\le 5$ min old) $\rightarrow$ Validate Section 5.6 fields $\rightarrow$ Create User + AdminProfile with `forcePasswordReset: true` $\rightarrow$ Emit high-severity Audit Log $\rightarrow$ `201 Created`.
5. `POST /api/admin/users/invite` $\rightarrow$ Body: `{ email, role, seedData }` $\rightarrow$ Validate role and seedData $\rightarrow$ Generate signed 72h invite token $\rightarrow$ Store `PendingInvite` $\rightarrow$ Audit Log $\rightarrow$ `201 Created`.
6. `POST /api/admin/users/step-up` $\rightarrow$ Body: `{ password }` $\rightarrow$ Verifies admin password $\rightarrow$ Issues short-lived signed step-up JWT token (valid for 5 minutes) $\rightarrow$ `200 OK { stepUpToken }`.
7. `GET /api/admin/users` $\rightarrow$ Query: `role`, `branch`, `status`, `search` $\rightarrow$ Returns users with populated profiles and `provisionedBy` audit details.
8. `PATCH /api/admin/users/:id/role` $\rightarrow$ Body: `{ role, stepUpToken? }` $\rightarrow$ If new role is `admin`, step-up token is mandatory $\rightarrow$ Update role in transaction $\rightarrow$ Audit Log $\rightarrow$ `200 OK`.
9. `DELETE /api/admin/users/:id` $\rightarrow$ Soft-deletes user (`status = 'suspended'`) $\rightarrow$ Audit Log $\rightarrow$ `204 No Content`.

---

## 5. UI / UX Design & Admin Dashboard Integration

### 5.1 Public Self-Registration (`/register`)
- Completely remove the role/userType `<Select>` dropdown and role-specific conditional inputs.
- Form presents clean, compassionate fields: Full Name, Email, Password, Confirm Password, Phone (optional), Address (optional).
- Form explicitly posts only clean customer fields.
- Automated tests verify no `role` or `userType` input exists in the DOM.

### 5.2 Admin Console — Users Table & "Add User" Button
- In `frontend/src/pages/admin/components/UsersTable.jsx`:
  - Locate the header actions box containing the `Export PDF` button.
  - **Insert the `Add User` button directly beside the `Export PDF` button**:
    ```jsx
    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
      <Button
        variant="contained"
        color="primary"
        startIcon={<PersonAddIcon />}
        onClick={handleOpenAddUserModal}
        sx={{ bgcolor: '#1b2a3d', '&:hover': { bgcolor: '#2c3e50' } }}
      >
        Add User
      </Button>
      <Button
        variant="contained"
        startIcon={<PdfIcon />}
        onClick={onExportPdf}
        sx={{ bgcolor: theme.palette.error.main, '&:hover': { bgcolor: theme.palette.error.dark } }}
      >
        Export PDF
      </Button>
    </Box>
    ```
- Clicking `Add User` opens `AddUserModal`:
  1. **Step 1: Role Selection**: Cards for "Funeral Staff", "Hearse Driver", "Funeral Manager", "Admin", and "Send Email Invite".
  2. **Step 2: Role-Specific Form**:
     - **Staff Form**: Employee ID, Department, Branch, Hire Date, Employment Type, Shift, Certifications, Emergency Contact.
     - **Driver Form**: License Number, License Class, License Expiry (with future date picker validation), Medical Cert Expiry, Background Check Date, Assigned Vehicle, Availability, Emergency Contact.
     - **Manager Form**: Managed Branch selector, Reporting Manager selector, Years of Experience, Management Certifications, Emergency Contact.
     - **Admin Form**: Access Tier (`super_admin`, `ops_admin`, `support_admin`), plus high-privilege red warning banner:
       > ⚠️ **HIGH-PRIVILEGE ACTION**: Creating an Administrator account grants full control over the funeral management system. Re-authentication (Password / MFA verification) is strictly required.
     - **Step-Up Dialog**: If Admin creation or role promotion is submitted, `StepUpAuthDialog` triggers to prompt the acting admin's current password.
  3. **Step 3: Feedback**: Toast on success with credential details / invite delivery notice, automatically reloading the user table.

---

## 6. Implementation Sequence (Reviewable Chunks)

1. **Chunk 1: Data Models & Schema Hardening**
   - Create `AuditLog.js`, `PendingInvite.js`, `Branch.js`, `FuneralStaffProfile.js`, `HearseDriverProfile.js`, `FuneralManagerProfile.js`, `AdminProfile.js`.
   - Update `User.js` with new enum roles, status, and default `'customer'`.
2. **Chunk 2: Security Middleware & Utilities**
   - Create `middleware/validate.js` (strict DTO whitelist & forbidNonWhitelisted).
   - Create `middleware/rateLimiter.js` (10 req/min for privileged provisioning).
   - Create `utils/auditLogger.js` and `utils/passwordValidator.js`.
   - Update `middleware/auth.js` to add `stepUpAuth`.
3. **Chunk 3: Auth Hardening (Public & Google)**
   - Refactor `backend/controllers/authController.js` and `backend/routes/authRoutes.js`:
     - Whitelist check on `/register` $\rightarrow$ 400 on unexpected fields.
     - Hardcode role assignment to `'customer'`.
     - In `googleTokenAuth` and Passport callback: check `PendingInvite`, consume inside transaction, audit log.
     - Secure `completeProfile`: forbid role changes.
4. **Chunk 4: Privileged Admin Provisioning Module**
   - Implement `backend/routes/adminUserRoutes.js` and `backend/controllers/adminUserController.js`.
   - Implement step-up re-authentication route (`/api/admin/users/step-up`).
   - Implement role-specific provisioning endpoints (`/funeral-staff`, `/hearse-driver`, `/funeral-manager`, `/admin`, `/invite`, `/role`).
   - Register routes in `backend/app.js`.
5. **Chunk 5: Seed Script**
   - Create `backend/scripts/seed_admin.js` to seed 1 super-admin, 1 branch, 0 staff.
6. **Chunk 6: Frontend Hardening & Registration Cleanup**
   - Update `frontend/src/pages/auth/Register.jsx` to completely strip role selection and extra fields.
7. **Chunk 7: Admin Console UI (Add User Button & Intake Wizards)**
   - Update `frontend/src/pages/admin/components/UsersTable.jsx` to place "Add User" button beside "Export PDF".
   - Create `AddUserModal.jsx`, `StepUpAuthDialog.jsx`, and role form components.
   - Integrate with `DashboardPage.jsx` for state and data refresh.
8. **Chunk 8: Automated Verification & Documentation**
   - Implement Jest + Supertest test suite in `backend/tests/v01_remediation.test.js` validating all 15 acceptance criteria.
   - Run tests and record results in `VERIFICATION.md`.
   - Produce `SECURITY.md` and Rollback Plan.

---

## 7. Rollback Plan

- **Database / Schema**:
  - New collections (`pendinginvites`, `auditlogs`, `branches`, profiles) can be dropped without affecting existing tables.
  - `User.role` remains backward compatible with existing users.
- **Backend**:
  - Revert `adminUserRoutes.js` registration in `app.js`.
  - Revert `authController.js` and `passport.js` git changes if needed.
- **Feature Flag / Kill Switch**:
  - Environment variable `FEATURE_STRICT_RBAC=true` (defaults to true; can be toggled to false if temporary bypass is needed in non-production).
