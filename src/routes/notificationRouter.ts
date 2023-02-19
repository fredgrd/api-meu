import { Router } from 'express';
import { fetchNotifications } from '../controllers/notificationController';

const router = Router();

router.get('/fetch', fetchNotifications);

export { router as notificationRouter };
