import { Router } from 'express';
import {
  createFriendRequest,
  fetchFriendRequests,
  updateFriendRequest,
} from '../controllers/friendRequestController';

const router = Router();

router.post('/create', createFriendRequest);

router.patch('/update', updateFriendRequest);

router.get('/fetch', fetchFriendRequests);

export { router as friendRequestRouter };
