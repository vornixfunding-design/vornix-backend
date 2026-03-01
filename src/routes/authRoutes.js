const express = require('express');
const { register, verifyOtp, login, resendOtp } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.post('/resend-otp', resendOtp);

module.exports = router;
