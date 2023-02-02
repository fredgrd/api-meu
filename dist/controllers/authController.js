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
