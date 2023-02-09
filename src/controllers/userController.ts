import { Request, Response } from 'express';
import { MongooseError } from 'mongoose';
import { verifySignupToken } from '../helpers/apiTokens';
import { signAuthToken } from '../helpers/apiTokens';
import { User } from '../database/models/user';
import { APIError } from '../database/models/errors';

import authenticateUser from '../helpers/authenticateUser';
import { areReducedContact, IReducedContact } from '../database/models/contact';
import { FriendRequest } from '../database/models/friendRequest';

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
      created_at: user.created_at,
    });
  } catch (error) {
    const mongooseError = error as MongooseError;
    console.log(`CreateUser error: ${mongooseError.message}`);
    res.status(500).send(APIError.Internal);
  }
};

export const filterContacts = async (req: Request, res: Response) => {
  const authToken = authenticateUser(req, res, 'UserController/filterContacts');

  if (!authToken) {
    return;
  }

  const contacts: IReducedContact[] | any = req.body.contacts;

  if (contacts && areReducedContact(contacts)) {
    try {
      const users = await User.find({
        number: { $in: contacts.map((e) => e.number) },
      }).select('number');

      const reducedContacts: IReducedContact[] = [];
      for (const user of users) {
        const contact = contacts.find((e) => e.number === user.number);

        if (contact) {
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

// Creates a friend request.
// From user (number) to receiver (number)
export const createFriendRequest = async (req: Request, res: Response) => {
  const authToken = authenticateUser(
    req,
    res,
    'UserController/createFriendRequest'
  );

  if (!authToken) {
    return;
  }

  const to: string | any = req.body.to;

  if (to && typeof to === 'string') {
    if (to === authToken.number) {
      res.status(400).send('Cannot add yourself');
      return;
    }

    try {
      const checkRequest = await FriendRequest.findOne({
        from: authToken.number,
        to: to,
      });

      if (checkRequest) {
        // Refresh the request
        res.sendStatus(200);
        return;
      }

      const request = await FriendRequest.create({
        from: authToken.number,
        to: to,
      });
      res
        .status(200)
        .send({ id: request.id, from: request.from, to: request.to });
    } catch (error) {
      const mongooseError = error as MongooseError;
      console.log(
        `UserController/createFriendRequest error: ${mongooseError.name} ${mongooseError.message}`
      );
      res.status(500).send(APIError.Internal);
    }
  } else {
    res.status(400).send('No receiver provided');
  }
};
