import { Router } from 'express';
import { generateField } from '../controllers/aiController';
import { validateGenerateFieldRequest } from '../middleware/validation';

const router = Router();

router.post('/generate-field', validateGenerateFieldRequest, generateField);

export const roleRoutes = router; 