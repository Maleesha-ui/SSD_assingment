const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const path = require('path');
const dotenv = require(path.join(__dirname, '../backend/node_modules/dotenv'));
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const mongoose = require(path.join(__dirname, '../backend/node_modules/mongoose'));
const jwt = require(path.join(__dirname, '../backend/node_modules/jsonwebtoken'));
const fs = require('fs');

async function runPoC() {
  console.log('=== V15 Token Leakage via URL Query String PoC ===');
  
  // 1. Connect to MongoDB using project config
  await mongoose.connect(process.env.MONGO_URI);
  console.log('[+] Connected to MongoDB');

  const User = require(path.join(__dirname, '../backend/models/User'));
  const { googleCallbackHandler } = require(path.join(__dirname, '../backend/controllers/authController'));

  // 2. Find or create a test user for OAuth simulation
  let testUser = await User.findOne({ email: 'v15_victim@example.com' });
  if (!testUser) {
    testUser = await User.create({
      googleId: 'google_oauth_victim_12345',
      name: 'V15 Victim User',
      email: 'v15_victim@example.com',
      role: 'customer',
      status: 'active',
      authProvider: 'google',
      isProfileComplete: true
    });
    console.log('[+] Created test victim user:', testUser.email);
  } else {
    console.log('[+] Found existing victim user:', testUser.email);
  }

  // 3. Simulate OAuth callback trigger
  let redirectedUrl = null;
  const mockReq = {
    user: testUser
  };
  const mockRes = {
    redirect: (url) => {
      redirectedUrl = url;
      return url;
    }
  };

  await googleCallbackHandler(mockReq, mockRes);
  console.log('[!] Captured Redirect URL from googleCallbackHandler:');
  console.log(redirectedUrl);

  // 4. Verify token presence in query string
  const urlObj = new URL(redirectedUrl);
  const leakedToken = urlObj.searchParams.get('token');

  if (!leakedToken) {
    console.error('[-] FAILURE: No token found in URL.');
    process.exit(1);
  }

  console.log('[!] VULNERABILITY CONFIRMED: JWT token present in URL query string!');
  console.log('    Query Param "token":', leakedToken);

  // 5. Decode and verify the leaked JWT
  const decoded = jwt.verify(leakedToken, process.env.JWT_SECRET);
  console.log('[+] Decoded Leaked Token:', JSON.stringify(decoded));

  // 6. Demonstrate token works against protected endpoint
  const request = require(path.join(__dirname, '../backend/node_modules/supertest'));
  const app = require(path.join(__dirname, '../backend/app'));

  const meResponse = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${leakedToken}`);

  console.log(`[+] Calling GET /api/auth/me with leaked token: HTTP ${meResponse.status}`);
  console.log('    Response User Data:', JSON.stringify(meResponse.body));

  if (meResponse.status !== 200 || meResponse.body._id !== testUser._id.toString()) {
    console.error('[-] Leaked token did not authenticate properly.');
    process.exit(1);
  }

  // 7. Save capture output to poc/redirect_capture.txt
  const captureData = `=== V15 OAUTH REDIRECT URL CAPTURE ===
Timestamp: ${new Date().toISOString()}
Target: Google OAuth Callback -> Frontend Redirect
Captured Redirect URL:
${redirectedUrl}

Leaked Token (Query String):
${leakedToken}

Decoded Payload:
${JSON.stringify(decoded, null, 2)}

Verification against GET /api/auth/me:
Status: ${meResponse.status}
Authenticated User ID: ${meResponse.body._id}
User Email: ${meResponse.body.email}
User Role: ${meResponse.body.role}

Attack Surface / Leak Vectors Demonstrated:
1. Browser History: Location "${redirectedUrl}" stored in plaintext in browser history database.
2. Referer Header: If user or page triggers outbound link/resource from /auth/callback?token=..., Referer header includes the full query string:
   Referer: ${redirectedUrl}
3. Web Server / Proxy / CDN Logs: Full GET request logged in cleartext:
   GET /auth/callback?token=${leakedToken.substring(0, 20)}... HTTP/1.1
4. Shoulder Surfing & URL Sharing: Token exposed directly on the address bar.
`;

  fs.writeFileSync(path.join(__dirname, 'redirect_capture.txt'), captureData, 'utf8');
  console.log('[+] Written evidence to poc/redirect_capture.txt');

  await mongoose.disconnect();
  console.log('[+] PoC execution complete. VERDICT: VULNERABLE.');
  process.exit(0);
}

runPoC().catch(err => {
  console.error('PoC error:', err);
  process.exit(1);
});
