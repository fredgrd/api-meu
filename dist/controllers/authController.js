"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startVerification = void 0;
const twilioService_1 = require("../services/twilioService");
// Starts the phone number verification
// Checks if the provided number is valid and well formatted
// Sends an OTP to the provided phone number as a SMS
const startVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const number = req.body.number;
    const twilioService = new twilioService_1.TwilioService();
    console.log("RECEIVED REQUEST");
    console.log(req.cookies);
    res.cookie('auth_token', "testCookie", {
        maxAge: 60 * 60 * 24 * 10 * 1000,
        httpOnly: true,
        secure: true,
        domain: 'api.dinolab.one',
    });
    return;
    // Lookup number
    const lookupNumber = yield twilioService.lookupNumber(number);
    switch (lookupNumber) {
        case twilioService_1.TwilioService.LookupNumberStatus.Failed:
            res.status(500).send('Failed to lookup the number');
            return;
        case twilioService_1.TwilioService.LookupNumberStatus.LookupError:
            res.status(400).send('Number might not be valid');
            return;
    }
    // Create verification attempt
    const verificationAttempt = yield twilioService.createVerificationAttempt(number);
    switch (verificationAttempt) {
        case twilioService_1.TwilioService.CreateVerificationAttemptStatus.Success:
            res.sendStatus(200);
            break;
        case twilioService_1.TwilioService.CreateVerificationAttemptStatus.Failed:
        case twilioService_1.TwilioService.CreateVerificationAttemptStatus.AttemptError:
            res.status(400).send('Verification attempt failed');
            break;
        case twilioService_1.TwilioService.CreateVerificationAttemptStatus.ServiceError:
            res.status(500).send('Verification attempt failed due to service error');
            break;
    }
});
exports.startVerification = startVerification;
// Completes the number verification
// Checks OTP validity for the provided phone number
// If a user exists return the user document along w/ an AuthToken
// If a user does not exist returns a SignupToken
// export const completeVerification = async (req: Request, res: Response) => {
//   const number = req.body.number;
//   const code = req.body.code;
//   const twilioService = new TwilioService();
//   // Code check
//   const codeCheck = await twilioService.createVerificationCheck(number, code);
//   switch (codeCheck) {
//     case TwilioService.CreateVerificationCheckStatus.Success:
//       // Try find the user
//       try {
//         const user = await User.findOne({ number: number }).orFail();
//         // Set cookie
//         const token = signAuthToken({
//           id: user.id,
//           stripe_id: user.stripe_id,
//           number: user.number,
//         });
//         res.cookie('auth_token', token, {
//           maxAge: 60 * 60 * 24 * 10 * 1000, // 60s * 60m * 24h * 10d => 10 Days in secods => in milliseconds
//           httpOnly: true,
//           secure: true,
//           domain: 'gastromia.com',
//         });
//         res.status(200).json({ user: user, status: 'UserExists' });
//         return;
//       } catch (error) {
//         const mongooseError = error as MongooseError;
//         if (mongooseError.name !== 'DocumentNotFoundError') {
//           console.log(`CheckVerification error: ${mongooseError.name}`);
//           res.sendStatus(500);
//           return;
//         }
//       }
//       // If user does not exist create a SignupToken
//       const token = signSignupToken(number);
//       res.cookie('signup_token', token, {
//         maxAge: 60 * 10 * 1000, // 60s * 10m => 10 minutes in seconds => in milliseconds
//         httpOnly: true,
//         secure: true,
//         domain: 'gastromia.com',
//       });
//       res.status(200).json({ user: null, status: 'NewUser' });
//       break;
//     case TwilioService.CreateVerificationCheckStatus.Failed:
//     case TwilioService.CreateVerificationCheckStatus.CheckError:
//       res.sendStatus(400);
//       break;
//     case TwilioService.CreateVerificationCheckStatus.ServiceError:
//       res.sendStatus(500);
//       break;
//   }
// };
