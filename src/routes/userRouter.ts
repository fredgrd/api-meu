import { Router } from 'express';
import {
  createUser,
  deleteFriend,
  fetchFriendDetails,
  fetchUser,
  parseUserContacts,
  updateAvatar,
  updateStatus,
} from '../controllers/userController';

const router = Router();

router.post('/create', createUser);

router.get('/fetch', fetchUser);

router.patch('/update-status', updateStatus);

router.patch('/update-avatar', updateAvatar);

router.patch('/delete-friend', deleteFriend);

router.get('/fetch-friend', fetchFriendDetails);

router.post('/parse-contacts', parseUserContacts);

export { router as userRouter };
