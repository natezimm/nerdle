import express from 'express';
import defaultGameService from '../services/gameService.js';

/**
 * @param {{
 *   gameService?: ReturnType<import('../services/gameService.js').createGameService>,
 *   guessLimiter?: import('express').RequestHandler
 * }} [options]
 */
const createGameRouter = ({
  gameService = defaultGameService,
  guessLimiter,
} = {}) => {
  const router = express.Router();

  router.post('/', (req, res) => {
    res.status(201).json(gameService.createGame(req.body?.wordLength));
  });

  const guessHandlers = [];
  if (guessLimiter) {
    guessHandlers.push(guessLimiter);
  }

  router.post('/:gameId/guesses', ...guessHandlers, (req, res) => {
    const submission = gameService.submitGuess(
      req.params.gameId,
      req.body?.word
    );

    if (!submission.ok) {
      return res.status(submission.status).json({ error: submission.error });
    }

    return res.json(submission.result);
  });

  return router;
};

export default createGameRouter;
