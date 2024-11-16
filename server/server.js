import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import techWords from './techWords.js';
import fiveLetterWords from './utils.js';

const app = express();
const port = process.env.PORT || 4000;

const corsOptions = {
    origin: process.env.NODE_ENV === 'production' ? 'https://nerdle.onrender.com' : 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

app.get('/api/words/random', (req, res) => {
    const randomWord = techWords[Math.floor(Math.random() * techWords.length)];
    res.json({ word: randomWord });
});

app.post('/api/words/validate', (req, res) => {
    const { word } = req.body;
    const isValid = fiveLetterWords.includes(word) || techWords.includes(word);
    res.json({ valid: isValid });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});