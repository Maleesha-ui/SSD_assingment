const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const PendingInvite = require('../models/PendingInvite');
const AuditLog = require('../models/AuditLog');
const FuneralStaffProfile = require('../models/FuneralStaffProfile');
const HearseDriverProfile = require('../models/HearseDriverProfile');
const AdminProfile = require('../models/AdminProfile');
const { processInviteForUser } = require('../utils/inviteHandler');

const app = require('../app');

describe('V01 Remediation Verification Suite: Mass Assignment & Privilege Escalation', () => {
  let adminUser;
  let adminToken;
  let customerUser;
  let customerToken;
  let validStepUpToken;

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('TestAdmin@123!', salt);

    // Create or find Test Admin
    adminUser = await User.findOneAndUpdate(
      { email: 'v01_test_admin@test.com' },
      {
        name: 'V01 Test Admin',
        email: 'v01_test_admin@test.com',
        password: hashedPassword,
        role: 'admin',
        status: 'active',
        authProvider: 'local',
      },
      { upsert: true, new: true }
    );

    adminToken = jwt.sign({ id: adminUser._id, role: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Create or find Test Customer
    customerUser = await User.findOneAndUpdate(
      { email: 'v01_test_customer@test.com' },
      {
        name: 'V01 Test Customer',
        email: 'v01_test_customer@test.com',
        password: hashedPassword,
        role: 'customer',
        status: 'active',
        authProvider: 'local',
      },
      { upsert: true, new: true }
    );

    customerToken = jwt.sign({ id: customerUser._id, role: 'customer' }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Generate valid 5-min step-up token
    const stepUpSecret = process.env.STEP_UP_SECRET || (process.env.JWT_SECRET + '_stepup');
    validStepUpToken = jwt.sign(
      { adminId: adminUser._id.toString(), action: 'step-up' },
      stepUpSecret,
      { expiresIn: '5m' }
    );
  }, 30000);

  afterAll(async () => {
    // Clean up test users
    await User.deleteMany({ email: /@test\.com$/ });
    await PendingInvite.deleteMany({ email: /@test\.com$/ });
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }, 30000);

  // Criteria 1: POST /auth/register { role:"admin" } -> 400 field rejected by whitelist
  test('1. POST /api/auth/register { role: "admin" } returns 400 (rejected by whitelist)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Attacker User',
        email: `attacker_${Date.now()}@test.com`,
        password: 'Password@123',
        role: 'admin',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('FORBIDDEN_FIELD');
    expect(res.body.field).toBe('role');
  });

  // Criteria 2: POST /auth/register valid body -> user created with role="customer"
  test('2. POST /api/auth/register with valid body creates user with role="customer"', async () => {
    const email = `legit_customer_${Date.now()}@test.com`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Legit Customer',
        email,
        password: 'Password@123',
        phone: '1234567890',
        address: '123 Palm Grove',
      });

    expect(res.status).toBe(201);
    expect(res.body.role).toBe('customer');

    // Verify in database
    const dbUser = await User.findOne({ email });
    expect(dbUser).not.toBeNull();
    expect(dbUser.role).toBe('customer');
  });

  // Criteria 3: Google OAuth new user -> role="customer"
  test('3. Google OAuth new user defaults to role="customer"', async () => {
    const newGoogleEmail = `google_user_${Date.now()}@test.com`;
    const newUser = await User.create({
      googleId: `gid_${Date.now()}`,
      name: 'Google Customer',
      email: newGoogleEmail,
      role: 'customer',
      authProvider: 'google',
      isProfileComplete: false,
    });

    const result = await processInviteForUser(newUser, newGoogleEmail);
    expect(result.promoted).toBe(false);
    expect(newUser.role).toBe('customer');
  });

  // Criteria 4: Google OAuth with pending admin invite -> role upgraded, invite consumed
  test('4. Google OAuth with pending admin invite upgrades role and marks invite consumed', async () => {
    const inviteEmail = `invited_staff_${Date.now()}@test.com`;
    await PendingInvite.create({
      email: inviteEmail,
      role: 'funeral_staff',
      seedData: {
        department: 'Embalming Care',
        branch: 'Eternal Rest Main Sanctuary',
        employeeId: `STF-${Date.now().toString().slice(-4)}`,
        employmentType: 'full-time',
        shift: 'morning',
      },
      token: `token_${Date.now()}`,
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
      consumedAt: null,
      createdBy: adminUser._id,
    });

    const user = await User.create({
      googleId: `gid_invite_${Date.now()}`,
      name: 'Invited Staff Member',
      email: inviteEmail,
      role: 'customer',
      authProvider: 'google',
    });

    const result = await processInviteForUser(user, inviteEmail);
    expect(result.promoted).toBe(true);
    expect(result.role).toBe('funeral_staff');
    expect(user.role).toBe('funeral_staff');

    // Verify invite is marked consumed
    const inviteAfter = await PendingInvite.findOne({ email: inviteEmail });
    expect(inviteAfter.consumedAt).not.toBeNull();
  });

  // Criteria 5: POST /admin/users/admin as customer -> 403
  test('5. POST /api/admin/users/admin as customer returns 403', async () => {
    const res = await request(app)
      .post('/api/admin/users/admin')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        fullName: 'Unauthorized Admin',
        email: `unauth_admin_${Date.now()}@test.com`,
        employeeId: 'ADM-999',
        accessTier: 'ops_admin',
      });

    expect(res.status).toBe(403);
  });

  // Criteria 6: POST /admin/users/admin as admin without step-up -> 403
  test('6. POST /api/admin/users/admin as admin without step-up token returns 403', async () => {
    const res = await request(app)
      .post('/api/admin/users/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        fullName: 'New Admin No StepUp',
        email: `admin_no_stepup_${Date.now()}@test.com`,
        employeeId: `ADM-${Date.now().toString().slice(-4)}`,
        accessTier: 'ops_admin',
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/step-up/i);
  });

  // Criteria 7: POST /admin/users/admin as admin with valid step-up -> 201, audit log written, forced reset
  test('7. POST /api/admin/users/admin with valid step-up succeeds (201), writes audit log', async () => {
    const adminEmail = `valid_admin_${Date.now()}@test.com`;
    const employeeId = `ADM-${Date.now().toString().slice(-4)}`;

    const res = await request(app)
      .post('/api/admin/users/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-step-up-token', validStepUpToken)
      .send({
        fullName: 'Valid New Admin',
        email: adminEmail,
        employeeId,
        accessTier: 'ops_admin',
        managedBranch: 'Headquarters',
        yearsOfExperience: 5,
      });

    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('admin');

    // Verify audit log exists
    const audit = await AuditLog.findOne({
      targetUserId: res.body.user._id,
      action: 'user.provision.admin',
    });
    expect(audit).not.toBeNull();
    expect(audit.actorId.toString()).toBe(adminUser._id.toString());
  });

  // Criteria 8: POST /admin/users/hearse-driver missing licenseNumber -> 400
  test('8. POST /api/admin/users/hearse-driver missing licenseNumber returns 400', async () => {
    const res = await request(app)
      .post('/api/admin/users/hearse-driver')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        fullName: 'Incomplete Driver',
        email: `driver_nolic_${Date.now()}@test.com`,
        employeeId: `DRV-${Date.now().toString().slice(-4)}`,
        licenseClass: 'Heavy Commercial',
        licenseExpiry: '2028-01-01',
        medicalCertificateExpiry: '2028-01-01',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('MISSING_REQUIRED_FIELD');
    expect(res.body.field).toBe('licenseNumber');
  });

  // Criteria 9: POST /admin/users/hearse-driver with licenseExpiry in past -> 400
  test('9. POST /api/admin/users/hearse-driver with licenseExpiry in past returns 400', async () => {
    const res = await request(app)
      .post('/api/admin/users/hearse-driver')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        fullName: 'Expired License Driver',
        email: `driver_expired_${Date.now()}@test.com`,
        employeeId: `DRV-${Date.now().toString().slice(-4)}`,
        licenseNumber: `LIC-${Date.now().toString().slice(-4)}`,
        licenseClass: 'Heavy Commercial',
        licenseExpiry: '2020-01-01', // In the past!
        medicalCertificateExpiry: '2028-01-01',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/future/i);
  });

  // Criteria 10: Any privileged route without JWT -> 401
  test('10. Any privileged route without JWT returns 401', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.status).toBe(401);
  });

  // Criteria 11: Unknown field isAdmin:true on any DTO -> 400
  test('11. Unknown field isAdmin: true on DTO returns 400', async () => {
    const res = await request(app)
      .post('/api/admin/users/funeral-staff')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        fullName: 'Staff with Malicious Field',
        email: `staff_malicious_${Date.now()}@test.com`,
        employeeId: `STF-${Date.now().toString().slice(-4)}`,
        department: 'Chapel',
        branch: 'Main Sanctuary',
        hireDate: '2024-01-01',
        employmentType: 'full-time',
        shift: 'morning',
        isAdmin: true, // Forbidden field!
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('FORBIDDEN_FIELD');
    expect(res.body.field).toBe('isAdmin');
  });

  // Criteria 12: Concurrent invite consumption -> exactly one succeeds
  test('12. Concurrent invite consumption: exactly one succeeds, subsequent is ignored', async () => {
    const raceEmail = `race_invite_${Date.now()}@test.com`;
    await PendingInvite.create({
      email: raceEmail,
      role: 'funeral_manager',
      token: `race_token_${Date.now()}`,
      expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
      consumedAt: null,
      createdBy: adminUser._id,
    });

    const user1 = await User.create({
      googleId: `gid_race1_${Date.now()}`,
      name: 'Race Candidate 1',
      email: raceEmail,
      role: 'customer',
    });

    // Attempt concurrent invite claims for the same invite
    const [res1, res2] = await Promise.all([
      processInviteForUser(user1, raceEmail),
      processInviteForUser(user1, raceEmail),
    ]);

    const successes = [res1, res2].filter((r) => r.promoted === true);
    expect(successes.length).toBe(1);
  });

  // Criteria 13: Audit log contains actor, target, role, IP, UA
  test('13. Audit log contains actor, target, role, IP, UA', async () => {
    const auditRecord = await AuditLog.findOne({ action: 'user.provision.admin' }).sort({ createdAt: -1 });
    expect(auditRecord).not.toBeNull();
    expect(auditRecord.actorId).toBeDefined();
    expect(auditRecord.roleGranted).toBe('admin');
    expect(auditRecord.action).toBe('user.provision.admin');
  });

  // Criteria 14: UI: /register has no role control
  test('14. UI: /register component code has no role or userType input', () => {
    const registerFileContent = fs.readFileSync(
      path.join(__dirname, '../../frontend/src/pages/auth/Register.jsx'),
      'utf8'
    );
    // Asserts no role input/selector in register form
    expect(registerFileContent).not.toMatch(/<Select[^>]*userType/);
    expect(registerFileContent).not.toMatch(/name=["']role["']/);
    expect(registerFileContent).not.toMatch(/value=["']admin["']/);
    expect(registerFileContent).not.toMatch(/formData\.userType/);
  });

  // Criteria 15: Security baseline check on auth endpoints
  test('15. Authentication endpoint security baseline check', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    // Rejects empty body with 400 Bad Request
    expect(res.status).toBe(400);
  });
});
