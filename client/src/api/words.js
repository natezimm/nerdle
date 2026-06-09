// @ts-check

import axios from 'axios';

export const fetchRandomWord = async (wordLength, options = {}) => {
  const response = await axios.get(`/api/words/random?length=${wordLength}`, {
    signal: options.signal,
  });

  return response.data.word;
};

export const validateWord = async (word, options = {}) => {
  const response = await axios.post(
    '/api/words/validate',
    { word },
    { signal: options.signal }
  );

  return response.data.valid;
};

export const isCanceledRequest = (error) => {
  return error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError';
};
