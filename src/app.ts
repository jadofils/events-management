// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { AppConfig } from './config/AppConfig';
import routes from './routes';

// Initialize express app
const app = express();

// Apply middlewares
app.use(helmet()); // Security headers
app.use(cors({
  origin: AppConfig.CORS_ORIGIN,
  credentials: true // Enable sending cookies
}));
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request body
app.use(cookieParser()); // Parse cookies

// Configure session middleware
app.use(session({
  /** 
   * Session secret used for signing the session ID cookie.
   * Uses the configured session secret from AppConfig, with a fallback default secret.
   * Note: In production, always use a strong, randomly generated secret from a secure configuration.
   */
  secret: "rhkfjdlsafhdakfhksdjghhkdfgkdhkdfjoshdffkshfdlhgfkashaglhksh", // Use a strong, randomly generated secret from your config
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: AppConfig.isProduction(), // Set to true if using HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // Example: 24 hours (adjust as needed)
    sameSite: 'lax' // or 'strict' depending on your needs
  }
}));

// Logging
if (!AppConfig.isTest()) {
  app.use(morgan(AppConfig.LOG_FORMAT));
}

// API routes
app.use(AppConfig.API_PREFIX, routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const status = err.status || 500;
  const message = err.message || 'Something went wrong';

  console.error(`[Error] ${status} - ${message}`);

  res.status(status).json({
    status,
    message,
    ...(AppConfig.isDevelopment() && { stack: err.stack })
  });
});

export default app;