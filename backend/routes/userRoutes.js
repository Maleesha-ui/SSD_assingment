const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const userController = require('../controllers/userController');

// Get all users - admin only
router.get('/', protect, authorize('admin'), userController.getAllUsers);

// Get user profile by ID - admin only (users should use their own profile endpoint)
router.get('/:userId', protect, authorize('admin'), userController.getUserProfile);

// Get own profile - any authenticated user
router.get('/profile/me', protect, userController.getOwnProfile);

// Update own profile - any authenticated user
router.put('/update-profile', protect, userController.updateUserProfile);

// Delete own account - any authenticated user
router.delete('/delete-account', protect, userController.deleteUserAccount);

router.get('/testing', async (req, res) => {
  try {
    return res.status(200).send({ message: 'Done' });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
});

module.exports = router;