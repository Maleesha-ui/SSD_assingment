const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getAllUsers, getUserProfile, updateUserProfile, deleteUserAccount } = require('../controllers/userController');

router.get('/', protect, getAllUsers);

router.get('/:userId', protect, getUserProfile);

router.put('/update-profile', protect, updateUserProfile);

router.delete('/delete-account', protect, deleteUserAccount);

router.get('/testing', async (req, res) => {
  try {
    return res.status(200).send({ message: 'Done' });
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
});

module.exports = router;