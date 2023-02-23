import { Request, Response } from 'express';
import { MongooseError } from 'mongoose';
import { verifySignupToken } from '../helpers/apiTokens';
import { signAuthToken } from '../helpers/apiTokens';
import { User, UserFriendDetails } from '../database/models/user';
import { APIError } from '../database/models/errors';

import authenticateUser from '../helpers/authenticateUser';
import S3Service from '../services/s3Service';

/**
 * Creates a user document.
 *
 * @param req Express.Request
 * @param res Express.Response
 */
export const createUser = async (req: Request, res: Response) => {
  const token = req.cookies.signup_token;
  const name = req.body.name;
  const fcmToken = req.body.fcm_token;

  if (!token || typeof token !== 'string') {
    console.log('CreateUser error: MissingToken');
    res.sendStatus(403);
    return;
  }

  // Verify token
  const signupToken = verifySignupToken(token);

  if (!signupToken) {
    console.log('CreateUser error: NotSignupToken');
    res.status(403).send(APIError.Forbidden);
    return;
  }

  // Verify data
  if (typeof name !== 'string' || typeof fcmToken !== 'string') {
    res.status(400).send(APIError.NoData);
    return;
  }

  try {
    const user = await User.create({
      fcm_token: fcmToken,
      number: signupToken.number,
      name: name,
      avatar_url: 'none',
    });

    // Set cookie
    const token = signAuthToken({
      id: user.id,
      number: user.number,
    });

    res.cookie('auth_token', token, {
      maxAge: 60 * 60 * 24 * 10 * 1000, // 60s * 60m * 24h * 10d => 10 Days in secods => in milliseconds
      httpOnly: true,
      secure: true,
      domain: 'api.dinolab.one',
    });

    res.clearCookie('signup_token');

    res.status(200).json({
      id: user.id,
      fcm_token: user.fcm_token,
      number: user.number,
      name: user.name,
      avatar_url: user.avatar_url,
      status: user.status,
      friends: [],
      created_at: user.created_at,
    });
  } catch (error) {
    const mongooseError = error as MongooseError;
    console.log(`CreateUser error: ${mongooseError.message}`);
    res.status(500).send(APIError.Internal);
  }
};

/**
 * Fetches the user document.
 * Responds with the user document if successfull.
 * Refreshes the auth_token.
 *
 * @param req Express.Request
 * @param res Express.Response
 */
export const fetchUser = async (req: Request, res: Response) => {
  const authToken = authenticateUser(req, res, 'UserController/fetchUser');

  if (!authToken) return;

  try {
    const user = await User.findById(authToken.id).populate('friends', {
      id: 1,
      number: 1,
      name: 1,
      avatar_url: 1,
    });

    if (user) {
      // Set cookie
      const token = signAuthToken({
        id: user.id,
        number: user.number,
      });

      res.cookie('auth_token', token, {
        maxAge: 60 * 60 * 24 * 10 * 1000, // 60s * 60m * 24h * 10d => 10 Days in secods => in milliseconds
        httpOnly: true,
        secure: true,
        domain: 'api.dinolab.one',
      });

      const userFriends = user.friends as UserFriendDetails[];

      res.status(200).json({
        id: user.id,
        fcm_token: user.fcm_token,
        number: user.number,
        name: user.name,
        avatar_url: user.avatar_url,
        status: user.status,
        friends: userFriends.map((e) => ({
          id: e._id,
          number: e.number,
          name: e.name,
          avatar_url: e.avatar_url,
        })),
        created_at: user.created_at,
      });
    } else {
      res.status(400).send('User not found');
    }
  } catch (error) {
    const mongooseError = error as MongooseError;
    console.log(
      `UserController/fetchUser error: ${mongooseError.name} ${mongooseError.message}`
    );
    res.status(500).send(APIError.Internal);
  }
};

/**
 * Update the user's avatar.
 *
 * @param req Express.Request
 * @param res Express.Response
 * @returns
 */
export const updateAvatar = async (req: Request, res: Response) => {
  const authToken = authenticateUser(req, res, 'RoomController/uploadImage');
  if (!authToken) return;

  const file = req.file?.buffer;

  if (!file) {
    console.log('RoomController/uploadImage error: NoFile');
    return;
  }

  const s3 = new S3Service();
  const path = await s3.uploadImage(file);

  if (!path) {
    res.status(500).send(APIError.Internal);
    return;
  }

  try {
    const user = await User.findByIdAndUpdate(
      authToken.id,
      {
        avatar_url: `https://d3s4go4cmdphqe.cloudfront.net/${path}`,
      },
      { new: true }
    )
      .populate('friends', {
        id: 1,
        number: 1,
        name: 1,
        avatar_url: 1,
      })
      .orFail();

    const userFriends = user.friends as UserFriendDetails[];

    res.status(200).json({
      id: user.id,
      fcm_token: user.fcm_token,
      number: user.number,
      name: user.name,
      avatar_url: user.avatar_url,
      status: user.status,
      friends: userFriends.map((e) => ({
        id: e._id,
        number: e.number,
        name: e.name,
        avatar_url: e.avatar_url,
      })),
      created_at: user.created_at,
    });
  } catch (error) {
    const mongooseError = error as MongooseError;
    console.log(
      `UserController/updateAvatar error: ${mongooseError.name} ${mongooseError.message}`
    );
    res.status(500).send(APIError.Internal);
  }
};

