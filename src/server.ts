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
    await connectDB(); 
    console.log("Database connected successfully.");

    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(` Server listening on port: ${PORT}....`);
    });

    process.on('unhandledRejection', (err: Error) => {
      console.log('UNHANDLED REJECTION! Shutting down...');
      console.log(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

  } catch (error) {
    console.error("Failed to start server/workers.");
    console.error(error);
    process.exit(1);
  }
};

startServer();