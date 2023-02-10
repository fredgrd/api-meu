import { Request, Response } from 'express';
import { MongooseError } from 'mongoose';
import { APIError } from '../database/models/errors';
import { FriendRequest } from '../database/models/friendRequest';
import { User } from '../database/models/user';

import authenticateUser from '../helpers/authenticateUser';

/**
 * Creates a friend request.
 *
 * @param req Express.Request
 * @param res Express.Response
 */
export const createFriendRequest = async (req: Request, res: Response) => {
  const authToken = authenticateUser(
    req,
    res,
    'FriendRequestController/createFriendRequest'
  );

  if (!authToken) return;

  const to: string | any = req.body.to;

  if (typeof to !== 'string') {
    res.status(400).send(APIError.NoData);
    return;
  }

  if (authToken.number == to) {
    res.status(400).send('SameUser');
    return;
  }

  try {
    // Check the receiver is actually a user
    const receiver = await User.findOne({ number: to }).select(
      'id name avatar_url'
    );

    if (!receiver) {
      res.status(400).send('ReceiverDoesNotExist');
      return;
    }

    let request = await FriendRequest.findOne({
      from: authToken.number,
      to: to,
    });

    if (request) {
      res.status(400).send('AlreadySent');
      return;
    }

    request = await FriendRequest.create({
      from: authToken.number,
      from_user: authToken.id,
      to: to,
      to_user: receiver._id,
    });

    res.status(200).json({
      id: request.id,
      from: authToken.number,
      to: request.to,
      name: receiver.name,
      avatar_url: receiver.avatar_url,
    });
    return;
  } catch (error) {
    const mongooseError = error as MongooseError;
    console.log(
      `FriendRequestController/createFriendRequest error: ${mongooseError.name} ${mongooseError.message}`
    );
    res.status(500).send(APIError.Internal);
    return;
  }
};

/**
 * Updates a friend request.
 *
 * @param req Express.Request
 * @param res Express.Response
 */
export const updateFriendRequest = async (req: Request, res: Response) => {
  const authToken = authenticateUser(
    req,
    res,
    'FriendRequestController/updateFriendRequest'
  );

  if (!authToken) return;

  const requestID: string | any = req.body.request_id;
  const update: string | any = req.body.update;

  if (typeof requestID !== 'string' || typeof update !== 'string') {
    res.status(400).send(APIError.NoData);
    return;
  }

  try {
    const request = await FriendRequest.findById(requestID).orFail();

    if (update === 'accept') {
      const sender = await User.findById(request.from_user).orFail();
      const receiver = await User.findById(request.to_user).orFail();
    } else {
    }
  } catch (error) {
    const mongooseError = error as MongooseError;
    console.log(
      `FriendRequestController/updateFriendRequest error: ${mongooseError.name} ${mongooseError.message}`
    );
    res.status(500).send(APIError.Internal);
  }
};
