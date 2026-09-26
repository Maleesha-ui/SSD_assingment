/**
 * Centralized Role-Aware User Serializer (V10 Remediation)
 * Invariant 7: Field-level scoping per caller role and ownership.
 * Password, password hashes, and internal credentials are never serialized.
 */

function serializeUser(user, viewer) {
  if (!user) return null;

  // Convert Mongoose document to plain object if needed
  const raw = typeof user.toObject === 'function' ? user.toObject() : { ...user };

  // Never leak password hashes or internal Mongoose revision key
  delete raw.password;
  delete raw.passwordHash;
  delete raw.__v;
  delete raw.refreshTokens;

  if (!viewer) {
    return null; // Deny by default if no authenticated viewer
  }

  const viewerId = viewer._id ? viewer._id.toString() : viewer.id?.toString();
  const targetId = raw._id ? raw._id.toString() : raw.id?.toString();
  const isSelf = viewerId && targetId && viewerId === targetId;
  const viewerRole = viewer.role;

  // 1. Admin Scope: Full operational and administrative access
  if (viewerRole === 'admin') {
    return {
      _id: raw._id,
      name: raw.name,
      email: raw.email,
      role: raw.role,
      status: raw.status,
      phone: raw.phone || '',
      address: raw.address || '',
      avatar: raw.avatar || '',
      isProfileComplete: Boolean(raw.isProfileComplete),
      mfaEnabled: Boolean(raw.mfaEnabled),
      authProvider: raw.authProvider || 'local',
      googleId: raw.googleId || undefined,
      passwordResetRequired: Boolean(raw.passwordResetRequired),
      provisionedBy: raw.provisionedBy || null,
      orders: raw.orders || [],
      staffProfile: raw.staffProfile || undefined,
      driverProfile: raw.driverProfile || undefined,
      managerProfile: raw.managerProfile || undefined,
      adminProfile: raw.adminProfile || undefined,
      staffDetails: raw.staffDetails || undefined,
      driverDetails: raw.driverDetails || undefined,
      adminDetails: raw.adminDetails || undefined,
      managerDetails: raw.managerDetails || undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  // 2. Manager Scope: Operational view across staff, drivers, and customers
  // Excludes sensitive security internals (passwordResetRequired, MFA secrets, etc.)
  if (viewerRole === 'manager' || viewerRole === 'funeral_manager') {
    return {
      _id: raw._id,
      name: raw.name,
      email: raw.email,
      role: raw.role,
      status: raw.status,
      phone: raw.phone || '',
      address: raw.address || '',
      avatar: raw.avatar || '',
      isProfileComplete: Boolean(raw.isProfileComplete),
      orders: raw.orders || [],
      staffProfile: raw.staffProfile || undefined,
      driverProfile: raw.driverProfile || undefined,
      managerProfile: raw.managerProfile || undefined,
      staffDetails: raw.staffDetails || undefined,
      driverDetails: raw.driverDetails || undefined,
      managerDetails: raw.managerDetails || undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  // 3. Self-Scope (Customer, Staff, Driver viewing their own profile)
  if (isSelf) {
    return {
      _id: raw._id,
      name: raw.name,
      email: raw.email,
      role: raw.role,
      status: raw.status,
      avatar: raw.avatar || '',
      phone: raw.phone || '',
      address: raw.address || '',
      isProfileComplete: Boolean(raw.isProfileComplete),
      orders: raw.orders || [],
      // Allow staff/driver to view their own assigned operational profiles
      ...(raw.role === 'staff' || raw.role === 'funeral_staff' ? {
        staffProfile: raw.staffProfile || undefined,
        staffDetails: raw.staffDetails || undefined,
      } : {}),
      ...(raw.role === 'driver' || raw.role === 'hearse_driver' ? {
        driverProfile: raw.driverProfile || undefined,
        driverDetails: raw.driverDetails || undefined,
      } : {}),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  // 4. Default Deny: Cross-user access by unauthorized viewer returns null
  return null;
}

module.exports = { serializeUser };
