const express = require('express');

const router = express.Router();
const {registerUser,loginUser,getUser,sendOTP,verifyOTP} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');


// OTP verification routes
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

router.post('/register',registerUser);
router.post('/login',loginUser);
router.get('/users',protect,admin,getUser);

module.exports = router;