import { Router } from 'express';
import { createFriendRequest } from '../controllers/friendRequestController';

const router = Router();

router.post('/create', createFriendRequest);

export { router as friendRequestRouter };
