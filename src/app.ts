// src/app.ts
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import responseHandler from './utils/response/responseHandler';
import indexRouter from './routes/index';
import errorHandler from './middlewares/errorHandler';

const app: Application = express();

// Global Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use((req, res, next) => responseHandler(req, res, next));

// HTTP Request Logger
app.use(morgan('dev'));

// Body Parser (Read JSON data from requests)
app.use(express.json());


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