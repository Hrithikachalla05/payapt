const express = require('express');
const router = express.Router();
const { register, login, verifyOTP, enable2FA, getMe, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/enable-2fa', protect, enable2FA);
router.get('/me', protect, getMe);
router.post('/change-password', protect, changePassword);

module.exports = router;