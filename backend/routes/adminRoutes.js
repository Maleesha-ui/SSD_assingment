const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getDashboardStats,
  getAllOrders,
  getAllPayments,
  updateOrderStatus,
  getAllBookings,
  createBooking,
  updateBooking,
  deleteBooking,
  getAllPackages,
  createPackage,
  updatePackage,
  deletePackage,
  approveLeaveRequest,
  addStaff,
  assignTask,
  getAttendanceReport,
  getFeedbacks,
  deleteFeedbackById,
  updateFeedbackById,
  getAllStaffTasks,
  getAllLeaveRequests
} = require('../controllers/adminController');
const { getAllUsers } = require('../controllers/userController');

router.get('/stats', protect, admin, getDashboardStats);
router.get('/orders', protect, admin, getAllOrders);
router.get('/users', protect, admin, getAllUsers);
router.get('/payments', protect, admin, getAllPayments);
router.put('/orders/:id/status', protect, admin, updateOrderStatus);

router.get('/bookings/get-all-bookings', protect, admin, getAllBookings);
router.post('/bookings/new-booking', protect, admin, createBooking);
router.put('/bookings/update-booking/:id', protect, admin, updateBooking);
router.delete('/bookings/:id', protect, admin, deleteBooking);

router.get('/package/get-all-packages', protect, admin, getAllPackages);
router.post('/package/new-package', protect, admin, createPackage);
router.put('/package/update-package/:id', protect, admin, updatePackage);
router.delete('/package/:id', protect, admin, deletePackage);

router.get('/debug', (req, res) => {
  res.json({ message: 'Admin API is working correctly' });
});

// New admin routes for staff management
router.post('/staff/add', protect, admin, addStaff);
router.post('/staff/assign-task', protect, admin, assignTask);
router.get('/staff/tasks', protect, admin, getAllStaffTasks);
router.put('/staff/leave/:leaveId', protect, admin, approveLeaveRequest);
router.get('/staff/leave-requests', protect, admin, getAllLeaveRequests);
router.get('/staff/attendance-report', protect, admin, getAttendanceReport);

router.get('/feedback/get-feedbacks',protect, admin,getFeedbacks);
router.put('/feedback/update-feedback/:id',protect, admin,updateFeedbackById);
router.delete('/feedback/delete-feedback/:id',protect, admin,deleteFeedbackById);

module.exports = router;