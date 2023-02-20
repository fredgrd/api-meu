import { Router } from 'express';
import multer, { memoryStorage } from 'multer';

import {
  createRoom,
  deleteRoom,
  fetchMessages,
  fetchRoom,
  fetchRooms,
  uploadAudio,
} from '../controllers/roomController';

const router = Router();

const storage = memoryStorage();
const upload = multer({ storage });

router.post('/create', createRoom);

router.patch('/delete', deleteRoom);

router.get('/fetch', fetchRoom);

router.get('/rooms/fetch', fetchRooms);

router.get('/messages', fetchMessages);

router.post('/audio-upload', upload.single('audiofile'), uploadAudio);

export { router as roomRouter };
