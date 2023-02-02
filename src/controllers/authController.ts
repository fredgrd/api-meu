import { Request, Response } from 'express';
import { TwilioService } from '../services/twilioService';

// Starts the phone number verification
// Checks if the provided number is valid and well formatted
// Sends an OTP to the provided phone number as a SMS
export const startVerification = async (req: Request, res: Response) => {
  const number = req.body.number;
  const twilioService = new TwilioService();

  // Lookup number
  const lookupNumber = await twilioService.lookupNumber(number);
  switch (lookupNumber) {
    case TwilioService.LookupNumberStatus.Failed:
      res.status(500).send('Failed to lookup the number');
      return;
    case TwilioService.LookupNumberStatus.LookupError:
      res.status(400).send('Number might not be valid');
      return;
  }

  // Create verification attempt
  const verificationAttempt = await twilioService.createVerificationAttempt(
    number
  );

  switch (verificationAttempt) {
    case TwilioService.CreateVerificationAttemptStatus.Success:
      res.sendStatus(200);
      break;
    case TwilioService.CreateVerificationAttemptStatus.Failed:
    case TwilioService.CreateVerificationAttemptStatus.AttemptError:
      res.status(400).send('Verification attempt failed');
      break;
    case TwilioService.CreateVerificationAttemptStatus.ServiceError:
      res.status(500).send('Verification attempt failed due to service error');
      break;
  }
};
