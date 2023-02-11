import { Router } from 'express';
import {
  createUser,
  fetchUser,
  parseUserContacts,
} from '../controllers/userController';

const router = Router();

router.post('/create', createUser);

router.get('/fetch', fetchUser);

router.post('/parse-contacts', parseUserContacts);

export { router as userRouter };
