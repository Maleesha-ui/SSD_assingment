const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const FuneralStaffProfile = require('../models/FuneralStaffProfile');
const HearseDriverProfile = require('../models/HearseDriverProfile');
const FuneralManagerProfile = require('../models/FuneralManagerProfile');
const AdminProfile = require('../models/AdminProfile');
const PendingInvite = require('../models/PendingInvite');
const { logAuditEvent } = require('../utils/auditLogger');

/**
 * Step-Up Re-Authentication Endpoint
 * Invariant 2 & 8: Generates a short-lived step-up token valid for <= 5 minutes.
 */
exports.stepUpAuth = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: 'Password is required for step-up authentication.' });
    }

    const adminUser = await User.findById(req.user._id).select('+password');
    if (!adminUser || !adminUser.password) {
      return res.status(401).json({ message: 'Authentication failed.' });
    }

    const isMatch = await bcrypt.compare(password, adminUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials. Step-up authentication failed.' });
    }

    const secret = process.env.STEP_UP_SECRET || (process.env.JWT_SECRET + '_stepup');
    const stepUpToken = jwt.sign(
      {
        adminId: adminUser._id.toString(),
        action: 'step-up',
      },
      secret,
      { expiresIn: '5m' } // 5 minutes TTL (Invariant 2)
    );

    await logAuditEvent({
      actorId: adminUser._id,
      targetUserId: adminUser._id,
      action: 'admin.step_up.verified',
      req,
    });

    res.json({
      message: 'Step-up authentication successful.',
      stepUpToken,
      expiresInSeconds: 300,
    });
  } catch (error) {
    console.error('Step-up endpoint error:', error);
    res.status(500).json({ message: 'Step-up authentication error.' });
  }
};

/**
 * Privileged Provisioning: Funeral Staff (Section 5.3)
 */
exports.createFuneralStaff = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      dateOfBirth,
      employeeId,
      department,
      branch,
      hireDate,
      employmentType,
      certifications,
      emergencyContact,
      shift,
      password,
    } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    // Check unique email and employeeId
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    const existingEmp = await FuneralStaffProfile.findOne({ employeeId });
    if (existingEmp) {
      return res.status(409).json({ message: 'Employee ID already in use.' });
    }

    const salt = await bcrypt.genSalt(10);
    const tempPassword = password || crypto.randomBytes(8).toString('hex') + 'Aa1!';
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    // Create user and profile
    const user = await User.create({
      name: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone || '',
      role: 'funeral_staff',
      status: 'active',
      provisionedBy: req.user._id,
      isProfileComplete: true,
      authProvider: 'local',
    });

    const staffProfile = await FuneralStaffProfile.create({
      userId: user._id,
      employeeId,
      department,
      branch,
      hireDate: hireDate ? new Date(hireDate) : new Date(),
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      employmentType: employmentType || 'full-time',
      shift: shift || 'morning',
      certifications: certifications || [],
      emergencyContact: emergencyContact || {},
    });

    user.staffProfile = staffProfile._id;
    await user.save();

    await logAuditEvent({
      actorId: req.user._id,
      targetUserId: user._id,
      action: 'user.provision.funeral_staff',
      roleGranted: 'funeral_staff',
      req,
      metadata: { employeeId, department, branch },
    });

    res.status(201).json({
      message: 'Funeral staff member successfully provisioned.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        provisionedBy: req.user._id,
        staffProfile,
      },
    });
  } catch (error) {
    console.error('Provision funeral staff error:', error);
    res.status(500).json({ message: error.message || 'Error provisioning funeral staff.' });
  }
};

/**
 * Privileged Provisioning: Hearse Driver (Section 5.4)
 */
