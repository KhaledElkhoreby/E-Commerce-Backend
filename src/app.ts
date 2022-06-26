import express, { NextFunction } from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import cors from 'cors';
import AppError from './utils/AppError';
import globalErrorHandler from './controllers/errorController';

const app = express();

// todo 1) GLOBAL MIDDLEWARES
app.use(helmet()); // Set security HTTP headers
app.use(helmet.xssFilter()); // XSS-Protection
// Development logging
if (process.env.NODE_ENV === 'development') {
  console.log('Start Development');
  app.use(morgan('dev'));
} else {
  console.log('Strat Production');
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Allow cross origins
app.use(cors());

// todo 2) ROUTES
// ..........

// global route
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// todo 3) GLOBAL ERROR HANDLER MIDDLEWARE
app.use(globalErrorHandler);

export default app;
