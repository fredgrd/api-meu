import { Router } from 'express';
import {
  createRoom,
  deleteRoom,
  fetchMessages,
  fetchRooms,
} from '../controllers/roomController';

const router = Router();

router.post('/create', createRoom);

router.patch('/delete', deleteRoom);

router.get('/rooms/fetch', fetchRooms);

router.get('/messages', fetchMessages);

export { router as roomRouter };
