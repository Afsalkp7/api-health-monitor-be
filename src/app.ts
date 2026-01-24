// src/app.ts
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app: Application = express();

// Global Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// HTTP Request Logger
app.use(morgan('dev'));

// Body Parser (Read JSON data from requests)
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Cloudtstack api monitor Server is Running successfully!',
    timestamp: new Date().toISOString()
  });
});

// 404 Handler 
app.use((req: Request, res: Response) => { 
  res.status(404).json({
    status: 'error',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

export default app;