/**
 * Migration Script: V03 Plaintext Passwords Migration
 * Scans MongoDB 'users' collection for plaintext passwords.
 * Hashes plaintext passwords using bcrypt (cost 12).
 * Sets passwordResetRequired: true on migrated accounts.
 */
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function migratePlaintextPasswords() {
  console.log('=== V03 Plaintext Password Migration ===');
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('[-] Error: MONGO_URI is not set in environment.');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log('[+] Connected to MongoDB');

  const User = require('../models/User');

  // Query users including the password field
  const users = await User.find({}).select('+password');
  console.log(`[*] Total users inspected: ${users.length}`);

  let migratedCount = 0;
  let alreadyHashedCount = 0;
  let oauthCount = 0;

  for (const user of users) {
    if (!user.password) {
      oauthCount++;
      continue;
    }

    const isHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
    if (isHashed) {
      alreadyHashedCount++;
      continue;
    }

    // Plaintext password detected
    console.log(`[!] Migrating plaintext password for user: ${user.email} (${user.role})`);
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(user.password, salt);

    await User.updateOne(
      { _id: user._id },
      { 
        $set: { 
          password: hashedPassword,
          passwordResetRequired: true 
        } 
      }
    );
    migratedCount++;
  }

  console.log('--- Migration Summary ---');
  console.log(`[+] Total accounts scanned: ${users.length}`);
  console.log(`[+] Already secure/hashed:  ${alreadyHashedCount}`);
  console.log(`[+] OAuth accounts (no pw): ${oauthCount}`);
  console.log(`[+] Migrated plaintext pw:  ${migratedCount}`);
  console.log('[+] Migration complete.');

  await mongoose.disconnect();
}

if (require.main === module) {
  migratePlaintextPasswords().catch(err => {
    console.error('[-] Migration failed:', err);
    process.exit(1);
  });
}

module.exports = migratePlaintextPasswords;
