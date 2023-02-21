import { Request, Response } from 'express';
import { MongooseError } from 'mongoose';
import { APIError } from '../database/models/errors';
import { IRoomMessageUserDetails, Room } from '../database/models/room';
import S3Service from '../services/s3Service';

import authenticateUser from '../helpers/authenticateUser';

/**
 * Creates a user's room.
 *
 * @param req Express.Request
 * @param res Express.Response
 */
export const createRoom = async (req: Request, res: Response) => {
  const authToken = authenticateUser(req, res, 'RoomController/createRoom');

  if (!authToken) return;

  const name: string | any = req.body.name;
  const description: string | any = req.body.description;

  if (typeof name !== 'string' || typeof description !== 'string') {
    res.status(400).send(APIError.NoData);
    return;
  }

  try {
    const room = await Room.create({
      user: authToken.id,
      name: name,
      description: description,
      messages: [
        {
          sender: authToken.id,
          message: description,
        },
      ],
    });

    res.status(200).json({
      id: room.id,
      user: room.user,
      name: room.name,
      description: room.description,
    });
  } catch (error) {
    const mongooseError = error as MongooseError;
    console.log(
      `RoomController/createRoom error: ${mongooseError.name} ${mongooseError.message}`
    );
    res.status(500).send(APIError.Internal);
  }
};

/**
 * Delets a user's room.
 *
 * @param req Express.Request
 * @param res Express.Response
 */
export const deleteRoom = async (req: Request, res: Response) => {
  const authToken = authenticateUser(req, res, 'RoomController/deleteRoom');

  if (!authToken) return;

  const roomID: string | any = req.body.room_id;

  if (typeof roomID !== 'string') {
    res.status(400).send(APIError.NoData);
    return;
  }

  try {
    const result = await Room.deleteOne({ _id: roomID, user: authToken.id });

    if (result.acknowledged) {
      res.status(200).send('OK');
    } else {
      res.status(500).send(APIError.Internal);
    }
  } catch (error) {
    const mongooseError = error as MongooseError;
    console.log(
      `RoomController/deleteRoom error: ${mongooseError.name} ${mongooseError.message}`
    );
    res.status(500).send(APIError.Internal);
  }
};

/**
 * Fetches all the users room.
 *
 * @param req Express.Request
 * @param res Express.Response
 */
export const fetchRooms = async (req: Request, res: Response) => {
  const authToken = authenticateUser(req, res, 'RoomController/fetchRooms');

  if (!authToken) return;

  const userID: string | any = req.query.user_id;

  if (typeof userID !== 'string') {
    res.status(400).send(APIError.NoData);
    return;
  }

  try {
    const rooms = await Room.find({ user: userID }).select(
      'id, user name description'
    );

    res.status(200).json(
      rooms.map((e) => ({
        id: e.id,
        user: e.user,
        name: e.name,
        description: e.description,
      }))
    );
  } catch (error) {
    const mongooseError = error as MongooseError;
    console.log(
      `RoomController/fetchRooms error: ${mongooseError.name} ${mongooseError.message}`
    );
    res.status(500).send(APIError.Internal);
  }
};

/**
 * Fetches the room.
 *
 * @param req Express.Request
 * @param res Express.Response
 */
export const fetchRoom = async (req: Request, res: Response) => {
  const authToken = authenticateUser(req, res, 'RoomController/fetchRoom');

  if (!authToken) return;

  const roomID: string | any = req.query.room_id;

  if (typeof roomID !== 'string') {
    res.status(400).send(APIError.NoData);
    return;
  }

  try {
    const room = await Room.findById(roomID)
      .select('id, user name description')
      .orFail();

    res.status(200).json({
      id: room._id,
      user: room.user,
      name: room.name,
      description: room.description,
    });
  } catch (error) {
    const mongooseError = error as MongooseError;
    console.log(
      `RoomController/fetchRoom error: ${mongooseError.name} ${mongooseError.message}`
    );
    res.status(500).send(APIError.Internal);
  }
};

/**
 * Fetches the room's messages.
 *
 * @param req Express.Request
 * @param res Express.Response
 */
export const fetchMessages = async (req: Request, res: Response) => {
  const authToken = authenticateUser(req, res, 'RoomController/fetchMessages');

  if (!authToken) return;

  const roomID: string | any = req.query.room_id;

  if (typeof roomID !== 'string') {
    res.status(400).send(APIError.NoData);
    return;
  }

  try {
    const room = await Room.findById(roomID)
      .select('messages')
      .populate('messages.sender', { name: 1, number: 1, avatar_url: 1 })
      .orFail();

    const messages = room.messages.map((message) => {
      const userDetails = message.sender as IRoomMessageUserDetails;
      return {
        id: message._id,
        sender: userDetails._id,
        sender_name: userDetails.name,
        sender_number: userDetails.number,
        sender_thumbnail: userDetails.avatar_url,
        message: message.message,
        kind: message.kind,
        timestamp: message.timestamp,
      };
    });

    res.status(200).json(messages);
  } catch (error) {
    const mongooseError = error as MongooseError;
    console.log(
      `RoomController/fetchRooms error: ${mongooseError.name} ${mongooseError.message}`
    );
    res.status(500).send(APIError.Internal);
  }
};

/**
 * Upload the audio file.
 *
 * @param req Express.Request
 * @param res Express.Response
 */
export const uploadAudio = async (req: Request, res: Response) => {
  const authToken = authenticateUser(req, res, 'RoomController/fetchRoom');
  if (!authToken) return;

  const file = req.file?.buffer;

  if (!file) {
    console.log('RoomController/uploadAudio error: NoFile');
    return;
  }

  const s3 = new S3Service();
  const path = await s3.uploadAudio(file);

  if (path) {
    res
      .status(200)
      .json({ audio_url: `https://d3s4go4cmdphqe.cloudfront.net/${path}` });
    return;
  } else {
    res.status(500).send(APIError.Internal);
  }
};
