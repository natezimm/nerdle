import express from 'express';
import {
  getRandomTechWord,
  isValidGuess,
  normalizeGuess,
} from '../services/wordService.js';

/**
 * @param {{ validateLimiter?: import('express').RequestHandler }} [options]
 */
const createWordRouter = ({ validateLimiter } = {}) => {
  const router = express.Router();

  router.get('/random', (req, res) => {
    res.json({ word: getRandomTechWord(req.query?.length) });
  });

  const validateHandlers = [];
  if (validateLimiter) {
    validateHandlers.push(validateLimiter);
  }

  router.post('/validate', ...validateHandlers, (req, res) => {
    const normalized = normalizeGuess(req.body?.word);

    if (!normalized.ok) {
      return res.status(400).json({ error: normalized.error });
    }

    res.json({ valid: isValidGuess(normalized.word) });
  });

  return router;
};

export default createWordRouter;
