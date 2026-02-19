import { Router } from 'express';
import { getHealth } from '../controllers/healthController.js';
import ctraderRoutes from './ctraderRoutes.js';
import authRoutes from './authRoutes.js';
import planRoutes from './planRoutes.js';
import otpRoutes from './otpRoutes.js';

const router = Router();

router.get('/health', getHealth);
router.use('/ctrader', ctraderRoutes);
router.use('/auth', authRoutes);
router.use('/plans', planRoutes);
router.use('/otp', otpRoutes);

export default router;
