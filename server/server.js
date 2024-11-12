import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import techWords from './techWords.js';
import fiveLetterWords from './utils.js';

const app = express();
const PORT = 5001;

app.use(cors());
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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});