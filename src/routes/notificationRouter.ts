import { Router } from 'express';
import {
  fetchNotifications,
  updateNotification,
} from '../controllers/notificationController';

const router = Router();

router.get('/fetch', fetchNotifications);

router.patch('/update', updateNotification);

export { router as notificationRouter };
