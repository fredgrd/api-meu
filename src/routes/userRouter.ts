import { Router } from 'express';
import {
  createUser,
  fetchUser,
  parseUserContacts,
  updateStatus,
} from '../controllers/userController';

const router = Router();

router.post('/create', createUser);

router.get('/fetch', fetchUser);

router.patch('/update-status', updateStatus);

router.post('/parse-contacts', parseUserContacts);

export { router as userRouter };
