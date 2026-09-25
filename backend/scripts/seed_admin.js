const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const AdminProfile = require('../models/AdminProfile');
const Branch = require('../models/Branch');

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGO_URI is not set in environment.');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    // 1. Seed Initial Branch (1 Branch, 0 Staff)
    const branch = await Branch.findOneAndUpdate(
      { code: 'HQ-MAIN' },
      {
        name: 'Eternal Rest Main Sanctuary & Branch',
        code: 'HQ-MAIN',
        address: '100 Memorial Sanctuary Way, Colombo 07',
        phone: '+94 11 234 5678',
        isActive: true,
      },
      { upsert: true, new: true }
    );
    console.log(`[SEED] Branch initialized: ${branch.name} (${branch.code})`);

    // 2. Seed Super-Admin (1 super-admin, env-driven)
    const adminEmail = (process.env.INITIAL_ADMIN_EMAIL || 'admin@eternalrest.com').toLowerCase().trim();
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'Admin@Secure2024!';
    const adminName = process.env.INITIAL_ADMIN_NAME || 'Super Administrator';

    let adminUser = await User.findOne({ email: adminEmail });

    if (!adminUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      adminUser = await User.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        status: 'active',
        authProvider: 'local',
        isProfileComplete: true,
        mfaEnabled: false,
      });

      const adminProfile = await AdminProfile.create({
        userId: adminUser._id,
        employeeId: 'ADM-001',
        accessTier: 'super_admin',
        managedBranch: branch.name,
        hireDate: new Date(),
        yearsOfExperience: 10,
        forcePasswordReset: false,
        mfaEnrolled: false,
      });

      adminUser.adminProfile = adminProfile._id;
      await adminUser.save();

      console.log(`[SEED] Super-admin successfully created: ${adminEmail}`);
    } else {
      adminUser.role = 'admin';
      adminUser.status = 'active';
      await adminUser.save();
      console.log(`[SEED] Existing user ${adminEmail} verified with role: admin`);
    }

    console.log('[SEED] Completed successfully. 1 branch, 1 super-admin, 0 staff created.');
    process.exit(0);
  } catch (error) {
    console.error('[SEED] Error running seed script:', error);
    process.exit(1);
  }
};

seedAdmin();
