import { Schema, Types, model } from 'mongoose';

// Interfaces
export interface IFriendRequest {
  _id?: Types.ObjectId;
  from: string;
  from_user: Types.ObjectId | string;
  to: string;
  to_user: Types.ObjectId | string;
}

// Schemas
const FriendRequestSchema = new Schema({
  from: {
    type: String,
    required: true,
  },
  from_user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  to_user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

// Model
export const FriendRequest = model<IFriendRequest>(
  'FriendRequest',
  FriendRequestSchema
);
