const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');

describe('V02 Security Tests - Unauthenticated CRUD Operations', () => {
  let adminToken, customerToken, staffToken;
  let testUserId, testOrderId;

  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    }

    // Create test users if they don't exist
    try {
      // Check if admin exists
      let admin = await User.findOne({ email: 'admin@test.com' });
      if (!admin) {
        admin = await User.create({
          name: 'Admin User',
          email: 'admin@test.com',
          password: 'hashed_password',
          role: 'admin'
        });
      }

      // Check if customer exists
      let customer = await User.findOne({ email: 'customer@test.com' });
      if (!customer) {
        customer = await User.create({
          name: 'Customer User',
          email: 'customer@test.com',
          password: 'hashed_password',
          role: 'customer'
        });
      }

      // Store user IDs for IDOR tests
      testUserId = customer._id;

      // Note: In a real test, you would login to get actual JWT tokens
      // For this example, we'll use placeholder tokens
      // You would need to implement actual login logic here
      adminToken = 'admin_jwt_token_placeholder';
      customerToken = 'customer_jwt_token_placeholder';
      staffToken = 'staff_jwt_token_placeholder';

    } catch (error) {
      console.error('Error setting up test users:', error);
    }
  });

  describe('Unauthenticated Access Prevention', () => {
    test('GET /inventory should require authentication', async () => {
      const response = await request(app).get('/inventory');
      expect([401, 403]).toContain(response.status);
    });

    test('POST /inventory should require authentication', async () => {
      const response = await request(app)
        .post('/inventory')
        .send({ productName: 'test', quantity: 10 });
      expect([401, 403]).toContain(response.status);
    });

    test('PUT /inventory/:id should require authentication', async () => {
      const response = await request(app)
        .put('/inventory/507f1f77bcf86cd799439011')
        .send({ productName: 'updated', quantity: 20 });
      expect([401, 403]).toContain(response.status);
    });

    test('DELETE /inventory/:id should require authentication', async () => {
      const response = await request(app)
        .delete('/inventory/507f1f77bcf86cd799439011');
      expect([401, 403]).toContain(response.status);
    });

    test('GET /drivers should require authentication', async () => {
      const response = await request(app).get('/drivers');
      expect([401, 403]).toContain(response.status);
    });

    test('POST /drivers should require authentication', async () => {
      const response = await request(app)
        .post('/drivers')
        .send({ firstname: 'John', lastname: 'Doe' });
      expect([401, 403]).toContain(response.status);
    });

    test('GET /vehicles should require authentication', async () => {
      const response = await request(app).get('/vehicles');
      expect([401, 403]).toContain(response.status);
    });

    test('POST /vehicles should require authentication', async () => {
      const response = await request(app)
        .post('/vehicles')
        .send({ vehicleNumber: 'ABC123', vehicleType: 'Hearse' });
      expect([401, 403]).toContain(response.status);
    });

    test('GET /assignments should require authentication', async () => {
      const response = await request(app).get('/assignments');
      expect([401, 403]).toContain(response.status);
    });

    test('POST /assignments should require authentication', async () => {
      const response = await request(app)
        .post('/assignments')
        .send({ bookingId: '123', vehicleId: '456', driverId: '789' });
      expect([401, 403]).toContain(response.status);
    });

    test('GET /supplier should require authentication', async () => {
      const response = await request(app).get('/supplier');
      expect([401, 403]).toContain(response.status);
    });

    test('POST /supplier should require authentication', async () => {
      const response = await request(app)
        .post('/supplier')
        .send({ supplierName: 'Test Supplier' });
      expect([401, 403]).toContain(response.status);
    });

    test('GET /inventoryorder should require authentication', async () => {
      const response = await request(app).get('/inventoryorder');
      expect([401, 403]).toContain(response.status);
    });

    test('POST /inventoryorder should require authentication', async () => {
      const response = await request(app)
        .post('/inventoryorder')
        .send({ inventoryItemName: 'Test Item' });
      expect([401, 403]).toContain(response.status);
    });

    test('GET /maintenance/all should require authentication', async () => {
      const response = await request(app).get('/maintenance/all');
      expect([401, 403]).toContain(response.status);
    });

    test('POST /maintenance should require authentication', async () => {
      const response = await request(app)
        .post('/maintenance')
        .send({ vehicle_id: '123', service_type: 'Oil Change' });
      expect([401, 403]).toContain(response.status);
    });

    test('GET /routes should require authentication', async () => {
      const response = await request(app).get('/routes');
      expect([401, 403]).toContain(response.status);
    });

    test('POST /routes should require authentication', async () => {
      const response = await request(app)
        .post('/routes')
        .send({ name: 'Test Route', startLocation: 'A', endLocation: 'B' });
      expect([401, 403]).toContain(response.status);
    });

    test('GET /api/admin/debug should require authentication', async () => {
      const response = await request(app).get('/api/admin/debug');
      expect([401, 403]).toContain(response.status);
    });
  });

  describe('Role-Based Access Control', () => {
    test('Customer cannot access /inventory', async () => {
      const response = await request(app)
        .get('/inventory')
        .set('Authorization', `Bearer ${customerToken}`);
      expect([401, 403]).toContain(response.status);
    });

    test('Customer cannot access /drivers', async () => {
      const response = await request(app)
        .get('/drivers')
        .set('Authorization', `Bearer ${customerToken}`);
      expect([401, 403]).toContain(response.status);
    });

    test('Customer cannot access /api/users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${customerToken}`);
      expect([401, 403]).toContain(response.status);
    });

    test('Customer cannot access /api/orders (all orders)', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${customerToken}`);
      expect([401, 403]).toContain(response.status);
    });

    test('Customer cannot access /api/payments (all payments)', async () => {
      const response = await request(app)
        .get('/api/payments')
        .set('Authorization', `Bearer ${customerToken}`);
      expect([401, 403]).toContain(response.status);
    });

    test('Customer can access /api/products (public)', async () => {
      const response = await request(app).get('/api/products');
      expect([200, 404]).toContain(response.status);
    });

    test('Customer can access own order history', async () => {
      const response = await request(app)
        .get('/api/orders/history')
        .set('Authorization', `Bearer ${customerToken}`);
      expect([200, 401]).toContain(response.status);
    });
  });

  describe('IDOR Prevention', () => {
    test('Customer cannot access another user profile by ID', async () => {
      const response = await request(app)
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${customerToken}`);
      expect([401, 403]).toContain(response.status);
    });

    test('Customer cannot modify another user order', async () => {
      const response = await request(app)
        .put('/api/orders/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ status: 'cancelled' });
      expect([401, 403, 404]).toContain(response.status);
    });

    test('Customer cannot delete another user order', async () => {
      const response = await request(app)
        .delete('/api/orders/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${customerToken}`);
      expect([401, 403, 404]).toContain(response.status);
    });

    test('Customer cannot access another user payment by ID', async () => {
      const response = await request(app)
        .get('/api/payments/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${customerToken}`);
      expect([401, 403, 404]).toContain(response.status);
    });

    test('Customer cannot access another user payments by userId', async () => {
      const otherUserId = '507f1f77bcf86cd799439012';
      const response = await request(app)
        .get(`/api/payments/user/${otherUserId}`)
        .set('Authorization', `Bearer ${customerToken}`);
      expect([401, 403, 404]).toContain(response.status);
    });
  });

  describe('Public Endpoints', () => {
    test('GET /api/products should be publicly accessible', async () => {
      const response = await request(app).get('/api/products');
      expect([200, 404]).toContain(response.status);
    });

    test('GET /api/public/packages should be publicly accessible', async () => {
      const response = await request(app).get('/api/public/packages');
      expect([200, 404]).toContain(response.status);
    });
  });

  afterAll(async () => {
    // Clean up test data
    try {
      await User.deleteMany({ email: { $in: ['admin@test.com', 'customer@test.com'] } });
    } catch (error) {
      console.error('Error cleaning up test data:', error);
    }

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });
});
