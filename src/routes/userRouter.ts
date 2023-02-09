import { Router } from 'express';
import {
  createFriendRequest,
  createUser,
  filterContacts,
} from '../controllers/userController';

const router = Router();

router.post('/create', createUser);

router.post('/contacts-filter', filterContacts);

router.post('/create-request', createFriendRequest);

export { router as userRouter };
