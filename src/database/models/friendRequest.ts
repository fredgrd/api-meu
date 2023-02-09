import { Schema, Types, model } from 'mongoose';

// Interfaces
export interface IFriendRequest {
  _id?: Types.ObjectId;
  to: string;
  from: string;
}

// Schemas
const FriendRequestSchema = new Schema({
  from: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
});

// Model
export const FriendRequest = model<IFriendRequest>(
  'FriendRequest',
  FriendRequestSchema
);
