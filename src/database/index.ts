import mongoose from 'mongoose';

export const connectDatabase = () => {
  const username = process.env.MONGODB_USERNAME;
  const password = process.env.MONGODB_PASSWORD;

  const uri = `mongodb+srv://meus-api:${encodeURIComponent(
    password || ''
  )}@meus.w52vp20.mongodb.net/?retryWrites=true&w=majority`;

  mongoose.set('strictQuery', false);
  mongoose.connect(uri, { dbName: 'meusDB' }, (error) => {
    if (error) {
      console.log(`MongoDB connection error: ${error}`);
    } else {
      console.log('Connected to MongoDB 🚀');
    }
  });
};
