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
exports.logout = exports.completeVerificationCheck = exports.startVerificationCheck = void 0;
const errors_1 = require("../database/models/errors");
const twilioService_1 = require("../services/twilioService");
const user_1 = require("../database/models/user");
const apiTokens_1 = require("../helpers/apiTokens");
const apiTokens_2 = require("../helpers/apiTokens");
// Starts the phone number verification
// Checks if the provided number is valid and well formatted
// Sends an OTP to the provided phone number as a SMS
const startVerificationCheck = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const number = req.body.number;
    const twilioService = new twilioService_1.TwilioService();
    // Lookup number
    const lookupResult = yield twilioService.lookupNumber(number);
    switch (lookupResult) {
        case twilioService_1.TwilioService.LookupNumberStatus.Failed:
            res.status(400).send('Number is not valid');
            return;
        case twilioService_1.TwilioService.LookupNumberStatus.Error:
            res.status(500).send('Lookup service error');
            return;
    }
    // Verification attemp
    const verificationAttempt = yield twilioService.createVerificationAttempt(number);
    switch (verificationAttempt) {
        case twilioService_1.TwilioService.CreateVerificationAttemptStatus.Success:
            res.sendStatus(200);
            return;
        case twilioService_1.TwilioService.CreateVerificationAttemptStatus.Failed:
            res.status(400).send('Verification attempt failed');
            return;
        case twilioService_1.TwilioService.CreateVerificationAttemptStatus.Error:
            res.status(500).send('Verification service error');
            return;
    }
});
exports.startVerificationCheck = startVerificationCheck;
// Completes the number verification
// Checks OTP validity for the provided phone number
// If a user exists return the user document along w/ an AuthToken
// If a user does not exist returns a SignupToken
const completeVerificationCheck = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const number = req.body.number;
    const code = req.body.code;
    const twilioService = new twilioService_1.TwilioService();
    const verificationCheck = yield twilioService.createVerificationCheck(number, code);
    switch (verificationCheck) {
        case twilioService_1.TwilioService.CreateVerificationCheckStatus.Success:
            break;
        case twilioService_1.TwilioService.CreateVerificationCheckStatus.Failed:
            res.status(400).send('Code in invalid');
            return;
        case twilioService_1.TwilioService.CreateVerificationCheckStatus.Error:
            res.status(500).send(errors_1.APIError.Internal);
            return;
    }
    try {
        const user = yield user_1.User.findOne({ number: number }).orFail();
        // Set cookie
        const token = (0, apiTokens_2.signAuthToken)({
            id: user.id,
            number: user.number,
        });
        res.cookie('auth_token', token, {
            maxAge: 60 * 60 * 24 * 10 * 1000,
            httpOnly: true,
            secure: true,
            domain: 'api.dinolab.one',
        });
        res.status(200).json({
            user: {
                id: user.id,
                number: user.number,
                name: user.name,
                avatar_url: user.avatar_url,
                created_at: user.created_at,
            },
            new_user: false,
        });
        return;
    }
    catch (error) {
        const mongooseError = error;
        if (mongooseError.name !== 'DocumentNotFoundError') {
            console.log(`CheckVerification error: ${mongooseError.name} ${mongooseError.message}`);
            res.status(500).send(mongooseError.message);
            return;
        }
    }
    // If user does not exist create a SignupToken
    const token = (0, apiTokens_1.signSignupToken)(number);
    res.cookie('signup_token', token, {
        maxAge: 60 * 10 * 1000,
        httpOnly: true,
        secure: true,
        domain: 'api.dinolab.one',
    });
    res.status(200).json({ user: null, new_user: true });
});
exports.completeVerificationCheck = completeVerificationCheck;
// Logous out the user
// Clears the user AuthToken from the browser
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie('auth_token');
    res.sendStatus(200);
});
exports.logout = logout;
