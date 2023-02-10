import { Router } from 'express';
import {
  createUser,
  fetchUser,
  filterContacts,
} from '../controllers/userController';

const router = Router();

router.post('/create', createUser);

router.get('/fetch', fetchUser);

router.post('/contacts-filter', filterContacts);

export { router as userRouter };
