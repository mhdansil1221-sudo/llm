import { Router } from 'express';
import { LLMController } from '../controllers/llmController.js';

const router = Router();

router.post('/execute', LLMController.executePrompt);
router.get('/presets', LLMController.getPresets);

export default router;
