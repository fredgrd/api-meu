import { Request, Response } from 'express';
import { IAuthToken } from '../database/models/authToken';
import { APIError } from '../database/models/errors';
import { verifyAuthToken } from './apiTokens';

// Authenticates the user according to the token provided
// If the token is not provied it fails
const authenticateUser = (
  req: Request,
  res: Response,
  from: string
): IAuthToken | null => {
  const token = req.cookies.auth_token;

  if (!token || typeof token !== 'string') {
    console.log(`${from} error: MissingToken`);
    res.status(403).send(APIError.MissingToken);
    return null;
  }

  // Verify token
  const authtoken = verifyAuthToken(token);

  if (!authtoken) {
    console.log(`${from} error: AuthTokenIvalid`);
    res.status(403).send(APIError.TokenInvalid);
    return null;
  }

  return authtoken;
};

export default authenticateUser;
