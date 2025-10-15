import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

export async function connectDB() {
  let uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pfms';
  try {
    mongoose.set('strictQuery', true);
    try {
      await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || 'pfms' });
      console.log('[PFMS] MongoDB connected');
      return;
    } catch (err) {
      console.warn('[PFMS] Local MongoDB not available, starting in-memory MongoDB...');
      const mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      await mongoose.connect(uri, { dbName: 'pfms' });
      console.log('[PFMS] In-memory MongoDB connected');
    }
  } catch (err) {
    console.error('[PFMS] MongoDB connection error', err.message);
  }
}
