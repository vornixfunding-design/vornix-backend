import { Router } from 'express';
import { requestOtp, verifyOtpController } from '../controllers/otpController.js';

const router = Router();

router.post('/send', requestOtp);
router.post('/verify', verifyOtpController);

export default router;
