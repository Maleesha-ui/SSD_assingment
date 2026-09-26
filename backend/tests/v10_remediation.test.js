const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const app = require('../app');

jest.setTimeout(30000);

describe('V10 Remediation Acceptance Suite: Authorization on User Profiles & Directory', () => {
  let adminUser;
  let adminToken;
  let managerUser;
  let managerToken;
  let customerUser;
  let customerToken;
  let staffUser;
  let staffToken;
  let victimUser;

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('TestPass@123!', salt);

    // 1. Seed Admin
    adminUser = await User.findOneAndUpdate(
      { email: 'v10_test_admin@test.com' },
      {
        name: 'V10 Test Admin',
        email: 'v10_test_admin@test.com',
        password: hashedPassword,
        role: 'admin',
        status: 'active',
        phone: '+15550001',
        address: '100 Admin HQ',
        authProvider: 'local',
        isProfileComplete: true,
        passwordResetRequired: false,
      },
      { upsert: true, new: true }
    );
    adminToken = jwt.sign({ id: adminUser._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // 2. Seed Manager
    managerUser = await User.findOneAndUpdate(
      { email: 'v10_test_manager@test.com' },
      {
        name: 'V10 Test Manager',
        email: 'v10_test_manager@test.com',
        password: hashedPassword,
        role: 'manager',
        status: 'active',
        phone: '+15550002',
        address: '102 Manager Suite',
        authProvider: 'local',
        isProfileComplete: true,
      },
      { upsert: true, new: true }
    );
    managerToken = jwt.sign({ id: managerUser._id, role: 'manager' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // 3. Seed Customer
    customerUser = await User.findOneAndUpdate(
      { email: 'v10_test_customer@test.com' },
      {
        name: 'V10 Test Customer',
        email: 'v10_test_customer@test.com',
        password: hashedPassword,
        role: 'customer',
        status: 'active',
        phone: '+15550003',
        address: '103 Customer Home',
        authProvider: 'local',
        isProfileComplete: true,
      },
      { upsert: true, new: true }
    );
    customerToken = jwt.sign({ id: customerUser._id, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // 4. Seed Staff
    staffUser = await User.findOneAndUpdate(
      { email: 'v10_test_staff@test.com' },
      {
        name: 'V10 Test Staff',
        email: 'v10_test_staff@test.com',
        password: hashedPassword,
        role: 'funeral_staff',
        status: 'active',
        phone: '+15550004',
        address: '104 Staff Room',
        authProvider: 'local',
        isProfileComplete: true,
      },
      { upsert: true, new: true }
    );
    staffToken = jwt.sign({ id: staffUser._id, role: 'funeral_staff' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // 5. Seed Victim User
    victimUser = await User.findOneAndUpdate(
      { email: 'v10_victim_user@test.com' },
      {
        name: 'V10 Victim User',
        email: 'v10_victim_user@test.com',
        password: hashedPassword,
        role: 'customer',
        status: 'active',
        phone: '+15559999',
        address: '999 Confidential Way',
        authProvider: 'local',
        isProfileComplete: true,
      },
      { upsert: true, new: true }
    );
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Test 1: GET /api/users unauthenticated -> 401
  test('1. GET /api/users unauthenticated returns 401', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });

  // Test 2: GET /api/users as customer -> 403
  test('2. GET /api/users as customer returns 403', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(403);
  });

  // Test 3: GET /api/users as funeral_staff -> 403
  test('3. GET /api/users as funeral_staff returns 403', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${staffToken}`);
    expect(res.status).toBe(403);
  });

  // Test 4: GET /api/users as manager -> 200, paginated, scoped fields
  test('4. GET /api/users as manager returns 200 with paginated scoped fields', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${managerToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty('page', 1);
    expect(res.body).toHaveProperty('limit', 20);
    // Scoped fields: manager should never see password or passwordResetRequired
    for (const u of res.body.data) {
      expect(u.password).toBeUndefined();
      expect(u.passwordResetRequired).toBeUndefined();
    }
  });

  // Test 5: GET /api/users as admin -> 200, paginated, full fields
  test('5. GET /api/users as admin returns 200 with paginated full fields', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0].password).toBeUndefined(); // passwords stripped even for admin
  });

  // Test 6: GET /api/users/:selfId as customer -> 200, self-scope fields only
  test('6. GET /api/users/:selfId as customer returns 200 self-scoped', async () => {
    const res = await request(app)
      .get(`/api/users/${customerUser._id}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body._id).toBe(customerUser._id.toString());
    expect(res.body.email).toBe(customerUser.email);
    expect(res.body.password).toBeUndefined();
    expect(res.body.passwordResetRequired).toBeUndefined();
    expect(res.body.mfaEnabled).toBeUndefined();
  });

  // Test 7: GET /api/users/:otherId as customer -> 403
  test('7. GET /api/users/:otherId as customer returns 403', async () => {
    const res = await request(app)
      .get(`/api/users/${victimUser._id}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(403);
  });

  // Test 8: GET /api/users/:otherId as manager -> 200, scoped
  test('8. GET /api/users/:otherId as manager returns 200 scoped', async () => {
    const res = await request(app)
      .get(`/api/users/${victimUser._id}`)
      .set('Authorization', `Bearer ${managerToken}`);
    expect(res.status).toBe(200);
    expect(res.body._id).toBe(victimUser._id.toString());
    expect(res.body.passwordResetRequired).toBeUndefined();
  });

  // Test 9: GET /api/users/:otherId as admin -> 200, full
  test('9. GET /api/users/:otherId as admin returns 200 full', async () => {
    const res = await request(app)
      .get(`/api/users/${victimUser._id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body._id).toBe(victimUser._id.toString());
  });

  // Test 10: GET /api/users/not-an-objectid -> 400
  test('10. GET /api/users/not-an-objectid returns 400', async () => {
    const res = await request(app)
      .get('/api/users/not-an-objectid')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Invalid user ID format/i);
  });

  // Test 11: GET /api/users/:nonexistentId as customer -> 403 (not 404, uniform anti-oracle)
  test('11. GET /api/users/:nonexistentId as customer returns uniform 403 (not 404)', async () => {
    const nonexistentId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .get(`/api/users/${nonexistentId}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(403);
  });

  // Test 12: PUT /api/users/:selfId with { role: "admin" } -> 400 (whitelist rejection)
  test('12. PUT /api/users/:selfId with { role: "admin" } returns 400', async () => {
    const res = await request(app)
      .put(`/api/users/${customerUser._id}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ role: 'admin' });
    expect(res.status).toBe(400);
  });

  // Test 13: PUT /api/users/:otherId as customer -> 403
  test('13. PUT /api/users/:otherId as customer returns 403', async () => {
    const res = await request(app)
      .put(`/api/users/${victimUser._id}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ name: 'Tampered Name' });
    expect(res.status).toBe(403);
  });

  // Test 14: DELETE /api/users/:anyId as manager -> 403
  test('14. DELETE /api/users/:anyId as manager returns 403', async () => {
    const res = await request(app)
      .delete(`/api/users/${victimUser._id}`)
      .set('Authorization', `Bearer ${managerToken}`);
    expect(res.status).toBe(403);
  });

  // Test 15: DELETE /api/users/:anyId as admin -> 204
  test('15. DELETE /api/users/:anyId as admin returns 204', async () => {
    // Create temporary user to delete
    const tempUser = await User.create({
      name: 'Temp To Delete',
      email: `temp_del_${Date.now()}@test.com`,
      password: 'TestPassword123!',
      role: 'customer',
      status: 'active',
    });

    const res = await request(app)
      .delete(`/api/users/${tempUser._id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(204);

    const check = await User.findById(tempUser._id);
    expect(check.status).toBe('suspended');
  });

  // Test 16: GET /api/users?limit=100000 -> capped at 100
  test('16. GET /api/users?limit=100000 is capped at 100', async () => {
    const res = await request(app)
      .get('/api/users?limit=100000')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.limit).toBe(100);
  });

  // Test 17: GET /api/users?sort=password -> 400
  test('17. GET /api/users?sort=password returns 400', async () => {
    const res = await request(app)
      .get('/api/users?sort=password')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('INVALID_SORT_FIELD');
  });

  // Test 18: GET /api/users?foo=bar -> 400
  test('18. GET /api/users?foo=bar returns 400', async () => {
    const res = await request(app)
      .get('/api/users?foo=bar')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('INVALID_QUERY_PARAMETER');
  });

  // Test 19: Response body of GET /api/users/:selfId as customer -> no password, no passwordResetRequired, no mfa internals
  test('19. Response body of GET /api/users/:selfId as customer has no secrets or internal flags', async () => {
    const res = await request(app)
      .get(`/api/users/${customerUser._id}`)
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.password).toBeUndefined();
    expect(res.body.passwordHash).toBeUndefined();
    expect(res.body.passwordResetRequired).toBeUndefined();
    expect(res.body.mfaEnabled).toBeUndefined();
    expect(res.body.__v).toBeUndefined();
  });

  // Test 20: 61st request to GET /api/users in 60s as same user -> 429
  test('20. 61st request to /api/users in 60s returns 429 rate limit', async () => {
    const uniqueUser = await User.create({
      name: 'Rate Limit Test User',
      email: `ratelimit_${Date.now()}@test.com`,
      password: 'TestPassword123!',
      role: 'admin',
      status: 'active',
    });
    const uniqueToken = jwt.sign({ id: uniqueUser._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    let lastStatus = 200;
    for (let i = 0; i < 61; i++) {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${uniqueToken}`);
      lastStatus = res.status;
      if (lastStatus === 429) break;
    }
    expect(lastStatus).toBe(429);
  });

  // Test 21: Audit log for GET /api/users -> record with actorId, filters, resultCount
  test('21. Audit log for GET /api/users records actorId, filters, resultCount', async () => {
    await request(app)
      .get('/api/users?role=staff')
      .set('Authorization', `Bearer ${managerToken}`);

    const log = await AuditLog.findOne({
      actorId: managerUser._id,
      action: 'user.directory.read',
    }).sort({ createdAt: -1 });

    expect(log).toBeDefined();
    expect(log.actorId.toString()).toBe(managerUser._id.toString());
    expect(log.metadata.filters).toBeDefined();
    expect(log.metadata.filters.role).toBe('staff');
    expect(typeof log.metadata.resultCount).toBe('number');
  });

  // Test 22: Audit log for cross-user read -> record with actorId + targetUserId
  test('22. Audit log for cross-user profile read records actorId and targetUserId', async () => {
    await request(app)
      .get(`/api/users/${victimUser._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    const log = await AuditLog.findOne({
      actorId: adminUser._id,
      targetUserId: victimUser._id,
      action: 'user.profile.read.other',
    }).sort({ createdAt: -1 });

    expect(log).toBeDefined();
    expect(log.actorId.toString()).toBe(adminUser._id.toString());
    expect(log.targetUserId.toString()).toBe(victimUser._id.toString());
  });
});
