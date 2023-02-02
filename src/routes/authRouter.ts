import { Router } from 'express';
import {
  startVerification,
  // completeVerification,
  // logout,
} from '../controllers/authController';

const router = Router();

router.post('/start', startVerification);

// router.post('/complete', completeVerification);

// router.get('/logout', logout);

export { router as authRouter };
