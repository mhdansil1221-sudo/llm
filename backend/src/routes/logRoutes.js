import { Router } from 'express';
import { LogController } from '../controllers/logController.js';

const router = Router();

router.get('/', LogController.getLogs);
router.get('/stats', LogController.getStats);
router.delete('/clear', LogController.clearLogs);

export default router;
