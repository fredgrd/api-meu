import { Request, Response } from 'express';
import { MongooseError } from 'mongoose';
import { APIError } from '../database/models/errors';
import { TwilioService } from '../services/twilioService';
import { Twilio } from 'twilio';

import { User } from '../database/models/user';

import { signSignupToken } from '../helpers/apiTokens';
import { signAuthToken } from '../helpers/apiTokens';

// Starts the phone number verification
// Checks if the provided number is valid and well formatted
// Sends an OTP to the provided phone number as a SMS
export const startVerificationCheck = async (req: Request, res: Response) => {
  const number = req.body.number;

  const twilioService = new TwilioService();

  // Lookup number
  const lookupResult = await twilioService.lookupNumber(number);
  switch (lookupResult) {
    case TwilioService.LookupNumberStatus.Failed:
      res.status(400).send('Number is not valid');
      return;
    case TwilioService.LookupNumberStatus.Error:
      res.status(500).send('Lookup service error');
      return;
  }

  // Verification attemp
  const verificationAttempt = await twilioService.createVerificationAttempt(
    number
  );
  switch (verificationAttempt) {
    case TwilioService.CreateVerificationAttemptStatus.Success:
      res.sendStatus(200);
      return;
    case TwilioService.CreateVerificationAttemptStatus.Failed:
      res.status(400).send('Verification attempt failed');
      return;
    case TwilioService.CreateVerificationAttemptStatus.Error:
      res.status(500).send('Verification service error');
      return;
  }
};

// Completes the number verification
// Checks OTP validity for the provided phone number
// If a user exists return the user document along w/ an AuthToken
// If a user does not exist returns a SignupToken
export const completeVerificationCheck = async (
  req: Request,
  res: Response
) => {
  const number: string = req.body.number;
  const code: string = req.body.code;

  const twilioService = new TwilioService();

  const verificationCheck = await twilioService.createVerificationCheck(
    number,
    code
  );
  switch (verificationCheck) {
    case TwilioService.CreateVerificationCheckStatus.Success:
      break;
    case TwilioService.CreateVerificationCheckStatus.Failed:
      res.status(400).send('Code in invalid');
      return;
    case TwilioService.CreateVerificationCheckStatus.Error:
      res.status(500).send(APIError.Internal);
      return;
  }

  try {
    const user = await User.findOne({ number: number }).orFail();

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

    res.status(200).json({ user: user, new_user: false });
    return;
  } catch (error) {
    const mongooseError = error as MongooseError;

    if (mongooseError.name !== 'DocumentNotFoundError') {
      console.log(`CheckVerification error: ${mongooseError.name} ${mongooseError.message}`);
      res.status(500).send(mongooseError.message);
      return;
    }
  }

  // If user does not exist create a SignupToken
  const token = signSignupToken(number);

  res.cookie('signup_token', token, {
    maxAge: 60 * 10 * 1000, // 60s * 10m => 10 minutes in seconds => in milliseconds
    httpOnly: true,
    secure: true,
    domain: 'api.dinolab.one',
  });

  res.status(200).json({ user: null, new_user: true });
};

// Logous out the user
// Clears the user AuthToken from the browser
export const logout = async (req: Request, res: Response) => {
  res.clearCookie('auth_token');
  res.sendStatus(200);
};
