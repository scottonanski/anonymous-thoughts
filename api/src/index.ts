// api/src/index.ts 
import express, { type Request, type Response, type Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from .env file for Vercel deployment
dotenv.config();

import thoughtRoutes from './routes/thoughtRoutes.js';

const app: Application = express();

// --- Core Middleware ---
app.use(
  cors({
    origin: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://anonymous-thoughts.vercel.app',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Health Check Route ---
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'API is healthy and running!' });
});

// --- API Routes ---
app.use('/api/thoughts', thoughtRoutes);

// --- API 404 Not Found Handler ---
app.use('/api', (req: Request, res: Response) => {
  res.status(404).json({
    status: 'fail',
    message: `The API endpoint ${req.method} ${req.originalUrl} was not found on this server.`,
  });
});

// --- Global Error Handling Middleware ---
interface AppError extends Error {
  statusCode?: number;
  status?: string;
}

app.use((err: Error | AppError, _req: Request, res: Response) => {
  let statusCode = 500;
  let apiStatus: 'fail' | 'error' = 'error';
  const message = err.message || 'An unexpected internal server error occurred.';
  const errName = err.name || 'Error';
  const errStack = err.stack;

  if ('statusCode' in err && typeof err.statusCode === 'number') {
    statusCode = err.statusCode;
  }

  if ('status' in err && (err.status === 'fail' || err.status === 'error')) {
    apiStatus = err.status;
  } else {
    apiStatus = statusCode >= 500 ? 'error' : 'fail';
  }

  console.error('ERROR:', errName, '-', message, errStack ? `\nSTACK: ${errStack}` : '');

  res.status(statusCode).json({
    status: apiStatus,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      error: { name: errName, stack: errStack },
    }),
  });
});

export default function handler(req: Request, res: Response) {
  app(req, res);
}