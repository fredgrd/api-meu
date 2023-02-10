import { Request, Response } from 'express';
import { MongooseError } from 'mongoose';
import { APIError } from '../database/models/errors';
import { FriendRequest } from '../database/models/friendRequest';
import { User } from '../database/models/user';

import authenticateUser from '../helpers/authenticateUser';

enum FriendRequestError {
  SameUser = "You can't send a request to yourself",
  ReceiverDoesNotExist = 'The contact is not a user',
  AlreadyFriends = 'You are already friends',
  AlreadySent = 'The request is still pending',
  AlreadyHandled = 'This request was already handled',
}

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
    res.status(400).send(FriendRequestError.SameUser);
    return;
  }

  try {
    // Check the receiver is actually a user
    const sender = await User.findById(authToken.id)
      .select('name avatar_url')
      .orFail();
    const receiver = await User.findOne({ number: to })
      .select('id name avatar_url friends')
      .orFail();

    if (receiver.friends.includes(authToken.id)) {
      res.status(400).send(FriendRequestError.AlreadyFriends);
      return;
    }

    let request = await FriendRequest.findOne({
      from: authToken.number,
      to: to,
    });

    if (request && request.status === 'pending') {
      res.status(400).send(FriendRequestError.AlreadySent);
      return;
    }

    request = await FriendRequest.create({
      from: authToken.number,
      from_user: authToken.id,
      to: to,
      to_user: receiver._id,
      status: 'pending',
    });

    res.status(200).json({
      id: request.id,
      from: authToken.number,
      from_user: {
        name: sender.name,
        avatar_url: sender.avatar_url,
      },
      to: request.to,
      to_user: {
        name: receiver.name,
        avatar_url: receiver.avatar_url,
      },
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

    if (request.status !== 'pending') {
      res.status(400).send(FriendRequestError.AlreadyHandled);
      return;
    }

    if (update === 'accept') {
      const sender = await User.findById(request.from_user).orFail();
      const receiver = await User.findById(request.to_user).orFail();

      if (
        sender.friends.includes(receiver.id) ||
        receiver.friends.includes(sender.id)
      ) {
        res.status(400).send(FriendRequestError.AlreadyFriends);
      }

      sender.friends.push(receiver.id);
      receiver.friends.push(sender.id);
      await sender.save();
      await receiver.save();

      request.status = 'accepted';
      await request.save();
    } else {
      request.status = 'rejected';
      await request.save();
    }

    res.status(200).send('OK');
  } catch (error) {
    const mongooseError = error as MongooseError;
    console.log(
      `FriendRequestController/updateFriendRequest error: ${mongooseError.name} ${mongooseError.message}`
    );
    res.status(500).send(APIError.Internal);
  }
};

/**
 * Fetch friend requests.
 *
 * @param req Express.Request
 * @param res Express.Response
 */
export const fetchFriendRequests = async (req: Request, res: Response) => {
  const authToken = authenticateUser(
    req,
    res,
    'FriendRequestController/fetchFriendRequests'
  );

  if (!authToken) return;

  try {
    const pendingRequests = await FriendRequest.find({
      status: 'pending',
      $or: [{ to: authToken.number }, { from: authToken.number }],
    })
      .populate('from_user to_user', { _id: 0, name: 1, avatar_url: 1 })
      .select({ _id: 1, from: 1, from_user: 1, to: 1, to_user: 1, status: 1 });

    const result = pendingRequests.map((e) => ({
      id: e.id,
      from: e.from,
      from_user: e.from_user,
      to: e.to,
      to_user: e.to_user,
    }));

    res.status(200).json(result);
  } catch (error) {
    const mongooseError = error as MongooseError;
    console.log(
      `FriendRequestController/fetchFriendRequests error: ${mongooseError.name} ${mongooseError.message}`
    );
    res.status(500).send(APIError.Internal);
  }
};
