// api/src/index.ts

import express, { type Request, type Response, type NextFunction, type Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Ensure all local module imports end with .js
import thoughtRoutes from './routes/thoughtRoutes.js';

// Load environment variables from .env file for local development via `vercel dev`
// Vercel handles environment variables in its own deployment environment.
if (process.env.NODE_ENV !== 'production') {
  dotenv.config(); // Looks for .env in the current directory (api/) or project root if run by vercel dev
}

const app: Application = express();

// --- Core Middleware ---
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins: string[] = []; // Explicitly type as string array

      // When using `vercel dev`, process.env.NODE_ENV is 'development'
      // `vercel dev` typically serves frontend on http://localhost:3000
      // Your Vite dev server might be on http://localhost:5173
      if (process.env.NODE_ENV === 'development') {
        allowedOrigins.push('http://localhost:5173'); 
        allowedOrigins.push('http://localhost:3000'); 
        // If your API runs on a different port locally (e.g. 3001 via direct npm run dev in api/)
        // you might add that too, e.g., `http://localhost:${process.env.PORT || 3001}`
      } else {
        // Production origins
        if (process.env.VERCEL_URL) { // Provided by Vercel
          allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
        }
        // Example: if your frontend is deployed to a custom domain, set via Vercel env var
        if (process.env.FRONTEND_URL) { 
          allowedOrigins.push(process.env.FRONTEND_URL);
        }
      }

      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      // OR if origin is in the allowedOrigins list.
      // If allowedOrigins is empty (e.g. no prod URLs configured yet), this might block valid prod requests.
      // Consider a more robust production origin check or a default allow if needed.
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS: Origin '${origin}' was not allowed.`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// --- Health Check Route ---
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'API is healthy and running!' });
});

// --- API Routes ---
app.use('/api/thoughts', thoughtRoutes);

// --- API 404 Not Found Handler ---
// This handles any requests to /api/* that haven't been matched by a defined route
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    status: 'fail',
    message: `The API endpoint ${req.method} ${req.originalUrl} was not found on this server.`,
  });
});

// --- Global Error Handling Middleware ---
// This MUST be the last piece of middleware.

// Define an interface for errors that might have statusCode and status
interface AppError extends Error {
  statusCode?: number;
  status?: string; // 'fail' or 'error'
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error | AppError, _req: Request, res: Response, _next: NextFunction) => {
  // Default error values
  let statusCode = 500;
  let apiStatus: 'fail' | 'error' = 'error'; // Ensure this is one of the allowed literal types
  const message = err.message || 'An unexpected internal server error occurred.';
  const errName = err.name || 'Error'; // Standard Error property
  const errStack = err.stack;       // Standard Error property

  // Check if the error object has our custom properties and if they are valid types
  if ('statusCode' in err && typeof err.statusCode === 'number') {
    statusCode = err.statusCode;
  }

  if ('status' in err && (err.status === 'fail' || err.status === 'error')) {
    apiStatus = err.status;
  } else {
    // If no specific 'status' property on the error, derive it from statusCode
    apiStatus = statusCode >= 500 ? 'error' : 'fail';
  }
  
  console.error('💥 GLOBAL ERROR HANDLER:', errName, '-', message, errStack ? `\nSTACK: ${errStack}` : '');

  // Send a structured error response
  res.status(statusCode).json({
    status: apiStatus,
    message,
    // Optionally, include more error details (like stack and original error name) in development
    ...(process.env.NODE_ENV === 'development' && {
      error: { name: errName, stack: errStack },
    }),
  });
});

// Vercel uses the default export to run the serverless function.
// No app.listen() is needed here when deploying to Vercel or using `vercel dev`.
export default app;