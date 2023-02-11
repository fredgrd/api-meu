import { Schema, Types, model } from 'mongoose';

// Interfaces
export interface IUser {
  _id?: Types.ObjectId;
  number: string;
  name: string;
  avatar_url: string;
  friends: Types.ObjectId[] | UserFriendDetails[];
  created_at?: Date;
}

export interface UserFriendDetails {
  _id: String;
  number: String;
  name: String;
}

// Schemas
const UserSchema = new Schema({
  number: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  avatar_url: {
    type: String,
    required: true,
    default: '',
  },
  friends: {
    type: [Schema.Types.ObjectId],
    ref: 'User',
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// Model
export const User = model<IUser>('User', UserSchema);
