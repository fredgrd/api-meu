import { Router } from 'express';
import {
  fetchNotifications,
  updateNotification,
} from '../controllers/notificationController';
import { NotificationService } from '../services/notificationService';

const router = Router();

router.get('/fetch', fetchNotifications);

router.patch('/update', updateNotification);

router.post('/test', (req, res) => {
  const services = new NotificationService();
  services.test();
  res.sendStatus(200);
});

export { router as notificationRouter };
