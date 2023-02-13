import { MongooseError } from 'mongoose';

export const logMongooseError = (error: any, path: string) => {
  const mongooseError = error as MongooseError;
  console.log(`${path} error: ${mongooseError.name} ${mongooseError.message}`);
};
