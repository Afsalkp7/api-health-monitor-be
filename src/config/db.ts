// src/config/db.ts
import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database Connection Failed:', error);
    process.exit(1); // Stop server if DB fails
  }
};

export default connectDB;