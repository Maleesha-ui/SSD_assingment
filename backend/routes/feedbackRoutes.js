// routes/feedbackRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { submitFeedback,getUserFeedback,getAllFeedback, updateFeedbackStatus} = require('../controllers/feedbackController')

// User routes
router.post('/submit-feedback', protect, submitFeedback);
router.get('/user', protect, getUserFeedback);

// router.get('/testing',async(req,res) => {
//     try{
//         return res.status(200).send({ message: 'Done'})
        
//     }catch(error){
//         return res.status(500).send({ message: error. message })
//     }
// })

// Admin routes
router.get('/', protect, authorize('admin'), getAllFeedback);
router.put('/:id/status', protect, authorize('admin'), updateFeedbackStatus);

module.exports = router;