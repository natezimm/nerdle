import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import techWords from './techWords.js';
import fiveLetterWords from './utils.js';

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
        // allow requests with no origin (like curl, health checks)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.get('/api/words/random', (req, res) => {
    const randomWord = techWords[Math.floor(Math.random() * techWords.length)];
    res.json({ word: randomWord });
});

app.post('/api/words/validate', (req, res) => {
    const { word } = req.body;
    const isValid = fiveLetterWords.includes(word) || techWords.includes(word);
    res.json({ valid: isValid });
});

// Export the app for testing. Only listen when not testing.
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

export default app;