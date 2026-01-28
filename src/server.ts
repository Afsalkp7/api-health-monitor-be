import dotenv from 'dotenv';
dotenv.config();
import connectDB from './config/db';
import app from './app';

// Uncaught Exception Handling (Crash safety)
process.on('uncaughtException', (err: Error) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

const startServer = async () => {
  try {
    // 1. Wait for Database Connection
    await connectDB(); 
    console.log("Database connected successfully.");

    // 2. ONLY THEN start the server
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`Server listening on port: ${PORT}....`);
    });

    // Handle Promise Rejections
    process.on('unhandledRejection', (err: Error) => {
      console.log('UNHANDLED REJECTION! Shutting down...');
      console.log(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

  } catch (error) {
    console.error("Failed to connect to Database. Server shutting down.");
    console.error(error);
    process.exit(1);
  }
};

startServer();