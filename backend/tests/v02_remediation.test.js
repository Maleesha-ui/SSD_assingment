const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const app = require('../app');

jest.setTimeout(30000);

describe('V02 Remediation Verification Suite: Unauthenticated CRUD & RBAC Protection', () => {
  let adminUser;
  let adminToken;
  let customerUser1;
  let customerToken1;
  let customerUser2;
  let customerToken2;

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    const secret = process.env.JWT_SECRET;

    // Admin user
    adminUser = await User.findOne({ email: 'v02_test_admin@test.com' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'V02 Test Admin',
        email: 'v02_test_admin@test.com',
        password: 'AdminPassword123!',
        role: 'admin',
        status: 'active',
        isProfileComplete: true,
      });
    }
    adminToken = jwt.sign({ id: adminUser._id, role: 'admin' }, secret, { expiresIn: '1h' });

    // Customer 1
    customerUser1 = await User.findOne({ email: 'v02_test_cust1@test.com' });
    if (!customerUser1) {
      customerUser1 = await User.create({
        name: 'V02 Customer 1',
        email: 'v02_test_cust1@test.com',
        password: 'CustPassword123!',
        role: 'customer',
        status: 'active',
        isProfileComplete: true,
      });
    }
    customerToken1 = jwt.sign({ id: customerUser1._id, role: 'customer' }, secret, { expiresIn: '1h' });

    // Customer 2
    customerUser2 = await User.findOne({ email: 'v02_test_cust2@test.com' });
    if (!customerUser2) {
      customerUser2 = await User.create({
        name: 'V02 Customer 2',
        email: 'v02_test_cust2@test.com',
        password: 'CustPassword123!',
        role: 'customer',
        status: 'active',
        isProfileComplete: true,
      });
    }
    customerToken2 = jwt.sign({ id: customerUser2._id, role: 'customer' }, secret, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('Criterion 6: Rejection of Unauthenticated Requests (401 Unauthorized)', () => {
    const unauthenticatedEndpoints = [
      { method: 'get', path: '/drivers' },
      { method: 'post', path: '/drivers', body: { licenseNumber: 'B1234' } },
      { method: 'get', path: '/vehicles' },
      { method: 'post', path: '/vehicles', body: { vehicleNumber: 'WP-1234' } },
      { method: 'get', path: '/assignments' },
      { method: 'get', path: '/routes' },
      { method: 'get', path: '/maintenance/all' },
      { method: 'get', path: '/inventory' },
      { method: 'get', path: '/supplier' },
      { method: 'get', path: '/inventoryorder' },
      { method: 'get', path: '/api/admin/debug' },
    ];

    unauthenticatedEndpoints.forEach((ep) => {
      it(`[${ep.method.toUpperCase()}] ${ep.path} returns 401 without JWT`, async () => {
        let req = request(app)[ep.method](ep.path);
        if (ep.body) req = req.send(ep.body);
        const res = await req;
        expect(res.status).toBe(401);
      });
    });
  });

  describe('Criterion 7: Role Authorization Enforcement (403 Forbidden for insufficient roles)', () => {
    it('Customer token on admin-only POST /drivers returns 403 Forbidden', async () => {
      const res = await request(app)
        .post('/drivers')
        .set('Authorization', `Bearer ${customerToken1}`)
        .send({ firstname: 'Malicious', lastname: 'Driver' });

      expect(res.status).toBe(403);
    });

    it('Customer token on admin-only GET /maintenance/all returns 403 Forbidden', async () => {
      const res = await request(app)
        .get('/maintenance/all')
        .set('Authorization', `Bearer ${customerToken1}`);

      expect(res.status).toBe(403);
    });

    it('Customer token on admin-only GET /supplier returns 403 Forbidden', async () => {
      const res = await request(app)
        .get('/supplier')
        .set('Authorization', `Bearer ${customerToken1}`);

      expect(res.status).toBe(403);
    });

    it('Customer token on admin-only GET /api/orders returns 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${customerToken1}`);

      expect(res.status).toBe(403);
    });
  });

  describe('Criterion 8: Legitimate Access with Authorized Role (2xx Success)', () => {
    it('Admin token on GET /drivers returns 200 OK', async () => {
      const res = await request(app)
        .get('/drivers')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('Admin token on GET /vehicles returns 200 OK', async () => {
      const res = await request(app)
        .get('/vehicles')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('Admin token on GET /inventory returns 200 OK', async () => {
      const res = await request(app)
        .get('/inventory')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('Criterion 9: Resource Ownership Enforcement (IDOR Protection)', () => {
    it('Customer 1 accessing Customer 2 profile returns 403 Forbidden', async () => {
      const res = await request(app)
        .get(`/api/users/${customerUser2._id}`)
        .set('Authorization', `Bearer ${customerToken1}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('permission');
    });

    it('Customer 1 accessing own profile returns 200 OK', async () => {
      const res = await request(app)
        .get(`/api/users/${customerUser1._id}`)
        .set('Authorization', `Bearer ${customerToken1}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe(customerUser1.email);
    });
  });
});
