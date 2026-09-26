const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const fs = require('fs');
const path = require('path');
const request = require(path.join(__dirname, '../backend/node_modules/supertest'));
const mongoose = require(path.join(__dirname, '../backend/node_modules/mongoose'));
const jwt = require(path.join(__dirname, '../backend/node_modules/jsonwebtoken'));
const dotenv = require(path.join(__dirname, '../backend/node_modules/dotenv'));

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const app = require('../backend/app');

async function runVerification() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }

  const jwtSecret = process.env.JWT_SECRET;
  const customerId = '6ab6b1257d5969e6fb3bfb31'; // customer
  const victimId = '6ab694c69260aa809be76296';   // victim
  const managerId = '68246b5359cae8f0a85eb7e6';  // manager
  const adminId = '6ab6ab3c1b313e5eb70d535c';    // admin

  const customerToken = jwt.sign({ id: customerId, role: 'customer' }, jwtSecret, { expiresIn: '1h' });
  const adminToken = jwt.sign({ id: adminId, role: 'admin' }, jwtSecret, { expiresIn: '1h' });
  const managerToken = jwt.sign({ id: managerId, role: 'manager' }, jwtSecret, { expiresIn: '1h' });

  console.log('--- 1. Testing Unauthenticated Actor ---');
  const res1 = await request(app).get('/api/users');
  console.log('GET /api/users unauthenticated ->', res1.status, res1.body);

  const res2 = await request(app).get(`/api/users/${customerId}`);
  console.log('GET /api/users/:userId unauthenticated ->', res2.status, res2.body);

  console.log('\n--- 2. Testing Authenticated Customer Actor ---');
  const res3 = await request(app)
    .get('/api/users')
    .set('Authorization', `Bearer ${customerToken}`);
  console.log('GET /api/users as customer (directory) ->', res3.status, res3.body);

  const res4 = await request(app)
    .get(`/api/users/${victimId}`)
    .set('Authorization', `Bearer ${customerToken}`);
  console.log('GET /api/users/:victimId as customer (cross-read IDOR) ->', res4.status, res4.body);

  const res5 = await request(app)
    .get(`/api/users/${customerId}`)
    .set('Authorization', `Bearer ${customerToken}`);
  console.log('GET /api/users/:selfId as customer (self) ->', res5.status, {
    _id: res5.body._id,
    name: res5.body.name,
    email: res5.body.email,
    password: res5.body.password,
    passwordResetRequired: res5.body.passwordResetRequired,
  });

  const res6 = await request(app)
    .get(`/api/users/not-an-objectid`)
    .set('Authorization', `Bearer ${customerToken}`);
  console.log('GET /api/users/not-an-objectid ->', res6.status, res6.body);

  const nonexistentId = new mongoose.Types.ObjectId().toString();
  const res7 = await request(app)
    .get(`/api/users/${nonexistentId}`)
    .set('Authorization', `Bearer ${customerToken}`);
  console.log('GET /api/users/:nonexistentId as customer ->', res7.status, res7.body);

  console.log('\n--- 3. Testing Manager & Admin Actors ---');
  const res8 = await request(app)
    .get('/api/users')
    .set('Authorization', `Bearer ${managerToken}`);
  console.log('GET /api/users as manager ->', res8.status, {
    total: res8.body.total,
    page: res8.body.page,
    limit: res8.body.limit,
    sampleUser: res8.body.data?.[0],
  });

  const res9 = await request(app)
    .get(`/api/users/${victimId}`)
    .set('Authorization', `Bearer ${managerToken}`);
  console.log('GET /api/users/:victimId as manager ->', res9.status, res9.body);

  const res10 = await request(app)
    .get(`/api/users/${victimId}`)
    .set('Authorization', `Bearer ${adminToken}`);
  console.log('GET /api/users/:victimId as admin ->', res10.status, res10.body);

  console.log('\n--- Verification completed successfully ---');
  await mongoose.disconnect();
}

runVerification().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
