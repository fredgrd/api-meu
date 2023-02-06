import { Router } from 'express';
import {
  startVerificationCheck,
  completeVerificationCheck,
  logout,
} from '../controllers/authController';

const router = Router();

router.post('/start', startVerificationCheck);

router.post('/complete', completeVerificationCheck);

router.get('/logout', logout);

export { router as authRouter };
