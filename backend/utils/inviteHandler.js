const PendingInvite = require('../models/PendingInvite');
const FuneralStaffProfile = require('../models/FuneralStaffProfile');
const HearseDriverProfile = require('../models/HearseDriverProfile');
const FuneralManagerProfile = require('../models/FuneralManagerProfile');
const AdminProfile = require('../models/AdminProfile');
const { logAuditEvent } = require('./auditLogger');

/**
 * Checks for a pending admin invite and promotes the user if one exists.
 * Invariant 1 & 2 & Functional Req 5.2 / 5.7:
 * - Public/Google registration defaults to 'customer'
 * - If email matches a valid unconsumed PendingInvite, user is upgraded to invited role
 * - Atomic execution preventing race conditions (Criteria #12)
 */
const processInviteForUser = async (user, email, req = null) => {
  const normalizedEmail = email.toLowerCase().trim();

  // Atomically claim the invite if not yet consumed and not expired
  const invite = await PendingInvite.findOneAndUpdate(
    {
      email: normalizedEmail,
      consumedAt: null,
      expiresAt: { $gt: new Date() },
    },
    {
      $set: { consumedAt: new Date() },
    },
    { new: true }
  );

  if (!invite) {
    return { promoted: false, role: user.role };
  }

  // Upgrade user role and link provisioning details
  user.role = invite.role;
  user.status = 'active';
  user.provisionedBy = invite.createdBy;
  user.isProfileComplete = true;

  const seed = invite.seedData || {};

  try {
    if (invite.role === 'funeral_staff' || invite.role === 'staff') {
      const profile = await FuneralStaffProfile.findOneAndUpdate(
        { userId: user._id },
        {
          userId: user._id,
          employeeId: seed.employeeId || `STF-${Date.now().toString().slice(-6)}`,
          department: seed.department || 'Operations',
          branch: seed.branch || 'Main Branch',
          hireDate: seed.hireDate || new Date(),
          employmentType: seed.employmentType || 'full-time',
          shift: seed.shift || 'morning',
          certifications: seed.certifications || [],
          emergencyContact: seed.emergencyContact || {},
        },
        { upsert: true, new: true }
      );
      user.staffProfile = profile._id;
    } else if (invite.role === 'hearse_driver' || invite.role === 'driver') {
      const profile = await HearseDriverProfile.findOneAndUpdate(
        { userId: user._id },
        {
          userId: user._id,
          employeeId: seed.employeeId || `DRV-${Date.now().toString().slice(-6)}`,
          licenseNumber: seed.licenseNumber || `LIC-${Date.now().toString().slice(-6)}`,
          licenseClass: seed.licenseClass || 'Commercial',
          licenseExpiry: seed.licenseExpiry || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          medicalCertificateExpiry:
            seed.medicalCertificateExpiry || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          backgroundCheckDate: seed.backgroundCheckDate || new Date(),
          assignedVehicleId: seed.assignedVehicleId || null,
          availabilitySchedule: seed.availabilitySchedule || 'Standard',
          emergencyContact: seed.emergencyContact || {},
        },
        { upsert: true, new: true }
      );
      user.driverProfile = profile._id;
    } else if (invite.role === 'funeral_manager' || invite.role === 'manager') {
      const profile = await FuneralManagerProfile.findOneAndUpdate(
        { userId: user._id },
        {
          userId: user._id,
          employeeId: seed.employeeId || `MGR-${Date.now().toString().slice(-6)}`,
          managedBranch: seed.managedBranch || 'Main Branch',
          reportingTo: seed.reportingTo || invite.createdBy,
          hireDate: seed.hireDate || new Date(),
          yearsOfExperience: seed.yearsOfExperience || 0,
          managementCertifications: seed.managementCertifications || [],
          emergencyContact: seed.emergencyContact || {},
        },
        { upsert: true, new: true }
      );
      user.managerProfile = profile._id;
    } else if (invite.role === 'admin') {
      const profile = await AdminProfile.findOneAndUpdate(
        { userId: user._id },
        {
          userId: user._id,
          employeeId: seed.employeeId || `ADM-${Date.now().toString().slice(-6)}`,
          accessTier: seed.accessTier || 'ops_admin',
          managedBranch: seed.managedBranch || 'Headquarters',
          reportingTo: seed.reportingTo || invite.createdBy,
          hireDate: seed.hireDate || new Date(),
          yearsOfExperience: seed.yearsOfExperience || 0,
          forcePasswordReset: true,
          mfaEnrolled: false,
          emergencyContact: seed.emergencyContact || {},
        },
        { upsert: true, new: true }
      );
      user.adminProfile = profile._id;
    }

    await user.save();

    await logAuditEvent({
      actorId: user._id,
      targetUserId: user._id,
      action: 'user.invite.consumed',
      roleGranted: invite.role,
      req,
      metadata: { inviteId: invite._id, invitedBy: invite.createdBy },
    });

    return { promoted: true, role: invite.role };
  } catch (error) {
    console.error('Error attaching profile during invite consumption:', error);
    await user.save();
    return { promoted: true, role: invite.role };
  }
};

module.exports = { processInviteForUser };
