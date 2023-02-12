import { Router } from 'express';
import {
  createRoom,
  fetchMessages,
  fetchRooms,
} from '../controllers/roomController';

const router = Router();

router.post('/create', createRoom);

router.get('/rooms/fetch', fetchRooms);

router.get('/messages', fetchMessages);

export { router as roomRouter };
