const User = require('../models/User');
const Staff = require('../models/Staff');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate({
        path: 'orders',
        select: 'orderNumber totalAmount status createdAt',
        options: { sort: { createdAt: -1 } }
      })
      .lean();

    res.json(users.map(user => ({
      ...user,
      staffDetails: user.role === 'staff' ? user.staffDetails : undefined,
      driverDetails: user.role === 'driver' ? user.driverDetails : undefined,
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Admin can view any user's profile (enforced at route level)
    // This controller is now protected by authorize('admin') middleware
    const user = await User.findById(userId)
      .select('-password')
      .populate({
        path: 'orders',
        select: 'orderNumber totalAmount status createdAt',
        options: { sort: { createdAt: -1 } }
      })
      .lean();

    if (!user) return res.status(404).json({ message: 'User not found' });

    const staffData = user.role === 'staff' ? await Staff.findOne({ userId }).select('tasks leaveRequests attendance leaveBalance') : null;
    res.json({ ...user, staffData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get own profile - for authenticated users to view their own profile
const getOwnProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId)
      .select('-password')
      .populate({
        path: 'orders',
        select: 'orderNumber totalAmount status createdAt',
        options: { sort: { createdAt: -1 } }
      })
      .lean();

    if (!user) return res.status(404).json({ message: 'User not found' });

    const staffData = user.role === 'staff' ? await Staff.findOne({ userId }).select('tasks leaveRequests attendance leaveBalance') : null;
    res.json({ ...user, staffData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  const { name, email, phone, address, staffDetails } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await User.updateOne({ _id: user._id }, { $set: { name, email, phone, address, ...(user.role === 'staff' && { staffDetails }) } });
    res.status(200).send({ message: 'Updated Successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (deletedUser.role === 'staff') {
      await Staff.findOneAndDelete({ userId });
    }
    
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserProfile,
  getOwnProfile,
  updateUserProfile,
  deleteUserAccount
};