import { Schema, Types, model } from 'mongoose';
import { IUser } from './user';

// Interfaces
export interface IRoom {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  name: string;
  description: string;
  messages: IRoomMessage[];
}

export interface IRoomMessageUserDetails {
  _id: Types.ObjectId;
  name: string;
  number: string;
  avatar_url: string;
}

export enum IRoomMessageKind {
  text = 'text',
  audio = 'audio',
  image = 'image',
}

export interface IRoomMessage {
  _id?: Types.ObjectId;
  sender: IRoomMessageUserDetails | string;
  sender_name?: string;
  sender_number?: string;
  sender_thumbnail?: string;
  kind: IRoomMessageKind;
  message: string;
  timestamp?: Date;
}

export interface IRoomUpdate {
  kind: string;
  sender_name: string;
}

// Schemas
const RoomMessageSchema = new Schema<IRoomMessage>({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  kind: {
    type: String,
    enum: ['text', 'audio', 'image'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const RoomSchema = new Schema<IRoom>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  messages: {
    type: [RoomMessageSchema],
    required: true,
    default: [],
  },
});

// Model
export const Room = model<IRoom>('Room', RoomSchema);
