const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { requireUserOwnership } = require('../middleware/ownership');
const { getAllUsers, getUserProfile, updateUserProfile, deleteUserAccount } = require('../controllers/userController');

// List all users: Admin and Manager only
router.get('/', protect, authorize('admin', 'manager', 'funeral_manager'), getAllUsers);

// Access specific profile: Owner or Admin/Manager only (IDOR protection)
router.get('/:userId', protect, requireUserOwnership, getUserProfile);

router.put('/update-profile', protect, updateUserProfile);
router.delete('/delete-account', protect, deleteUserAccount);

module.exports = router;