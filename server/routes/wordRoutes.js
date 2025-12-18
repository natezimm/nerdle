import express from 'express';
import techWords, { techWordsByLength } from '../techWords.js';
import { fourLetterWords, fiveLetterWords, sixLetterWords } from '../utils.js';

const router = express.Router();

// Route to get a random tech word
router.get('/random', (req, res) => {
    const requestedLength = Number(req.query?.length);
    const wordLength = [4, 5, 6].includes(requestedLength) ? requestedLength : 5;
    const wordPool = techWordsByLength[wordLength] ?? techWords;
    const randomWord = wordPool[Math.floor(Math.random() * wordPool.length)];
    res.json({ word: randomWord });
});

// Route to validate a word against both techWords and word-list package
router.post('/validate', (req, res) => {
    const normalized = String(req.body?.word ?? '').toLowerCase();
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

export default router;
