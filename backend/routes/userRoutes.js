const express = require('express');
const router = express.Router();
const {
  protect,
  authorize,
  requireSelfOrRole,
  stepUpAuth,
} = require('../middleware/auth');
const {
  validateDto,
  validateDirectoryQuery,
  selfUpdateUserDto,
} = require('../middleware/validate');
const { userEndpointRateLimiter } = require('../middleware/rateLimiter');
const {
  getAllUsers,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  deleteUserAccount,
  changeRole,
} = require('../controllers/userController');

// Apply rate limiting across user routes (Invariant 10: 60/min authenticated, 10/min unauthenticated)
router.use(userEndpointRateLimiter());

// 1. Directory Route (Invariant 2: Restricted to admin and manager)
router.get('/', protect, authorize('admin', 'manager'), validateDirectoryQuery, getAllUsers);

// 2. Convenience Self-Read Route
router.get('/me', protect, (req, res, next) => {
  req.params.userId = req.user._id.toString();
  next();
}, getUserProfile);

// 3. Backward-Compatible Profile Management Routes (used by existing frontend ProfilePage)
router.put('/update-profile', protect, validateDto(selfUpdateUserDto), updateUserProfile);
router.delete('/delete-account', protect, deleteUserAccount);

// 4. Role Update Route (Invariant: Admin only with step-up re-authentication)
router.patch('/:userId/role', protect, authorize('admin'), stepUpAuth, changeRole);
router.put('/:userId/role', protect, authorize('admin'), stepUpAuth, changeRole);

// 5. Parametric User Profile Routes (Invariants 3, 4, 5, 6)
router.get('/:userId', protect, requireSelfOrRole('admin', 'manager'), getUserProfile);
router.put('/:userId', protect, requireSelfOrRole('admin', 'manager'), validateDto(selfUpdateUserDto), updateUserProfile);
router.patch('/:userId', protect, requireSelfOrRole('admin', 'manager'), validateDto(selfUpdateUserDto), updateUserProfile);
router.delete('/:userId', protect, authorize('admin'), deleteUser);

module.exports = router;