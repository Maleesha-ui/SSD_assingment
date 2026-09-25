const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const request = require('supertest');
const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = require('../app');
const User = require('../models/User');
const OAuthExchangeCode = require('../models/OAuthExchangeCode');
const RefreshToken = require('../models/RefreshToken');
const AuditLog = require('../models/AuditLog');
const { generateToken, googleCallbackHandler } = require('../controllers/authController');

describe('V15 Remediation Verification Suite: Token Leakage via URL Query String', () => {
  let testUser;
  const testEmail = `v15_test_${Date.now()}@example.com`;

  beforeAll(async () => {
    testUser = await User.create({
      googleId: `google_v15_${Date.now()}`,
      name: 'V15 Test Subject',
      email: testEmail,
      role: 'customer',
      status: 'active',
      authProvider: 'google',
      isProfileComplete: true,
    });
  });

  afterAll(async () => {
    if (testUser) {
      await User.deleteOne({ _id: testUser._id });
      await OAuthExchangeCode.deleteMany({ userId: testUser._id });
      await RefreshToken.deleteMany({ userId: testUser._id });
      await AuditLog.deleteMany({ actorId: testUser._id });
    }
  });

  // Acceptance Criterion 1: grep -R "?token=" src/ after fix -> zero matches
  test('1. Static check: zero instances of "?token=" exist in frontend or backend codebase', () => {
    const frontendSrc = path.join(__dirname, '../../frontend/src');
    const backendSrc = path.join(__dirname, '..');

    const searchDir = (dir, extFilter = ['.js', '.jsx', '.ts', '.tsx']) => {
      let results = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (!entry.name.includes('node_modules') && !entry.name.includes('.git') && !entry.name.includes('dist') && !entry.name.includes('tests')) {
            results = results.concat(searchDir(fullPath, extFilter));
          }
        } else if (extFilter.some(ext => entry.name.endsWith(ext))) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const needle = ['?', 'token='].join('');
          if (content.includes(needle)) {
            results.push({ file: fullPath });
          }
        }
      }
      return results;
    };

    const frontendMatches = searchDir(frontendSrc);
    const backendMatches = searchDir(backendSrc);

    expect(frontendMatches.length).toBe(0);
    expect(backendMatches.length).toBe(0);
  });

  // Acceptance Criterion 2: Complete OAuth flow -> final browser redirect contains NO JWT, NO access_token, NO refresh_token
  test('2. Complete OAuth flow redirect URL contains no JWT, no access_token, no refresh_token', async () => {
    let capturedUrl = '';
    const mockReq = {
      user: testUser,
      session: {
        oauth: {
          codeChallenge: 'sample_challenge',
          redirectUri: 'http://localhost:3000/auth/callback',
        },
      },
    };
    const mockRes = {
      redirect: (url) => {
        capturedUrl = url;
      },
    };

    delete process.env.AUTH_OAUTH_DELIVERY; // Default: Pattern B
    await googleCallbackHandler(mockReq, mockRes);

    expect(capturedUrl).toContain('/auth/callback?code=');
    expect(capturedUrl).not.toContain('token=');
    expect(capturedUrl).not.toContain('access_token=');
    expect(capturedUrl).not.toContain('refresh_token=');
    expect(capturedUrl).not.toContain('jwt=');

    const parsed = new URL(capturedUrl);
    const rawCode = parsed.searchParams.get('code');
    expect(rawCode).toBeTruthy();
    // Verify it is not a JWT (JWTs have 2 dots separating 3 base64url segments)
    expect(rawCode.split('.').length).not.toBe(3);
  });

  // Acceptance Criterion 3: Pattern A: Set-Cookie: at=... present: HttpOnly, SameSite=Lax
  test('3. Pattern A cookie delivery: Set-Cookie at=... with HttpOnly and SameSite=Lax, redirects to /oauth/done', async () => {
    process.env.AUTH_OAUTH_DELIVERY = 'cookie';
    let redirectedUrl = '';
    const cookiesSet = {};

    const mockReq = {
      user: testUser,
      session: {},
      ip: '127.0.0.1',
      headers: { 'user-agent': 'Jest-Agent' },
    };
    const mockRes = {
      cookie: (name, val, options) => {
        cookiesSet[name] = { val, options };
      },
      redirect: (url) => {
        redirectedUrl = url;
      },
    };

    await googleCallbackHandler(mockReq, mockRes);

    // Reset feature flag
    delete process.env.AUTH_OAUTH_DELIVERY;

    expect(redirectedUrl).toBe('http://localhost:3000/oauth/done');
    expect(cookiesSet.at).toBeDefined();
    expect(cookiesSet.at.options.httpOnly).toBe(true);
    expect(cookiesSet.at.options.sameSite).toBe('Lax');
    expect(cookiesSet.rt).toBeDefined();
    expect(cookiesSet.rt.options.httpOnly).toBe(true);
  });

  // Acceptance Criterion 4: Pattern B URL contains only ?code=<opaque>, code <= 64 chars, not a JWT
  test('4. Pattern B exchange code is opaque, <= 64 characters, and not a JWT', async () => {
    let capturedUrl = '';
    const mockReq = {
      user: testUser,
      session: {},
    };
    const mockRes = {
      redirect: (url) => {
        capturedUrl = url;
      },
    };

    await googleCallbackHandler(mockReq, mockRes);
    const parsed = new URL(capturedUrl);
    const code = parsed.searchParams.get('code');

    expect(code).toBeTruthy();
    expect(code.length).toBeLessThanOrEqual(64);
    expect(code).toMatch(/^[A-Za-z0-9\-_]+$/);
    expect(code.split('.').length).not.toBe(3);
  });

  // Acceptance Criterion 5: POST /auth/oauth/exchange with valid code -> 200 { accessToken }, no refresh in body
  test('5. POST /auth/oauth/exchange with valid code returns 200 { accessToken } and no refresh token in body', async () => {
    const rawCode = crypto.randomBytes(32).toString('base64url');
    const codeHash = crypto.createHash('sha256').update(rawCode).digest('hex');

    await OAuthExchangeCode.create({
      codeHash,
      userId: testUser._id,
      clientId: 'google-client-id',
      redirectUri: 'http://localhost:3000/auth/callback',
      codeChallenge: '',
      codeChallengeMethod: 'S256',
      createdAt: new Date(),
    });

    const res = await request(app)
      .post('/api/auth/oauth/exchange')
      .send({ code: rawCode });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(testEmail);
    // Refresh token must NOT be returned in JSON body
    expect(res.body.refreshToken).toBeUndefined();

    // Verify refresh token cookie is set
    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    const rtCookie = setCookie.find(c => c.startsWith('rt='));
    expect(rtCookie).toBeDefined();
    expect(rtCookie).toMatch(/HttpOnly/i);
    expect(rtCookie).toMatch(/SameSite=Lax/i);
  });

  // Acceptance Criterion 6: Same code exchanged twice -> 2nd returns 401; audit log code_reuse_detected
  test('6. Replay attack: exchanging same code twice returns 401 and creates code_reuse_detected audit log', async () => {
    const rawCode = crypto.randomBytes(32).toString('base64url');
    const codeHash = crypto.createHash('sha256').update(rawCode).digest('hex');

    await OAuthExchangeCode.create({
      codeHash,
      userId: testUser._id,
      clientId: 'google-client-id',
      redirectUri: 'http://localhost:3000/auth/callback',
      codeChallenge: '',
      codeChallengeMethod: 'S256',
      createdAt: new Date(),
    });

    // 1st exchange: succeeds
    const firstRes = await request(app)
      .post('/api/auth/oauth/exchange')
      .send({ code: rawCode });
    expect(firstRes.status).toBe(200);

    // 2nd exchange: must fail with 401
    const secondRes = await request(app)
      .post('/api/auth/oauth/exchange')
      .send({ code: rawCode });
    expect(secondRes.status).toBe(401);

    // Verify audit log exists
    const audit = await AuditLog.findOne({
      action: 'auth.oauth.code_reuse_detected',
    }).sort({ createdAt: -1 });

    expect(audit).toBeTruthy();
    expect(audit.metadata.attemptedHash).toBe(codeHash);
  });

  // Acceptance Criterion 7: Code expired after 60s -> 401
  test('7. Exchange code older than 60s returns 401 expired', async () => {
    const rawCode = crypto.randomBytes(32).toString('base64url');
    const codeHash = crypto.createHash('sha256').update(rawCode).digest('hex');

    // Create a code with createdAt 65 seconds in the past
    await OAuthExchangeCode.create({
      codeHash,
      userId: testUser._id,
      clientId: 'google-client-id',
      redirectUri: 'http://localhost:3000/auth/callback',
      codeChallenge: '',
      codeChallengeMethod: 'S256',
      createdAt: new Date(Date.now() - 65 * 1000),
    });

    const res = await request(app)
      .post('/api/auth/oauth/exchange')
      .send({ code: rawCode });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/expired/i);
  });

  // Acceptance Criterion 8: Exchange with tampered PKCE verifier -> 401
  test('8. Exchange with tampered or mismatched PKCE verifier returns 401', async () => {
    const rawCode = crypto.randomBytes(32).toString('base64url');
    const codeHash = crypto.createHash('sha256').update(rawCode).digest('hex');
    const legitVerifier = 'legitimate_code_verifier_1234567890123456789012345678901234567890';
    const legitimateChallenge = crypto.createHash('sha256').update(legitVerifier).digest('base64url');

    await OAuthExchangeCode.create({
      codeHash,
      userId: testUser._id,
      clientId: 'google-client-id',
      redirectUri: 'http://localhost:3000/auth/callback',
      codeChallenge: legitimateChallenge,
      codeChallengeMethod: 'S256',
      createdAt: new Date(),
    });

    const tamperedVerifier = 'tampered_code_verifier_1234567890123456789012345678901234567890';
    const res = await request(app)
      .post('/api/auth/oauth/exchange')
      .send({ code: rawCode, codeVerifier: tamperedVerifier });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/PKCE/i);
  });

  // Acceptance Criterion 9: Exchange with mismatched redirect_uri -> 401
  test('9. Exchange with mismatched redirect_uri returns 401', async () => {
    const rawCode = crypto.randomBytes(32).toString('base64url');
    const codeHash = crypto.createHash('sha256').update(rawCode).digest('hex');

    await OAuthExchangeCode.create({
      codeHash,
      userId: testUser._id,
      clientId: 'google-client-id',
      redirectUri: 'http://localhost:3000/auth/callback',
      codeChallenge: '',
      codeChallengeMethod: 'S256',
      createdAt: new Date(),
    });

    const res = await request(app)
      .post('/api/auth/oauth/exchange')
      .send({
        code: rawCode,
        redirectUri: 'http://evil.com/auth/callback',
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/redirect_uri mismatch/i);
  });

  // Acceptance Criterion 10: GET /auth/oauth/exchange -> 405 Method Not Allowed
  test('10. GET /api/auth/oauth/exchange returns 405 Method Not Allowed with Allow: POST header', async () => {
    const res = await request(app).get('/api/auth/oauth/exchange');
    expect(res.status).toBe(405);
    expect(res.headers.allow).toContain('POST');
  });

  // Acceptance Criterion 11: Referrer-Policy strict-origin-when-cross-origin / no-referrer
  test('11. Security headers enforce Referrer-Policy: no-referrer on OAuth callback routes', async () => {
    const res = await request(app).get('/api/auth/google/callback');
    expect(res.headers['referrer-policy']).toBe('no-referrer');
  });

  // Acceptance Criterion 12: Access log of OAuth flow redacts query tokens/codes
  test('12. Query param log redactor scrubs token and code parameters', async () => {
    const req = {
      query: {
        code: 'sensitive_code_value',
        token: 'sensitive_jwt_token',
        other: 'safe_param',
      },
    };
    const res = {};
    const { logRedactor } = require('../middleware/securityHeaders');

    logRedactor(req, res, () => {});
    expect(req.query.code).toBe('[REDACTED]');
    expect(req.query.token).toBe('[REDACTED]');
    expect(req.query.other).toBe('safe_param');
  });

  // Acceptance Criterion 13: Refresh token rotated on /auth/refresh -> old jti revoked, new jti issued
  test('13. POST /api/auth/refresh rotates token, revoking old jti and issuing new jti in same family', async () => {
    const oldRawToken = crypto.randomBytes(32).toString('base64url');
    const oldHash = crypto.createHash('sha256').update(oldRawToken).digest('hex');
    const oldJti = crypto.randomUUID();
    const familyId = crypto.randomUUID();

    const createdToken = await RefreshToken.create({
      userId: testUser._id,
      jti: oldJti,
      tokenHash: oldHash,
      familyId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', [`rt=${oldRawToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();

    // Verify old token is marked revoked
    const updatedOld = await RefreshToken.findById(createdToken._id);
    expect(updatedOld.revokedAt).toBeTruthy();
    expect(updatedOld.replacedByJti).toBeTruthy();

    // Verify new token exists in same family
    const newToken = await RefreshToken.findOne({ jti: updatedOld.replacedByJti });
    expect(newToken).toBeTruthy();
    expect(newToken.familyId).toBe(familyId);
    expect(newToken.revokedAt).toBeNull();
  });

  // Acceptance Criterion 14: Reuse of old refresh token -> entire family revoked, 401
  test('14. Reuse of revoked refresh token revokes entire token family and returns 401', async () => {
    const revokedRawToken = crypto.randomBytes(32).toString('base64url');
    const revokedHash = crypto.createHash('sha256').update(revokedRawToken).digest('hex');
    const familyId = crypto.randomUUID();

    // Old token that was already revoked
    await RefreshToken.create({
      userId: testUser._id,
      jti: crypto.randomUUID(),
      tokenHash: revokedHash,
      familyId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      revokedAt: new Date(),
    });

    // Active sibling token in the same family
    const activeSibling = await RefreshToken.create({
      userId: testUser._id,
      jti: crypto.randomUUID(),
      tokenHash: crypto.randomBytes(32).toString('hex'),
      familyId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      revokedAt: null,
    });

    // Attempt to use revoked token
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', [`rt=${revokedRawToken}`]);

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/reuse detected/i);

    // Sibling token in family must now be revoked
    const reloadedSibling = await RefreshToken.findById(activeSibling._id);
    expect(reloadedSibling.revokedAt).toBeTruthy();

    // Audit log written
    const audit = await AuditLog.findOne({
      action: 'auth.oauth.refresh_reuse_detected',
      actorId: testUser._id,
    });
    expect(audit).toBeTruthy();
  });

  // Acceptance Criterion 15: Storage scanning: no token reading in CompleteProfile
  test('15. CompleteProfile and AuthCallback component code does not extract "?token=" from URL', () => {
    const authCallbackCode = fs.readFileSync(
      path.join(__dirname, '../../frontend/src/pages/auth/AuthCallback.jsx'),
      'utf8'
    );
    const completeProfileCode = fs.readFileSync(
      path.join(__dirname, '../../frontend/src/pages/auth/CompleteProfile.jsx'),
      'utf8'
    );

    expect(authCallbackCode).not.toContain("params.get('token')");
    expect(completeProfileCode).not.toContain("params.get('token')");
  });

  // Acceptance Criterion 16: history.replaceState called on callback route (Pattern B)
  test('16. AuthCallback.jsx invokes window.history.replaceState to scrub code before rendering', () => {
    const authCallbackCode = fs.readFileSync(
      path.join(__dirname, '../../frontend/src/pages/auth/AuthCallback.jsx'),
      'utf8'
    );

    expect(authCallbackCode).toContain('window.history.replaceState');
    expect(authCallbackCode).toContain("'/auth/callback'");
  });

  // Acceptance Criterion 17: Security headers & Cache-Control: no-store on all auth routes
  test('17. Auth endpoints include Cache-Control: no-store and MIME sniffing protection', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.headers['cache-control']).toContain('no-store');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('DENY');
  });

  // Acceptance Criterion 18: Mongo oauth_exchange_codes after successful exchange -> record gone
  test('18. Mongo oauth_exchange_codes record is atomically deleted after exchange', async () => {
    const rawCode = crypto.randomBytes(32).toString('base64url');
    const codeHash = crypto.createHash('sha256').update(rawCode).digest('hex');

    await OAuthExchangeCode.create({
      codeHash,
      userId: testUser._id,
      clientId: 'google-client-id',
      redirectUri: 'http://localhost:3000/auth/callback',
      codeChallenge: '',
      codeChallengeMethod: 'S256',
      createdAt: new Date(),
    });

    // Exchange
    await request(app)
      .post('/api/auth/oauth/exchange')
      .send({ code: rawCode });

    // Assert record is deleted from MongoDB
    const found = await OAuthExchangeCode.findOne({ codeHash });
    expect(found).toBeNull();
  });

  // Acceptance Criterion 19: Mongo refresh_tokens stores only tokenHash, never raw
  test('19. Mongo refresh_tokens stores only SHA-256 tokenHash, never the plaintext raw token', async () => {
    const rawCode = crypto.randomBytes(32).toString('base64url');
    const codeHash = crypto.createHash('sha256').update(rawCode).digest('hex');

    await OAuthExchangeCode.create({
      codeHash,
      userId: testUser._id,
      clientId: 'google-client-id',
      redirectUri: 'http://localhost:3000/auth/callback',
      codeChallenge: '',
      codeChallengeMethod: 'S256',
      createdAt: new Date(),
    });

    const res = await request(app)
      .post('/api/auth/oauth/exchange')
      .send({ code: rawCode });

    const cookieHeader = res.headers['set-cookie'].find(c => c.startsWith('rt='));
    const rawCookieVal = cookieHeader.split(';')[0].split('=')[1];

    // Find the token document in MongoDB
    const doc = await RefreshToken.findOne({ userId: testUser._id }).sort({ createdAt: -1 });
    expect(doc).toBeTruthy();
    // Raw value must NOT equal stored hash
    expect(doc.tokenHash).not.toBe(rawCookieVal);
    // Stored hash must equal SHA-256(rawCookieVal)
    const expectedHash = crypto.createHash('sha256').update(rawCookieVal).digest('hex');
    expect(doc.tokenHash).toBe(expectedHash);
  });
});
