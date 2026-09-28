const express = require('express');
const router = express.Router();
const { protect, admin, stepUpAuth } = require('../middleware/auth');
const { privilegedRateLimiter } = require('../middleware/rateLimiter');
const {
  validateDto,
  createFuneralStaffDto,
  createHearseDriverDto,
  createFuneralManagerDto,
  createAdminDto,
  createInviteDto,
} = require('../middleware/validate');
const {
  stepUpAuth: stepUpController,
  createFuneralStaff,
  createHearseDriver,
  createFuneralManager,
  createAdmin,
  createInvite,
  getAllUsers,
  updateUserRole,
  deleteUser,
} = require('../controllers/adminUserController');

// All privileged user routes require valid JWT AND admin role (Invariants 2, 4, 5)
router.use(protect);
router.use(admin);

// Apply rate limiting (Invariant 10: 10/min/admin)
router.use(privilegedRateLimiter());

// Step-Up Re-Authentication (generates 5-min stepUpToken)
router.post('/step-up', stepUpController);

// Privileged Provisioning Endpoints with strict DTO whitelisting (Invariant 3)
router.post('/funeral-staff', validateDto(createFuneralStaffDto), createFuneralStaff);
router.post('/hearse-driver', validateDto(createHearseDriverDto), createHearseDriver);
router.post('/funeral-manager', validateDto(createFuneralManagerDto), createFuneralManager);

// Dedicated Admin Provisioning (Invariants 2 & 8: dedicated route + stepUpAuth guard)
router.post('/admin', stepUpAuth, validateDto(createAdminDto), createAdmin);

// Privileged User Invite Flow (Section 5.7)
router.post('/invite', validateDto(createInviteDto), createInvite);

// User Management Endpoints
router.get('/', getAllUsers);
router.patch('/:id/role', updateUserRole);
router.put('/:id/role', updateUserRole); // support PUT alias
router.delete('/:id', deleteUser);

module.exports = router;
