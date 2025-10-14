import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pfms';
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || 'pfms' });
    console.log('[PFMS] MongoDB connected');
  } catch (err) {
    console.error('[PFMS] MongoDB connection error', err.message);
  }
}
