import { Router } from 'express';
import { sendOTP, verifyOTPController } from '../controllers/otpController.js';

const router = Router();

router.post('/send', sendOTP);
router.post('/verify', verifyOTPController);

export default router;
