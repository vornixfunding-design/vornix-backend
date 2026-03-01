import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { getProfile, sendOtp, verifyOtp } from '../controllers/authController.js';

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/profile', authMiddleware, getProfile);

export default router;
