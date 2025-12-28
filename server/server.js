import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import techWords, { techWordsByLength } from './techWords.js';
import { fourLetterWords, fiveLetterWords, sixLetterWords } from './utils.js';

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://nerdle.nathanzimmerman.com',
];

if (process.env.CORS_ORIGIN) {
    allowedOrigins.push(process.env.CORS_ORIGIN);
}

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        if (process.env.NODE_ENV !== 'production') {
            const localhostPattern = /^http:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/;
            if (localhostPattern.test(origin)) {
                return callback(null, true);
            }
        }

        return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));

app.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

const validateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many validation requests, please slow down.' },
});

app.use(bodyParser.json({ limit: '10kb' }));

app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.get('/api/words/random', (req, res) => {
    const requestedLength = Number(req.query?.length);
    const wordLength = [4, 5, 6].includes(requestedLength) ? requestedLength : 5;
    const wordPool = techWordsByLength[wordLength] ?? techWords;
    const randomWord = wordPool[Math.floor(Math.random() * wordPool.length)];
    res.json({ word: randomWord });
});

app.post('/api/words/validate', validateLimiter, (req, res) => {
    const word = req.body?.word;

    if (typeof word !== 'string' || word.length === 0 || word.length > 10) {
        return res.status(400).json({ error: 'Invalid word: must be 1-10 characters' });
    }
    if (!/^[a-zA-Z]+$/.test(word)) {
        return res.status(400).json({ error: 'Invalid word: alphabetic characters only' });
    }

    const normalized = word.toLowerCase();
    const wordLength = normalized.length;

    const wordListsByLength = {
        4: fourLetterWords,
        5: fiveLetterWords,
        6: sixLetterWords,
    };

    const dictionaryWords = wordListsByLength[wordLength] ?? [];
    const techWordPool = techWordsByLength[wordLength] ?? [];
    const isValid = dictionaryWords.includes(normalized) || techWordPool.includes(normalized);
    res.json({ valid: isValid });
});

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

export default app;
