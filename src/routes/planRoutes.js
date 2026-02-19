import { Router } from 'express';
import { getAllPlans } from '../controllers/planController.js';

const router = Router();

router.get('/', getAllPlans);

export default router;
