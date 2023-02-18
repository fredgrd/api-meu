import { Router } from 'express';
import {
  startVerificationCheck,
  completeVerificationCheck,
} from '../controllers/authController';

const router = Router();

router.post('/start', startVerificationCheck);

router.post('/complete', completeVerificationCheck);

export { router as authRouter };
