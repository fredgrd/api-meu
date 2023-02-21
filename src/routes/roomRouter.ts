import { Router } from 'express';
import multer, { memoryStorage } from 'multer';

import {
  createRoom,
  deleteRoom,
  fetchMessages,
  fetchRoom,
  fetchRooms,
  uploadAudio,
  uploadImage,
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

router.post('/image-upload', upload.single('imagefile'), uploadImage);

export { router as roomRouter };
