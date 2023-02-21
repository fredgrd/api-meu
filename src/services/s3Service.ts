import { AWSError, S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

class S3Service {
  private s3: S3;

  constructor() {
    this.s3 = new S3({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    });
  }

  async uploadAudio(file: Buffer): Promise<String | null> {
    const key = `audio-${uuidv4()}.mp3`;

    const params: S3.PutObjectRequest = {
      Key: key,
      Bucket: process.env.AWS_BUCKET_NAME || '',
      Body: file,
      ContentType: 'audio/mpeg',
    };

    try {
      await this.s3.upload(params).promise();
      return key;
    } catch (error) {
      const awsError = error as AWSError;
      console.log(
        `S3Service/uploadAudio error: ${awsError.name} ${awsError.message}`
      );
      return null;
    }
  }

  async uploadImage(file: Buffer): Promise<String | null> {
    const key = `image-${uuidv4()}.jpeg`;

    const params: S3.PutObjectRequest = {
      Key: key,
      Bucket: process.env.AWS_BUCKET_NAME || '',
      Body: file,
      ContentType: 'image/jpeg',
    };

    try {
      await this.s3.upload(params).promise();
      return key;
    } catch (error) {
      const awsError = error as AWSError;
      console.log(
        `S3Service/uploadImage error: ${awsError.name} ${awsError.message}`
      );
      return null;
    }
  }
}

export default S3Service;
