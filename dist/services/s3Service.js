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
const aws_sdk_1 = require("aws-sdk");
const uuid_1 = require("uuid");
class S3Service {
    constructor() {
        this.s3 = new aws_sdk_1.S3({
            region: process.env.AWS_REGION,
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_KEY,
        });
    }
    uploadAudio(file) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = `audio-${(0, uuid_1.v4)()}.mp3`;
            const params = {
                Key: key,
                Bucket: process.env.AWS_BUCKET_NAME || '',
                Body: file,
                ContentType: 'audio/mpeg',
            };
            try {
                yield this.s3.upload(params).promise();
                return key;
            }
            catch (error) {
                const awsError = error;
                console.log(`S3Service/uploadAudio error: ${awsError.name} ${awsError.message}`);
                return null;
            }
        });
    }
}
exports.default = S3Service;
