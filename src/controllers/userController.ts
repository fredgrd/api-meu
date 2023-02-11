import { Request, Response } from 'express';
import { MongooseError } from 'mongoose';
import { verifySignupToken } from '../helpers/apiTokens';
import { signAuthToken } from '../helpers/apiTokens';
import { User } from '../database/models/user';
import { APIError } from '../database/models/errors';

import authenticateUser from '../helpers/authenticateUser';
import { areReducedContact, IReducedContact } from '../database/models/contact';
import { FriendRequest } from '../database/models/friendRequest';

/**
 * Creates a user document.
 *
 * @param req Express.Request
 * @param res Express.Response
 */
export const createUser = async (req: Request, res: Response) => {
  const token = req.cookies.signup_token;
  const name = req.body.name;

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

  try {
    const user = await User.create({
      number: signupToken.number,
      name: name,
      avatar_url: `https://ui-avatars.com/api/?size=300&name=${name}&length=1`,
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
      number: user.number,
      name: user.name,
      avatar_url: user.avatar_url,
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
    });

    console.log(user);

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

      res.status(200).json({
        id: user.id,
        number: user.number,
        name: user.name,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
      });
      return;
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
 * Fetches user's friends and linked requests.
 *
 * @param req Express.Request
 * @param res Express.Response
 * @returns
 */
export const fetchFriends = async (req: Request, res: Response) => {
  const authToken = authenticateUser(req, res, 'UserController/fetchFriends');

  if (!authToken) return;

  try {
    const requests = FriendRequest.find({
      $or: [{ to: authToken.number }, { from: authToken.number }],
    });
  } catch (error) {}
};

export const filterContacts = async (req: Request, res: Response) => {
  const authToken = authenticateUser(req, res, 'UserController/filterContacts');

  if (!authToken) {
    return;
  }

  const contacts: IReducedContact[] | any = req.body.contacts;

  if (contacts && areReducedContact(contacts)) {
    try {
      const contactNumbers = contacts.map((e) => e.number);
      const users = await User.find({
        number: { $in: contactNumbers },
      }).select('number');

      const requests = await FriendRequest.find({
        from: authToken.number,
        to: { $in: contactNumbers },
      });
      console.log(requests, authToken.number);

      const reducedContacts: IReducedContact[] = [];
      for (const user of users) {
        const contact = contacts.find((e) => e.number === user.number);
        const request = requests.find((e) => e.to === user.number);

        if (contact && request) {
          contact.is_user = true;
          contact.friend_request = true;
          reducedContacts.push(contact);
        } else if (contact) {
          contact.is_user = true;
          reducedContacts.push(contact);
        }
      }

      res.status(200).send({ contacts: reducedContacts });
    } catch (error) {
      const mongooseError = error as MongooseError;
      console.log(
        `UserController/filterContacts error: ${mongooseError.name} ${mongooseError.message}`
      );
      res.status(500).send(APIError.Internal);
    }
  } else {
    res.status(400).send('No contacts provided');
  }
};
