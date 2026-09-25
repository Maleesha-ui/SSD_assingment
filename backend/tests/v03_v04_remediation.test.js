const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Staff = require('../models/Staff');
const app = require('../app');

describe('V03 & V04 Remediation Verification Suite', () => {
  let adminUser;
  let adminToken;
  const newSecret = process.env.JWT_SECRET;

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    // Ensure test admin exists
    adminUser = await User.findOne({ email: 'v03_v04_test_admin@test.com' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'V03 V04 Test Admin',
        email: 'v03_v04_test_admin@test.com',
        password: 'AdminPassword123!', // will be hashed by pre('save') hook
        role: 'admin',
        status: 'active',
        isProfileComplete: true,
      });
    }

    adminToken = jwt.sign(
      { id: adminUser._id, role: 'admin' },
      newSecret,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Clean up created test staff
    await User.deleteMany({ email: /test_staff_.*@example\.com/ });
    await mongoose.disconnect();
  });

  describe('V03: Plaintext Password Storage & Leakage in addStaff', () => {
    const rawStaffPassword = 'PlainStaffSecretPassword123!';
    const staffEmail = `test_staff_${Date.now()}@example.com`;

    it('Criterion 10: Stored password in MongoDB must be a bcrypt hash starting with $2b$12$', async () => {
      const res = await request(app)
        .post('/api/admin/staff/add')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Jane Staff',
          email: staffEmail,
          password: rawStaffPassword,
          staffDetails: {
            staffId: `ST-${Date.now().toString().slice(-4)}`,
            designation: 'Staff Member',
            department: 'Operations',
          }
        });

      expect(res.status).toBe(201);

      // Verify in MongoDB directly with select('+password')
      const storedUser = await User.findOne({ email: staffEmail }).select('+password');
      expect(storedUser).toBeDefined();
      expect(storedUser.password).not.toBe(rawStaffPassword);
      expect(storedUser.password.startsWith('$2b$12$') || storedUser.password.startsWith('$2a$12$')).toBe(true);

      // Verify hash matches original password
      const isMatch = await bcrypt.compare(rawStaffPassword, storedUser.password);
      expect(isMatch).toBe(true);
    });

    it('Criterion 11: POST /api/admin/staff/add response body must NOT include password', async () => {
      const email = `test_staff_leak_${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/admin/staff/add')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Leak Test Staff',
          email: email,
          password: 'AnotherSecretPass123!',
        });

      expect(res.status).toBe(201);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.password).toBeUndefined();
    });

    it('Criterion 12: GET user queries without select(+password) must NOT return password', async () => {
      const user = await User.findOne({ email: staffEmail });
      expect(user).toBeDefined();
      expect(user.password).toBeUndefined();

      const userJson = user.toJSON();
      expect(userJson.password).toBeUndefined();
    });

    it('Criterion 13: Login succeeds with correct password and fails with incorrect password', async () => {
      // Correct password
      const goodLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: staffEmail,
          password: rawStaffPassword,
        });

      expect(goodLogin.status).toBe(200);
      expect(goodLogin.body.token).toBeDefined();
      expect(goodLogin.body.password).toBeUndefined();

      // Incorrect password
      const badLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: staffEmail,
          password: 'WrongPassword999!',
        });

      expect(badLogin.status).toBe(401);
    });

    it('Criterion 14: User.comparePassword helper works correctly', async () => {
      const user = await User.findOne({ email: staffEmail }).select('+password');
      expect(await user.comparePassword(rawStaffPassword)).toBe(true);
      expect(await user.comparePassword('WrongPassword!')).toBe(false);
    });
  });

  describe('V04: Strong JWT Secret from Environment', () => {
    it('Criterion 15: grep check confirms zero fallbacks to 123 for signing/validation', () => {
      const appSource = require('fs').readFileSync(path.join(__dirname, '../app.js'), 'utf8');
      expect(appSource.includes("|| '123'")).toBe(false);
    });

    it('Criterion 16: Environment JWT_SECRET must have at least 32 bytes (256 bits) of entropy', () => {
      const secret = process.env.JWT_SECRET;
      expect(secret).toBeDefined();
      expect(Buffer.byteLength(secret, 'utf8')).toBeGreaterThanOrEqual(32);
      expect(secret).not.toBe('123');
    });

    it('Criterion 17: Token signed with unauthorized/random secret is rejected (401)', async () => {
      const forgedToken = jwt.sign(
        { id: adminUser._id, role: 'admin' },
        'unauthorized_fake_secret_key_12345678901234567890',
        { expiresIn: '1h' }
      );

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${forgedToken}`);

      expect(res.status).toBe(401);
    });

    it('Criterion 18: Token signed with new 256-bit secret is accepted (200)', async () => {
      const validToken = jwt.sign(
        { id: adminUser._id, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe(adminUser.email);
    });
  });
});
