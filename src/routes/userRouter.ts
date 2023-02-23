import { Router } from 'express';
import multer, { memoryStorage } from 'multer';
import {
  createUser,
  deleteFriend,
  fetchFriendDetails,
  fetchUser,
  parseUserContacts,
  updateAvatar,
  updateStatus,
  updateToken,
} from '../controllers/userController';

const router = Router();

const storage = memoryStorage();
const upload = multer({ storage });

router.post('/create', createUser);

router.get('/fetch', fetchUser);

router.patch('/update-token', updateToken);

router.patch('/update-status', updateStatus);

router.patch('/update-avatar', upload.single('imagefile'), updateAvatar);

router.patch('/delete-friend', deleteFriend);

router.get('/fetch-friend', fetchFriendDetails);

router.post('/parse-contacts', parseUserContacts);

export { router as userRouter };
