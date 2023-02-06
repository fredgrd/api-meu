import jwt from 'jsonwebtoken';
import { ISignupToken, isSignupToken } from '../database/models/signupToken';
import { IAuthToken, isAuthToken } from '../database/models/authToken';

export const signSignupToken = (number: string): string => {
  const signedToken = jwt.sign(
    { number: number },
    process.env.JWT_SIGN_SECRET || '',
    {
      expiresIn: '10m',
    }
  );
  return signedToken;
};

export const verifySignupToken = (token: string): ISignupToken | null => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SIGN_SECRET || '');

    if (isSignupToken(decoded)) {
      return decoded;
    } else {
      return null;
    }
  } catch (error) {
    console.log(`VerifySignupToken error: ${error}`);
    return null;
  }
};

export const signAuthToken = (token: IAuthToken): string => {
  const signedToken = jwt.sign(token, process.env.JWT_AUTH_SECRET || '', {
    expiresIn: '10d',
  });

  return signedToken;
};

export const verifyAuthToken = (token: string): IAuthToken | null => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_AUTH_SECRET || '');

    if (isAuthToken(decoded)) {
      return decoded;
    } else {
      return null;
    }
  } catch (error) {
    console.log(`VerifyAuthToken error: ${error}`);
    return null;
  }
};
