import { Schema, Types, model } from 'mongoose';

// Interfaces
export interface IUser {
  _id?: Types.ObjectId;
  number: string;
  name: string;
  createdAt?: Date;
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Model
export const User = model<IUser>('User', UserSchema);