exports.createHearseDriver = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      dateOfBirth,
      employeeId,
      licenseNumber,
      licenseClass,
      licenseExpiry,
      medicalCertificateExpiry,
      backgroundCheckDate,
      assignedVehicleId,
      availabilitySchedule,
      emergencyContact,
      password,
    } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    const existingEmp = await HearseDriverProfile.findOne({
      $or: [{ employeeId }, { licenseNumber }],
    });
    if (existingEmp) {
      return res.status(409).json({ message: 'Employee ID or License Number already in use.' });
    }

    const salt = await bcrypt.genSalt(10);
    const tempPassword = password || crypto.randomBytes(8).toString('hex') + 'Aa1!';
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    const user = await User.create({
      name: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone || '',
      role: 'hearse_driver',
      status: 'active',
      provisionedBy: req.user._id,
      isProfileComplete: true,
      authProvider: 'local',
    });

    const driverProfile = await HearseDriverProfile.create({
      userId: user._id,
      employeeId,
      licenseNumber,
      licenseClass,
      licenseExpiry: new Date(licenseExpiry),
      medicalCertificateExpiry: new Date(medicalCertificateExpiry),
      backgroundCheckDate: backgroundCheckDate ? new Date(backgroundCheckDate) : new Date(),
      assignedVehicleId: assignedVehicleId || null,
      availabilitySchedule: availabilitySchedule || 'Standard',
      emergencyContact: emergencyContact || {},
    });

    user.driverProfile = driverProfile._id;
    await user.save();

    await logAuditEvent({
      actorId: req.user._id,
      targetUserId: user._id,
      action: 'user.provision.hearse_driver',
      roleGranted: 'hearse_driver',
      req,
      metadata: { employeeId, licenseNumber, licenseClass },
    });

    res.status(201).json({
      message: 'Hearse driver successfully provisioned.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        provisionedBy: req.user._id,
        driverProfile,
      },
    });
  } catch (error) {
    console.error('Provision hearse driver error:', error);
    res.status(500).json({ message: error.message || 'Error provisioning hearse driver.' });
  }
};

/**
 * Privileged Provisioning: Funeral Manager (Section 5.5)
 */
exports.createFuneralManager = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      dateOfBirth,
      employeeId,
      managedBranch,
      reportingTo,
      hireDate,
      yearsOfExperience,
      managementCertifications,
      emergencyContact,
      password,
    } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    const existingEmp = await FuneralManagerProfile.findOne({ employeeId });
    if (existingEmp) {
      return res.status(409).json({ message: 'Employee ID already in use.' });
    }

    // Verify reportingTo exists and is manager or admin
    const managerRef = await User.findById(reportingTo);
    if (!managerRef || !['admin', 'funeral_manager', 'manager'].includes(managerRef.role)) {
      return res.status(400).json({ message: 'Reporting manager must reference an active manager or admin.' });
    }

    const salt = await bcrypt.genSalt(10);
    const tempPassword = password || crypto.randomBytes(8).toString('hex') + 'Aa1!';
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    const user = await User.create({
      name: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone || '',
      role: 'funeral_manager',
      status: 'active',
      provisionedBy: req.user._id,
      isProfileComplete: true,
      authProvider: 'local',
    });

    const managerProfile = await FuneralManagerProfile.create({
      userId: user._id,
      employeeId,
      managedBranch,
      reportingTo,
      hireDate: hireDate ? new Date(hireDate) : new Date(),
      yearsOfExperience: Number(yearsOfExperience) || 0,
      managementCertifications: managementCertifications || [],
      emergencyContact: emergencyContact || {},
    });

    user.managerProfile = managerProfile._id;
    await user.save();

    await logAuditEvent({
      actorId: req.user._id,
      targetUserId: user._id,
      action: 'user.provision.funeral_manager',
      roleGranted: 'funeral_manager',
      req,
      metadata: { employeeId, managedBranch, reportingTo },
    });

    res.status(201).json({
      message: 'Funeral manager successfully provisioned.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        provisionedBy: req.user._id,
        managerProfile,
      },
    });
  } catch (error) {
    console.error('Provision funeral manager error:', error);
    res.status(500).json({ message: error.message || 'Error provisioning funeral manager.' });
  }
};

/**
 * Privileged Provisioning: Dedicated Admin Endpoint (Section 5.6)
 * Invariant 8: Dedicated endpoint requiring fresh step-up re-auth.
 * Emits high-severity audit event.
 */
exports.createAdmin = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      employeeId,
      accessTier,
      managedBranch,
      reportingTo,
      yearsOfExperience,
      managementCertifications,
      emergencyContact,
      password,
    } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    const existingAdminEmp = await AdminProfile.findOne({ employeeId });
    if (existingAdminEmp) {
      return res.status(409).json({ message: 'Employee ID already in use.' });
    }

    const salt = await bcrypt.genSalt(10);
    const tempPassword = password || crypto.randomBytes(8).toString('hex') + 'Aa1!';
    const hashedPassword = await bcrypt.hash(tempPassword, salt);

    const user = await User.create({
      name: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone || '',
      role: 'admin',
      status: 'active',
      provisionedBy: req.user._id,
      isProfileComplete: true,
      authProvider: 'local',
      mfaEnabled: false,
    });

    const adminProfile = await AdminProfile.create({
      userId: user._id,
      employeeId,
      accessTier: accessTier || 'ops_admin',
      managedBranch: managedBranch || 'Headquarters',
      reportingTo: reportingTo || req.user._id,
      yearsOfExperience: Number(yearsOfExperience) || 0,
      managementCertifications: managementCertifications || [],
      emergencyContact: emergencyContact || {},
      forcePasswordReset: true,
      mfaEnrolled: false,
    });

    user.adminProfile = adminProfile._id;
    await user.save();

    // High severity audit log (Section 5.6)
    await logAuditEvent({
      actorId: req.user._id,
      targetUserId: user._id,
      action: 'user.provision.admin',
      roleGranted: 'admin',
      req,
      metadata: {
        severity: 'HIGH',
        accessTier,
        employeeId,
        forcedPasswordReset: true,
      },
    });

    res.status(201).json({
      message: 'Admin successfully provisioned with mandatory password reset on first login.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        provisionedBy: req.user._id,
        adminProfile,
      },
    });
  } catch (error) {
    console.error('Provision admin error:', error);
    res.status(500).json({ message: error.message || 'Error provisioning admin.' });
  }
};

