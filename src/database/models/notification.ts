import { Schema, Types, model } from 'mongoose';

// Interface
export interface INotificationSenderDetails {
  _id: Types.ObjectId;
  name: string;
  avatar_url: string;
}

export interface INotification {
  _id?: Types.ObjectId;
  room_id: Types.ObjectId | string;
  user_id: Types.ObjectId | string;
  sender_id: Types.ObjectId | INotificationSenderDetails | string;
  sender_name?: string;
  sender_avatar?: string;
  fcm_id?: string;
  status: string;
  message: string;
  type: string;
}

const NotificationSchema = new Schema<INotification>({
  room_id: {
    type: Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sender_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fcm_id: {
    type: String,
    required: true,
    default: 'none',
  },
  status: {
    type: String,
    required: true,
    enum: ['sent', 'read'],
    default: 'sent',
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['text', 'image', 'audio'],
  },
});

export const Notification = model<INotification>(
  'Notification',
  NotificationSchema
);