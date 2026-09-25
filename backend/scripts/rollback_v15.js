const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function rollbackV15() {
  try {
    console.log('[+] Connecting to MongoDB for V15 Rollback...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[+] Connected successfully.');

    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    if (collectionNames.includes('oauthexchangecodes')) {
      console.log('[+] Dropping oauthexchangecodes collection...');
      await mongoose.connection.db.dropCollection('oauthexchangecodes');
    }

    if (collectionNames.includes('refreshtokens')) {
      console.log('[+] Dropping refreshtokens collection...');
      await mongoose.connection.db.dropCollection('refreshtokens');
    }

    console.log('[+] V15 rollback script completed successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[-] Rollback failed:', error);
    process.exit(1);
  }
}

rollbackV15();