/**
 * Privileged Provisioning: Invite Flow (Section 5.7)
 * Creates a PendingInvite with 72h expiry for Google OAuth or direct onboarding.
 */
exports.createInvite = async (req, res) => {
  try {
    const { email, role, seedData } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    // 72-hour signed token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

    const invite = await PendingInvite.findOneAndUpdate(
      { email: normalizedEmail },
      {
        email: normalizedEmail,
        role,
        seedData: seedData || {},
        token,
        expiresAt,
        consumedAt: null,
        createdBy: req.user._id,
      },
      { upsert: true, new: true }
    );

    await logAuditEvent({
      actorId: req.user._id,
      action: 'user.invite.created',
      roleGranted: role,
      req,
      metadata: { invitedEmail: normalizedEmail, expiresAt },
    });

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const inviteLink = `${clientUrl}/login?invite=${token}&email=${encodeURIComponent(normalizedEmail)}`;

    res.status(201).json({
      message: 'Privileged user invite created successfully.',
      invite: {
        _id: invite._id,
        email: invite.email,
        role: invite.role,
        expiresAt: invite.expiresAt,
        token: invite.token,
        inviteLink,
      },
    });
  } catch (error) {
    console.error('Create invite error:', error);
    res.status(500).json({ message: error.message || 'Error creating invite.' });
  }
};

/**
 * List all users with filtering (role, branch, status)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query;
    const filter = {};

    if (role && role !== 'all') {
      filter.role = role;
    }
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .populate('staffProfile')
      .populate('driverProfile')
      .populate('managerProfile')
      .populate('adminProfile')
      .populate('provisionedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: error.message || 'Error retrieving users.' });
  }
};

/**
 * Update user role
 * Invariant 2: Promoting to admin requires fresh step-up token
 */
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, stepUpToken } = req.body;

    const validRoles = [
      'customer',
      'funeral_staff',
      'hearse_driver',
      'funeral_manager',
      'admin',
      'staff',
      'driver',
      'manager',
    ];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role requested.' });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Step-up verification required if promoting to admin
    if (role === 'admin') {
      const token = stepUpToken || req.headers['x-step-up-token'];
      if (!token) {
        return res.status(403).json({
          message: 'Forbidden: Step-up authentication required to grant admin role.',
        });
      }

      const secret = process.env.STEP_UP_SECRET || (process.env.JWT_SECRET + '_stepup');
      try {
        const decoded = jwt.verify(token, secret);
        if (decoded.adminId !== req.user._id.toString() || decoded.action !== 'step-up') {
          return res.status(403).json({ message: 'Forbidden: Invalid step-up token.' });
        }
        if ((Date.now() / 1000) - decoded.iat > 300) {
          return res.status(403).json({ message: 'Forbidden: Step-up token expired.' });
        }
      } catch {
        return res.status(403).json({ message: 'Forbidden: Step-up verification failed.' });
      }
    }

    const previousRole = targetUser.role;
    targetUser.role = role;
    await targetUser.save();

    await logAuditEvent({
      actorId: req.user._id,
      targetUserId: targetUser._id,
      action: 'user.role.updated',
      roleGranted: role,
      req,
      metadata: { previousRole, newRole: role },
    });

    res.json({
      message: `User role successfully updated from ${previousRole} to ${role}.`,
      user: {
        _id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
      },
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: error.message || 'Error updating user role.' });
  }
};

/**
 * Soft-delete user (sets status = suspended)
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.status = 'suspended';
    await user.save();

    await logAuditEvent({
      actorId: req.user._id,
      targetUserId: user._id,
      action: 'user.account.suspended',
      req,
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: error.message || 'Error deleting user.' });
  }
};
