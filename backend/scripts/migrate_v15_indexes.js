const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const OAuthExchangeCode = require('../models/OAuthExchangeCode');
const RefreshToken = require('../models/RefreshToken');
const AuditLog = require('../models/AuditLog');

async function migrateIndexes() {
  try {
    console.log('[+] Connecting to MongoDB for V15 Index Migration...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[+] Connected successfully.');

    console.log('[+] Building indexes for OAuthExchangeCode...');
    await OAuthExchangeCode.createIndexes();
    const oauthIndexes = await OAuthExchangeCode.collection.indexes();
    console.log('    OAuthExchangeCode indexes:', oauthIndexes.map(i => i.name));

    console.log('[+] Building indexes for RefreshToken...');
    await RefreshToken.createIndexes();
    const refreshIndexes = await RefreshToken.collection.indexes();
    console.log('    RefreshToken indexes:', refreshIndexes.map(i => i.name));

    console.log('[+] Building indexes for AuditLog...');
    await AuditLog.createIndexes();
    const auditIndexes = await AuditLog.collection.indexes();
    console.log('    AuditLog indexes:', auditIndexes.map(i => i.name));

    console.log('[+] V15 MongoDB index migration completed successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[-] Index migration failed:', error);
    process.exit(1);
  }
}

migrateIndexes();
