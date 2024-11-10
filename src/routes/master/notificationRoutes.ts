// src/routes/notificationRoutes.ts
import express from 'express';
import {
  getNotifications,
  saveNotification,
  markNotificationAsRead,
} from '../../controllers/master/notificationController';

const router = express.Router();

router.get('/notifications/:userId', getNotifications);
router.post('/notifications', saveNotification);
router.patch('/notifications/:id/read', markNotificationAsRead);

export default router;
