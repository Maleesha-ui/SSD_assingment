const mongoose = require('mongoose');
const User = require('../models/User');
const Staff = require('../models/Staff');
const { serializeUser } = require('../utils/userSerializer');
const { logAuditEvent } = require('../utils/auditLogger');

/**
 * Directory Listing Endpoint (V10 Remediation)
 * - Invariant 2: Restricted to admin and manager roles only.
 * - Invariant 11: Enforced pagination (default 20, capped at 100).
 * - Invariant 7: Response scoped via role-aware serializeUser.
 * - Invariant 9: Emits audit log for every directory query.
 */
exports.getAllUsers = async (req, res) => {
  try {
    const query = req.sanitizedQuery || req.query || {};
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const filter = {};

    if (query.role) {
      filter.role = query.role;
    }
    if (query.status) {
      filter.status = query.status;
    }
    if (query.q) {
      const searchRegex = new RegExp(query.q.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
      ];
    }

    const sortOption = query.sort || '-createdAt';

    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select('+phone')
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'orders',
          select: 'orderNumber totalAmount status createdAt',
          options: { sort: { createdAt: -1 } },
        })
        .populate('staffProfile driverProfile managerProfile adminProfile')
        .lean(),
    ]);

    const serializedData = users.map((u) => serializeUser(u, req.user));

    // Invariant 9: Audit log every directory read
    await logAuditEvent({
      actorId: req.user._id,
      action: 'user.directory.read',
      req,
      metadata: {
        filters: { role: query.role, status: query.status, q: query.q },
        page,
        limit,
        resultCount: serializedData.length,
        total,
      },
    });

    res.json({
      data: serializedData,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: error.message || 'Error fetching users.' });
  }
};

/**
 * Profile Reading Endpoint (V10 Remediation)
 * - Invariant 3 & 4: Only self, admin, or manager can read user profile.
 * - Invariant 5: Invalid ObjectId handled by middleware (400 Bad Request).
 * - Invariant 6: Uniform response (403 for unauthorized, 404 only for authorized).
 * - Invariant 7: Response serialized per caller's role.
 * - Invariant 9: Cross-user reads are audit logged.
 */
exports.getUserProfile = async (req, res) => {
  try {
    const targetId = req.params.userId || req.user._id;

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ message: 'Invalid user ID format.' });
    }

    const user = await User.findById(targetId)
      .select('+phone')
      .populate({
        path: 'orders',
        select: 'orderNumber totalAmount status createdAt',
        options: { sort: { createdAt: -1 } },
      })
      .populate('staffProfile driverProfile managerProfile adminProfile')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Invariant 9: Audit log cross-user profile access
    if (String(req.user._id) !== String(targetId)) {
      await logAuditEvent({
        actorId: req.user._id,
        targetUserId: targetId,
        action: 'user.profile.read.other',
        req,
      });
    }

    let staffData = null;
    if (user.role === 'staff' || user.role === 'funeral_staff') {
      staffData = await Staff.findOne({ userId: targetId })
        .select('tasks leaveRequests attendance leaveBalance')
        .lean();
    }

    const serialized = serializeUser({ ...user, staffData }, req.user);
    res.json(serialized);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: error.message || 'Error fetching user profile.' });
  }
};

/**
 * Update Profile Endpoint (V10 Remediation)
 * - Invariant 3: Self or admin only.
 * - Invariant 8: Strictly whitelisted fields. Prohibits role, status, email modification.
 */
exports.updateUserProfile = async (req, res) => {
  try {
    const targetId = req.params.userId || req.user._id;

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ message: 'Invalid user ID format.' });
    }

    const isSelf = String(req.user._id) === String(targetId);
    const isAdmin = req.user.role === 'admin';

    if (!isSelf && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden: Insufficient privileges.' });
    }

    // Prohibit self-modification of privileged fields
    const forbiddenFields = ['role', 'email', 'status', 'password', 'passwordResetRequired', 'mfaEnabled', 'isAdmin'];
    for (const field of forbiddenFields) {
      if (req.body[field] !== undefined) {
        return res.status(400).json({
          message: `Modifying field '${field}' is not permitted.`,
          error: 'FORBIDDEN_FIELD_MODIFICATION',
          field,
        });
      }
    }

    const user = await User.findById(targetId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, fullName, phone, address, avatar, staffDetails } = req.body;
    if (name || fullName) user.name = (name || fullName).trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (address !== undefined) user.address = address.trim();
    if (avatar !== undefined) user.avatar = avatar;

    if ((user.role === 'staff' || user.role === 'funeral_staff') && staffDetails) {
      user.staffDetails = { ...user.staffDetails, ...staffDetails };
    }

    await user.save();

    await logAuditEvent({
      actorId: req.user._id,
      targetUserId: user._id,
      action: 'user.profile.update',
      req,
      metadata: { updatedFields: Object.keys(req.body) },
    });

    const serialized = serializeUser(user, req.user);
    res.status(200).json(serialized);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: error.message || 'Error updating profile.' });
  }
};

/**
 * Admin Delete User Endpoint (V10 Remediation)
 * - Invariant: Admin only on DELETE /api/users/:userId
 */
exports.deleteUser = async (req, res) => {
  try {
    const targetId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ message: 'Invalid user ID format.' });
    }

    const user = await User.findById(targetId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = 'suspended';
    await user.save();

    await logAuditEvent({
      actorId: req.user._id,
      targetUserId: user._id,
      action: 'user.delete',
      req,
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: error.message || 'Error deleting user.' });
  }
};

/**
 * Self Delete Account Endpoint (Backward compatibility with frontend ProfilePage)
 */
exports.deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (deletedUser.role === 'staff' || deletedUser.role === 'funeral_staff') {
      await Staff.findOneAndDelete({ userId });
    }

    await logAuditEvent({
      actorId: req.user._id,
      targetUserId: userId,
      action: 'user.delete.self',
      req,
    });

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Change Role Endpoint (V10 Remediation)
 * - Requires admin role + step-up authentication token
 */
exports.changeRole = async (req, res) => {
  try {
    const targetId = req.params.userId;
    const { role } = req.body;

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
      return res.status(400).json({ message: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
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
      user: serializeUser(targetUser, req.user),
    });
  } catch (error) {
    console.error('Change role error:', error);
    res.status(500).json({ message: error.message || 'Error updating role.' });
  }
};