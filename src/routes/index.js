import { Router } from 'express';
import { getHealth } from '../controllers/healthController.js';
import ctraderRoutes from './ctraderRoutes.js';

const router = Router();

router.get('/health', getHealth);
router.use('/ctrader', ctraderRoutes);

export default router;