/**
 * Update the user's status.
 *
 * @param req Express.Request
 * @param res Express.Response
 * @returns
 */
export const updateStatus = async (req: Request, res: Response) => {
  const authToken = authenticateUser(req, res, 'UserController/updateStatus');

  if (!authToken) return;

  const status: string | any = req.body.status;

  if (typeof status !== 'string') {
    res.status(400).send(APIError.NoData);
    return;
  }

  try {
    const user = await User.findByIdAndUpdate(
      authToken.id,
      {
        status: status,
      },
      { new: true }
    )
      .populate('friends', {
        id: 1,
        number: 1,
        name: 1,
        avatar_url: 1,
      })
      .orFail();

    const userFriends = user.friends as UserFriendDetails[];

    res.status(200).json({
      id: user.id,
      fcm_token: user.fcm_token,
      number: user.number,
      name: user.name,
      avatar_url: user.avatar_url,
      status: user.status,
      friends: userFriends.map((e) => ({
        id: e._id,
        number: e.number,
        name: e.name,
        avatar_url: e.avatar_url,
      })),
      created_at: user.created_at,
    });
  } catch (error) {
    const mongooseError = error as MongooseError;
    console.log(
      `UserController/updateStatus error: ${mongooseError.name} ${mongooseError.message}`
    );
    res.status(500).send(APIError.Internal);
  }
};

/**
 * Fetches user's friends and linked requests.
 *
 * @param req Express.Request
 * @param res Express.Response
 * @returns
 */
export const fetchFriendDetails = async (req: Request, res: Response) => {
  const authToken = authenticateUser(req, res, 'UserController/fetchFriends');

  if (!authToken) return;

  const friendID: string | any = req.query.friend_id;

  if (typeof friendID !== 'string') {
    res.status(400).send(APIError.NoData);
    return;
  }

  try {
    const user = await User.findById(friendID)
      .select('status avatar_url')
      .orFail();

    res.status(200).json({ status: user.status, avatar_url: user.avatar_url });
  } catch (error) {
    const mongooseError = error as MongooseError;
    console.log(
      `UserController/fetchFriendDatails error: ${mongooseError.name} ${mongooseError.message}`
    );
    res.status(500).send(APIError.Internal);
  }
};

/**
 * Delete a friend from the user's friends list.
 *
 * @param req Express.Request
 * @param res Express.Response
 * @returns
 */
export const deleteFriend = async (req: Request, res: Response) => {
  const authToken = authenticateUser(req, res, 'UserController/deleteFriend');

  if (!authToken) return;

  const friendID: string | any = req.body.friend_id;

  if (typeof friendID !== 'string') {
    res.status(400).send(APIError.NoData);
    return;
  }

  try {
    await User.findByIdAndUpdate(friendID, {
      $pull: { friends: authToken.id },
    }).orFail();

    const user = await User.findByIdAndUpdate(
      authToken.id,
      { $pull: { friends: friendID } },
      { new: true }
    )
      .populate('friends', {
        id: 1,
        number: 1,
        name: 1,
        avatar_url: 1,
      })
      .orFail();

    const userFriends = user.friends as UserFriendDetails[];

    res.status(200).json({
      id: user.id,
      fcm_token: user.fcm_token,
      number: user.number,
      name: user.name,
      avatar_url: user.avatar_url,
      status: user.status,
      friends: userFriends.map((e) => ({
        id: e._id,
        number: e.number,
        name: e.name,
        avatar_url: e.avatar_url,
      })),
      created_at: user.created_at,
    });
  } catch (error) {
    const mongooseError = error as MongooseError;
    console.log(
      `UserController/deleteFriend error: ${mongooseError.name} ${mongooseError.message}`
    );
    res.status(500).send(APIError.Internal);
  }
};

/**
 * Parses the user's contacts.
 *
 * @param req Express.Request
 * @param res Express.Response
 */
export const parseUserContacts = async (req: Request, res: Response) => {
  const authToken = authenticateUser(
    req,
    res,
    'UserController/parseUserContacts'
  );

  if (!authToken) return;

  const contacts: string[] = req.body.contacts;

  if (contacts) {
    try {
      const users = await User.find({
        number: { $in: contacts },
      }).select({ _id: 0, number: 1 });

      res.status(200).json(users.map((e) => e.number));
    } catch (error) {
      const mongooseError = error as MongooseError;
      console.log(
        `UserController/parseUserContacts error: ${mongooseError.name} ${mongooseError.message}`
      );
      res.status(500).send(APIError.Internal);
    }
  } else {
    res.status(400).send('No contacts provided');
  }
};
