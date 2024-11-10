
import { Request, Response } from 'express';
import Notification from '../../models/master/notification';


export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    if (!userId) {
      res.status(400).json({ success: false, message: 'User ID is required' });
      return;
    }
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Save a new notification
export const saveNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, message, requestId } = req.body;

    if (!userId || !message || !requestId) {
      res.status(400).json({ success: false, message: 'Missing required fields' });
      return;
    }

    const newNotification = new Notification({ userId, message, requestId });
    await newNotification.save();

    res.status(201).json({ success: true, notification: newNotification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }

    res.status(200).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
};
