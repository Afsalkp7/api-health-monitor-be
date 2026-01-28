// src/app.ts
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import responseHandler from './utils/response/responseHandler';
import indexRouter from './routes/index';
import errorHandler from './middlewares/errorHandler';
import connectDB from './config/db';

const app: Application = express();

// Global Middleware
app.use(helmet());

app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB(); // Uses the cached connection (won't reconnect if already active)
    next();
  } catch (error) {
    console.error("Database connection failed in middleware:", error);
    res.status(500).json({ status: false, message: "Database Connection Error" });
  }
});

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use((req, res, next) => responseHandler(req, res, next));

// HTTP Request Logger
app.use(morgan('dev'));

// Body Parser (Read JSON data from requests)
app.use(express.json());


// --- TESTING ONLY: Slow down all requests by 2 seconds ---
// app.use((req, res, next) => {
//   const delay = 2000; // 2 seconds
//   setTimeout(() => {
//     next();
//   }, delay);
// });

app.get('/', (req: Request, res: Response) => {
  res.success({ message: 'Cloudstack api monitor Server is Running successfully!' })
});

app.use('/', indexRouter);

// Error Handler
app.use(errorHandler);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.recordNotFound({ message: `Url ${req.originalUrl} not found` });
});

export default app;