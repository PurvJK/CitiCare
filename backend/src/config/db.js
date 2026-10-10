import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/citicare';
  const isCloud = uri.includes('mongodb+srv://') || uri.includes('@');
  const timeoutMs = isCloud ? 15000 : 5000;

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: timeoutMs });
    console.log(`[db] MongoDB connected successfully to: ${isCloud ? 'MongoDB Atlas Cloud' : 'Local Instance'}`);
  } catch (err) {
    console.warn(`[db] Primary MongoDB connection failed (${err.message}). Falling back to local MongoDB...`);
    const fallbackUri = 'mongodb://127.0.0.1:27017/citicare';
    await mongoose.connect(fallbackUri, { serverSelectionTimeoutMS: 5000 });
    console.log('[db] MongoDB connected to local fallback instance (127.0.0.1:27017)');
  }
}

