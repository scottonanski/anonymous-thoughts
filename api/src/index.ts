// api/src/index.ts

import express, { type Request, type Response, type NextFunction, type Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv'; // For local development environment variables

import thoughtRoutes from './routes/thoughtRoutes';

// Load environment variables from .env file for local development
// Vercel handles environment variables in deployment
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const app: Application = express();
const PORT = process.env.PORT || 3001; // Default to 3001 if no PORT env var

// --- Core Middleware ---
app.use(
  cors({
    origin: process.env.NODE_ENV === 'development'
      ? ['http://localhost:5173', `http://localhost:${PORT}`] // Allow Vite dev server and this API itself for testing
      : process.env.VERCEL_URL // In production, Vercel sets VERCEL_URL
        ? [`https://${process.env.VERCEL_URL}`, process.env.NEXT_PUBLIC_APP_URL || ''] // Allow Vercel deployment URL and custom domain if configured
        : undefined, // Fallback or further configuration might be needed for complex setups
    credentials: true, // If you plan to use cookies or sessions
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
// Add other resource routers here in the future, e.g.:
// app.use('/api/users', userRoutes);

// --- API 404 Not Found Handler ---
// This handles any requests to /api/* that haven't been matched by a route
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    status: 'fail',
    message: `The API endpoint ${req.method} ${req.originalUrl} was not found on this server.`,
  });
});

// --- Global Error Handling Middleware ---
// This MUST be the last piece of middleware.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || (statusCode >= 500 ? 'error' : 'fail');
  const message = err.message || 'Something went wrong on the server.';

  console.error('💥 GLOBAL ERROR HANDLER:', err.name, '-', message, err.stack ? `\nSTACK: ${err.stack}` : '');

  // Send a structured error response
  res.status(statusCode).json({
    status,
    message,
    // Optionally, include stack trace or more error details in development
    ...(process.env.NODE_ENV === 'development' && {
      error: { name: err.name, stack: err.stack },
    }),
  });
});


// --- Conditional Server Start for Local Development (not for Vercel) ---
// Vercel handles starting the server for the exported app in serverless functions.
// This block allows `npm run dev` in the `api` directory to work for local testing
// without relying on `vercel dev` CLI.
if (process.env.NODE_ENV !== 'production' && require.main === module) {
  // The `require.main === module` check ensures this only runs when the file is executed directly
  // (e.g., `node src/index.js` or `tsx src/index.ts`), not when imported by Vercel.
  app.listen(PORT, () => {
    console.log(`🌲 API server listening locally on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
    console.log(`   Thoughts API: http://localhost:${PORT}/api/thoughts`);
  });
}

// --- Export the Express App for Vercel ---
export default app;