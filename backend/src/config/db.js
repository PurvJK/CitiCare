import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/citicare';
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.warn(`[db] Primary MongoDB connection failed (${err.message}). Falling back to local MongoDB...`);
    const fallbackUri = 'mongodb://127.0.0.1:27017/citicare';
    await mongoose.connect(fallbackUri, { serverSelectionTimeoutMS: 4000 });
    console.log('MongoDB connected to local instance (mongodb://127.0.0.1:27017/citicare)');
  }
}

