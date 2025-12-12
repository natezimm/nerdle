import express from 'express';
import techWords from '../techWords.js';
import fiveLetterWords from '../utils.js';

const router = express.Router();

// Route to get a random tech word
router.get('/random', (req, res) => {
    const randomWord = techWords[Math.floor(Math.random() * techWords.length)];
    res.json({ word: randomWord });
});

// Route to validate a word against both techWords and word-list package
router.post('/validate', (req, res) => {
    const { word } = req.body;
    const isValid = fiveLetterWords.includes(word.toLowerCase()) || techWords.includes(word.toLowerCase());
    res.json({ valid: isValid });
});

export default router;