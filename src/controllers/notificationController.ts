import { Request, Response } from 'express';
import { MongooseError } from 'mongoose';
import { APIError } from '../database/models/errors';
import {
  INotificationRoomDetails,
  INotificationSenderDetails,
  Notification,
} from '../database/models/notification';

import authenticateUser from '../helpers/authenticateUser';

export const fetchNotifications = async (req: Request, res: Response) => {
  const authToken = authenticateUser(
    req,
    res,
    'NotificationController/fetchNotifications'
  );

  if (!authToken) return;

  try {
    const notifications = await Notification.find({
      user_id: authToken.id,
    })
      .populate('sender_id', { name: 1, avatar_url: 1 })
      .populate('room_id', { name: 1 });

    const result = notifications.map((e) => {
      const userDetails = e.sender_id as INotificationSenderDetails;
      const roomDetails = e.room_id as INotificationRoomDetails;

      return {
        id: e.id,
        room_id: roomDetails._id.toString(),
        room_name: roomDetails.name,
        user_id: e.user_id.toString(),
        sender_id: userDetails._id.toString(),
        sender_name: userDetails.name,
        sender_avatar: userDetails.avatar_url,
        fcm_id: e.fcm_id,
        status: e.status,
        message: e.message,
        type: e.type,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    const mongooseError = error as MongooseError;
    console.log(
      `NotificationController/fetchNotifications error: ${mongooseError.name} ${mongooseError.message}`
    );
    res.status(500).send(APIError.Internal);
  }
};
