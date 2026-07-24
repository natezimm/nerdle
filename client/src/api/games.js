// @ts-check

import axios from 'axios';

export const createGame = async (wordLength, options = {}) => {
  const response = await axios.post(
    '/api/games',
    { wordLength },
    { signal: options.signal }
  );

  return response.data;
};

export const submitGameGuess = async (gameId, word, options = {}) => {
  const response = await axios.post(
    `/api/games/${encodeURIComponent(gameId)}/guesses`,
    { word },
    { signal: options.signal }
  );

  return response.data;
};

export const isCanceledRequest = (error) => {
  return error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError';
};
