// controllers/feedbackController.js
const Feedback = require('../models/Feedback');
const User = require('../models/User');

// Submit feedback
exports.submitFeedback = async (req, res) => {
  try {
    const { serviceType, message, rating } = req.body;
    
    const feedback = await Feedback.create({
      user: req.user._id,
      serviceType,
      message,
      rating: rating || null,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user's feedback history
exports.getUserFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Admin: Get all feedback
exports.getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Admin: Update feedback status
exports.updateFeedbackStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const feedback = await Feedback.findByIdAndUpdate(
      req.params._id,
      { status },
      { new: true }
    ).populate('user', 'name email');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};