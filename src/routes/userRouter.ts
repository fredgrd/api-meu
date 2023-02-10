import { Router } from 'express';
import {
  createFriendRequest,
  createUser,
  fetchUser,
  filterContacts,
} from '../controllers/userController';

const router = Router();

router.post('/create', createUser);

router.get('/fetch', fetchUser);

router.post('/contacts-filter', filterContacts);

router.post('/create-request', createFriendRequest);

export { router as userRouter };
