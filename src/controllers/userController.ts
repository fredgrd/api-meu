import { Request, Response } from 'express';
import { MongooseError } from 'mongoose';
import { verifySignupToken } from '../helpers/apiTokens';
import { signAuthToken } from '../helpers/apiTokens';
import { User } from '../database/models/user';
import { APIError } from '../database/models/errors';

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
