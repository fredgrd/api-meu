import { Twilio } from 'twilio';

export class TwilioService {
  readonly accountSid: string;
  readonly authToken: string;
  readonly client: Twilio;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.client = new Twilio(this.accountSid, this.authToken);
  }

  async lookupNumber(
    number: string
  ): Promise<TwilioService.LookupNumberStatus> {
    try {
      const phoneNumber = await this.client.lookups.v1
        .phoneNumbers(number)
        .fetch();

      if (phoneNumber) {
        return TwilioService.LookupNumberStatus.Success;
      } else {
        return TwilioService.LookupNumberStatus.Failed;
      }
    } catch (error) {
      console.log(`LookupNumber error: ${error}`);
      return TwilioService.LookupNumberStatus.Error;
    }
  }

  async createVerificationAttempt(
    number: string
  ): Promise<TwilioService.CreateVerificationAttemptStatus> {
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    if (serviceSid) {
      console.log(`About to create a verification attempt for: ${number}`);

      try {
        const attempt = await this.client.verify.v2
          .services(serviceSid)
          .verifications.create({ to: number, channel: 'sms', locale: 'en' });

        if (attempt.status === 'pending') {
          console.log(`Verification attempt started for: ${number}`);
          return TwilioService.CreateVerificationAttemptStatus.Success;
        } else {
          console.log(`Verification attempt failed for: ${number}`);
          return TwilioService.CreateVerificationAttemptStatus.Failed;
        }
      } catch (error) {
        console.log(`CreateVerificationAttempt error: ${error}`);
        return TwilioService.CreateVerificationAttemptStatus.Error;
      }
    } else {
      return TwilioService.CreateVerificationAttemptStatus.Error;
    }
  }

  async createVerificationCheck(
    number: string,
    code: string
  ): Promise<TwilioService.CreateVerificationCheckStatus> {
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

    if (serviceSid) {
      console.log(
        `About to create a verification check for: ${number}, with code: ${code}`
      );

      try {
        const check = await this.client.verify.v2
          .services(serviceSid)
          .verificationChecks.create({ to: number, code: code });

        if (check.status === 'approved') {
          console.log('Verification check approved');
          return TwilioService.CreateVerificationCheckStatus.Success;
        } else {
          console.log('Verification check failed');
          return TwilioService.CreateVerificationCheckStatus.Failed;
        }
      } catch (error) {
        console.log(`CreateVerificationCheck error: ${error}`);
        return TwilioService.CreateVerificationCheckStatus.Error;
      }
    } else {
      return TwilioService.CreateVerificationCheckStatus.Error;
    }
  }
}

export namespace TwilioService {
  export enum CreateVerificationCheckStatus {
    Success,
    Failed, // Client error
    Error, // Server error
  }

  export enum LookupNumberStatus {
    Success,
    Failed, // Server error
    Error, // Client error
  }

  export enum CreateVerificationAttemptStatus {
    Success,
    Failed,
    Error,
  }
}
