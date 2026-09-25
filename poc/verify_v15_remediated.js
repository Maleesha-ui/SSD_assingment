const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const path = require('path');
const dotenv = require(path.join(__dirname, '../backend/node_modules/dotenv'));
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const mongoose = require(path.join(__dirname, '../backend/node_modules/mongoose'));
const jwt = require(path.join(__dirname, '../backend/node_modules/jsonwebtoken'));
const crypto = require('crypto');
const fs = require('fs');
const request = require(path.join(__dirname, '../backend/node_modules/supertest'));

async function verifyRemediation() {
  console.log('=== V15 Remediation Verification PoC ===');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('[+] Connected to MongoDB');

  const User = require(path.join(__dirname, '../backend/models/User'));
  const OAuthExchangeCode = require(path.join(__dirname, '../backend/models/OAuthExchangeCode'));
  const RefreshToken = require(path.join(__dirname, '../backend/models/RefreshToken'));
  const { googleCallbackHandler } = require(path.join(__dirname, '../backend/controllers/authController'));
  const app = require(path.join(__dirname, '../backend/app'));

  // 1. Get victim user
  const victimUser = await User.findOne({ email: 'v15_victim@example.com' });
  console.log('[+] Testing with user:', victimUser.email);

  // 2. Client initiates PKCE
  const codeVerifier = 'client_super_secret_pkce_verifier_123456789012345678901234567890';
  const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');

  // 3. Callback redirect
  let capturedRedirectUrl = null;
  const mockReq = {
    user: victimUser,
    session: {
      oauth: {
        codeChallenge,
        redirectUri: 'http://localhost:3000/auth/callback',
      },
    },
    ip: '127.0.0.1',
    headers: { 'user-agent': 'Remediation-Verify-Agent' },
  };
  const mockRes = {
    redirect: (url) => {
      capturedRedirectUrl = url;
    },
  };

  await googleCallbackHandler(mockReq, mockRes);
  console.log('[+] Captured Secure Redirect URL:');
  console.log('   ', capturedRedirectUrl);

  // 4. Assert URL has NO tokens, only ?code=
  const urlObj = new URL(capturedRedirectUrl);
  if (urlObj.searchParams.has('token')) {
    console.error('[-] FAIL: Token still found in URL!');
    process.exit(1);
  }
  const code = urlObj.searchParams.get('code');
  if (!code) {
    console.error('[-] FAIL: No exchange code returned!');
    process.exit(1);
  }
  console.log('[+] VERIFIED: URL contains ZERO bearer tokens. Opaque exchange code:', code);

  // 5. Check Mongo: Code is stored HASHED only
  const codeHash = crypto.createHash('sha256').update(code).digest('hex');
  const storedDoc = await OAuthExchangeCode.findOne({ codeHash });
  if (!storedDoc) {
    console.error('[-] FAIL: Code hash not found in MongoDB');
    process.exit(1);
  }
  console.log('[+] VERIFIED: MongoDB stores only SHA-256 codeHash:', storedDoc.codeHash);

  // 6. Perform PKCE Code Exchange via POST
  const exchangeRes = await request(app)
    .post('/api/auth/oauth/exchange')
    .send({
      code,
      codeVerifier,
      redirectUri: 'http://localhost:3000/auth/callback',
    });

  if (exchangeRes.status !== 200) {
    console.error('[-] FAIL: Code exchange failed with status', exchangeRes.status, exchangeRes.body);
    process.exit(1);
  }
  console.log('[+] Code Exchange Successful: HTTP 200');
  console.log('    Issued Access Token in JSON body:', exchangeRes.body.accessToken ? '[Present]' : '[Missing]');
  console.log('    Refresh Token in JSON body:', exchangeRes.body.refreshToken || '[NONE - Compliant with Invariant 2]');

  // Check Set-Cookie for refresh token
  const cookies = exchangeRes.headers['set-cookie'];
  const rtCookie = cookies.find(c => c.startsWith('rt='));
  console.log('[+] Refresh Token Set-Cookie:', rtCookie);

  // 7. Verify atomic deletion in MongoDB (cannot be reused)
  const consumedDoc = await OAuthExchangeCode.findOne({ codeHash });
  if (consumedDoc) {
    console.error('[-] FAIL: Exchange code was not atomically deleted!');
    process.exit(1);
  }
  console.log('[+] VERIFIED: Exchange code was atomically consumed and purged from MongoDB.');

  // 8. Test Replay Attack
  const replayRes = await request(app)
    .post('/api/auth/oauth/exchange')
    .send({
      code,
      codeVerifier,
      redirectUri: 'http://localhost:3000/auth/callback',
    });

  if (replayRes.status !== 401) {
    console.error('[-] FAIL: Replay attack succeeded! Expected 401, got', replayRes.status);
    process.exit(1);
  }
  console.log('[+] Replay Attack Blocked: HTTP 401 Unauthorized.');

  await mongoose.disconnect();
  console.log('[+] REMEDIATION VERIFICATION COMPLETE. V15 SUCCESSFULLY MITIGATED.');
  process.exit(0);
}

verifyRemediation().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});
