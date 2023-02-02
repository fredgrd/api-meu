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
exports.TwilioService = void 0;
const twilio_1 = require("twilio");
class TwilioService {
    constructor() {
        this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
        this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
        this.client = new twilio_1.Twilio(this.accountSid, this.authToken);
    }
    lookupNumber(number) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const phoneNumber = yield this.client.lookups.v1
                    .phoneNumbers(number)
                    .fetch();
                if (phoneNumber) {
                    return TwilioService.LookupNumberStatus.Success;
                }
                else {
                    return TwilioService.LookupNumberStatus.Failed;
                }
            }
            catch (error) {
                console.log(`LookupNumber error: ${error}`);
                return TwilioService.LookupNumberStatus.LookupError;
            }
        });
    }
    createVerificationAttempt(number) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
            if (serviceSid) {
                console.log(`About to create a verification attempt for: ${number}`);
                try {
                    const attempt = yield this.client.verify.v2
                        .services(serviceSid)
                        .verifications.create({ to: number, channel: 'sms' });
                    if (attempt.status === 'pending') {
                        console.log(`Verification attempt started for: ${number}`);
                        return TwilioService.CreateVerificationAttemptStatus.Success;
                    }
                    else {
                        console.log(`Verification attempt failed for: ${number}`);
                        return TwilioService.CreateVerificationAttemptStatus.Failed;
                    }
                }
                catch (error) {
                    console.log(`CreateVerificationAttempt error: ${error}`);
                    return TwilioService.CreateVerificationAttemptStatus.AttemptError;
                }
            }
            else {
                return TwilioService.CreateVerificationAttemptStatus.ServiceError;
            }
        });
    }
    createVerificationCheck(number, code) {
        return __awaiter(this, void 0, void 0, function* () {
            const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
            if (serviceSid) {
                console.log(`About to create a verification check for: ${number}, with code: ${code}`);
                try {
                    const check = yield this.client.verify.v2
                        .services(serviceSid)
                        .verificationChecks.create({ to: number, code: code });
                    if (check.status === 'approved') {
                        console.log('Verification check approved');
                        return TwilioService.CreateVerificationCheckStatus.Success;
                    }
                    else {
                        console.log('Verification check failed');
                        return TwilioService.CreateVerificationCheckStatus.Failed;
                    }
                }
                catch (error) {
                    console.log(`CreateVerificationCheck error: ${error}`);
                    return TwilioService.CreateVerificationCheckStatus.CheckError;
                }
            }
            else {
                return TwilioService.CreateVerificationCheckStatus.ServiceError;
            }
        });
    }
}
exports.TwilioService = TwilioService;
(function (TwilioService) {
    let CreateVerificationCheckStatus;
    (function (CreateVerificationCheckStatus) {
        CreateVerificationCheckStatus[CreateVerificationCheckStatus["Success"] = 0] = "Success";
        CreateVerificationCheckStatus[CreateVerificationCheckStatus["Failed"] = 1] = "Failed";
        CreateVerificationCheckStatus[CreateVerificationCheckStatus["CheckError"] = 2] = "CheckError";
        CreateVerificationCheckStatus[CreateVerificationCheckStatus["ServiceError"] = 3] = "ServiceError";
    })(CreateVerificationCheckStatus = TwilioService.CreateVerificationCheckStatus || (TwilioService.CreateVerificationCheckStatus = {}));
    let LookupNumberStatus;
    (function (LookupNumberStatus) {
        LookupNumberStatus[LookupNumberStatus["Success"] = 0] = "Success";
        LookupNumberStatus[LookupNumberStatus["Failed"] = 1] = "Failed";
        LookupNumberStatus[LookupNumberStatus["LookupError"] = 2] = "LookupError";
    })(LookupNumberStatus = TwilioService.LookupNumberStatus || (TwilioService.LookupNumberStatus = {}));
    let CreateVerificationAttemptStatus;
    (function (CreateVerificationAttemptStatus) {
        CreateVerificationAttemptStatus[CreateVerificationAttemptStatus["Success"] = 0] = "Success";
        CreateVerificationAttemptStatus[CreateVerificationAttemptStatus["Failed"] = 1] = "Failed";
        CreateVerificationAttemptStatus[CreateVerificationAttemptStatus["AttemptError"] = 2] = "AttemptError";
        CreateVerificationAttemptStatus[CreateVerificationAttemptStatus["ServiceError"] = 3] = "ServiceError";
    })(CreateVerificationAttemptStatus = TwilioService.CreateVerificationAttemptStatus || (TwilioService.CreateVerificationAttemptStatus = {}));
})(TwilioService = exports.TwilioService || (exports.TwilioService = {}));
