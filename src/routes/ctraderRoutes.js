import { Router } from 'express';
import { handleCTraderCallback, redirectToCTraderLogin } from '../controllers/ctraderController.js';

const router = Router();

router.get('/login', redirectToCTraderLogin);
router.get('/callback', handleCTraderCallback);

export default router;
