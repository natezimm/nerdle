import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import createWordRouter from './routes/wordRoutes.js';

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://nerdle.nathanzimmerman.com',
];

export const createCorsOptions = (env = process.env) => {
  const allowedOrigins = [...DEFAULT_ALLOWED_ORIGINS];

  if (env.CORS_ORIGIN) {
    allowedOrigins.push(env.CORS_ORIGIN);
  }

  return {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (env.NODE_ENV !== 'production') {
        const localhostPattern =
          /^http:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/;
        if (localhostPattern.test(origin)) {
          return callback(null, true);
        }
      }

      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  };
};

export const createApp = (env = process.env) => {
  const app = express();

  app.use(cors(createCorsOptions(env)));
  app.use(helmet());

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: 'Too many requests, please try again later.' },
    })
  );

  const validateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many validation requests, please slow down.' },
  });

  app.use(express.json({ limit: '10kb' }));

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api/words', createWordRouter({ validateLimiter }));

  return app;
};

export default createApp();
