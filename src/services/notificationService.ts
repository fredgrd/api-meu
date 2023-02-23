import { MongooseError } from 'mongoose';
import { messaging } from 'firebase-admin';

import { INotification, Notification } from '../database/models/notification';
import { IRoomMessageKind } from '../database/models/room';
import { User } from '../database/models/user';

export class NotificationService {
  private FCMessaging: messaging.Messaging;

  constructor() {
    this.FCMessaging = messaging();
  }

  async test() {
    this.FCMessaging.sendToDevice(
      ' fAMUqQYw0E_NlUl_-n9kja:APA91bHt1PwYsmlgN9pwzeAOtbN2BySvZ3r-UU7IB2EVWIyndGfPAzOBZSynDvrP7qHhYOZYmYDaFmOZTFXPfbXFCrsS3lttrXQfwN90NgvJY85tMKegaK5aSFd-WoxiZb4twCcHLER0',
      {
        notification: {
          title: 'Test',
          body: 'This is a test from server',
          click_action: `com.meu://home?room_id=63f0ae92b39dac50df7bf498`,
        },
      }
    );
  }

  async notifyFriends(
    roomID: string,
    ownerID: string,
    senderID: string,
    message: string,
    kind: IRoomMessageKind,
    connectedFriends: string[]
  ) {
    try {
      const user = await User.findById(ownerID).select('friends').orFail();

      // Filter ids
      let ids = user.friends.map((e) => e.toString());
      ids.push(ownerID.toString());
      ids = ids.filter((e) => !connectedFriends.includes(e));

      if (!ids.length) {
        return;
      }

      // Create notifications
      const notifications: INotification[] = ids.map((e) => {
        const notification: INotification = {
          room_id: roomID,
          user_id: e,
          sender_id: senderID,
          status: 'sent',
          message: message,
          kind: kind,
        };

        return notification;
      });

      await Notification.insertMany(notifications);

      const sender = await User.findById(senderID).select('name');
      const tokens = await User.find({ _id: { $in: ids } }).select('fcm_token');

      let notificationBody: string;
      switch (kind) {
        case IRoomMessageKind.text:
          notificationBody = message;
          break;
        case IRoomMessageKind.image:
          notificationBody = 'Sent you an image';
        case IRoomMessageKind.audio:
          notificationBody = 'Sent you an audio';
      }

      this.FCMessaging.sendToDevice(
        tokens.map((e) => e.fcm_token || ''),
        {
          notification: {
            title: sender?.name || '',
            body: notificationBody,
            click_action: `com.meu://home?room_id=${roomID}`,
          },
        }
      );
    } catch (error) {
      const mongooseError = error as MongooseError;
      console.log(
        `NotificationService/notifyFriends error: ${mongooseError.name} ${mongooseError.message}`
      );
      return;
    }
  }
}
