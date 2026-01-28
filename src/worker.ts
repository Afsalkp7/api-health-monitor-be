import 'dotenv/config';
import mongoose from 'mongoose';
import { startMonitoringWorker } from './worker/monitorEngine';
import { startAnalyticsWorker } from './worker/analyticsEngine';

// Connect to Database
const MONGO_URI = process.env.MONGO_URI || '';

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is missing in .env');
  process.exit(1);
}

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`✅ Worker Connected to MongoDB: ${mongoose.connection.host}`);
    
    // 3. Start the Engine ONCE DB is ready
    startMonitoringWorker();
    startAnalyticsWorker();
    
  } catch (error) {
    console.error('❌ Worker DB Connection Error:', error);
    process.exit(1);
  }
};

connectDB();

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Worker shutting down...');
  mongoose.connection.close();
  process.exit(0);
});