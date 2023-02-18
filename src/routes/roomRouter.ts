import { Router } from 'express';
import {
  createRoom,
  deleteRoom,
  fetchMessages,
  fetchRoom,
  fetchRooms,
} from '../controllers/roomController';

const router = Router();

router.post('/create', createRoom);

router.patch('/delete', deleteRoom);

router.get('/fetch', fetchRoom);

router.get('/rooms/fetch', fetchRooms);

router.get('/messages', fetchMessages);

export { router as roomRouter };
