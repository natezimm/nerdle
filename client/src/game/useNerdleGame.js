import { useCallback, useEffect, useReducer, useRef } from 'react';
import { fetchRandomWord, isCanceledRequest, validateWord } from '../api/words';
import { updateStats } from '../utils/stats';
import { mergeKeyboardStatuses, scoreGuess } from './scoring';

const MAX_ATTEMPTS = 6;
const FLIP_DELAY_MS = 300;

/**
 * @typedef {ReturnType<typeof createInitialState>} GameState
 * @typedef {{ type: string, [key: string]: any }} GameAction
 */

const createInitialState = () => ({
  targetWord: '',
  attempts: [],
  currentGuess: '',
  message: '',
  letterStatuses: {},
  status: 'loading',
  startTime: null,
});

/** @type {import('react').Reducer<GameState, GameAction>} */
const gameReducer = (state, action) => {
  switch (action.type) {
    case 'reset':
      return createInitialState();
    case 'wordLoaded':
      return {
        ...state,
        targetWord: action.word,
        startTime: action.startTime,
        status: 'playing',
      };
    case 'loadFailed':
      return {
        ...state,
        message: 'Failed to fetch the word. Please try again later.',
        status: 'error',
      };
    case 'setMessage':
      return {
        ...state,
        message: action.message,
      };
    case 'appendLetter':
      if (state.currentGuess.length >= action.wordLength) return state;
      return {
        ...state,
        currentGuess: `${state.currentGuess}${action.letter}`,
      };
    case 'removeLetter':
      return {
        ...state,
        currentGuess: state.currentGuess.slice(0, -1),
      };
    case 'validationStarted':
      return {
        ...state,
        status: 'validating',
      };
    case 'validationRejected':
      return {
        ...state,
        message: 'Invalid word. Try again.',
        status: 'playing',
      };
    case 'validationFailed':
      return {
        ...state,
        message: 'Error validating the word. Please try again.',
        status: 'playing',
      };
    case 'guessAccepted':
      return {
        ...state,
        attempts: [...state.attempts, action.guess],
        currentGuess: '',
        status: 'revealing',
      };
    case 'lettersRevealed':
      return {
        ...state,
        letterStatuses: action.letterStatuses,
      };
    case 'revealComplete':
      return {
        ...state,
        message: '',
        status: 'playing',
      };
    case 'gameComplete':
      return {
        ...state,
        message: action.message,
        status: 'complete',
      };
    default:
      return state;
  }
};

export const useNerdleGame = (wordLength) => {
  const [state, dispatch] = useReducer(
    gameReducer,
    undefined,
    createInitialState
  );
  const timersRef = useRef([]);
  const loadControllerRef = useRef(null);
  const validationControllerRef = useRef(null);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];
  }, []);

  const schedule = useCallback((callback, delay) => {
    const timer = setTimeout(() => {
      timersRef.current = timersRef.current.filter((item) => item !== timer);
      callback();
    }, delay);
    timersRef.current.push(timer);
    return timer;
  }, []);

  useEffect(() => {
    clearTimers();
    validationControllerRef.current?.abort();
    loadControllerRef.current?.abort();

    const controller = new AbortController();
    loadControllerRef.current = controller;

    dispatch({ type: 'reset' });

    fetchRandomWord(wordLength, { signal: controller.signal })
      .then((word) => {
        dispatch({ type: 'wordLoaded', word, startTime: Date.now() });
      })
      .catch((error) => {
        if (isCanceledRequest(error)) return;

        console.error('Error fetching the word:', error);
        dispatch({ type: 'loadFailed' });
      });

    return () => {
      controller.abort();
      clearTimers();
    };
  }, [clearTimers, wordLength]);

  useEffect(() => {
    return () => {
      loadControllerRef.current?.abort();
      validationControllerRef.current?.abort();
      clearTimers();
    };
  }, [clearTimers]);

  const submitGuess = useCallback(() => {
    const currentState = stateRef.current;
    const guess = currentState.currentGuess;

    if (
      currentState.status === 'validating' ||
      currentState.status === 'revealing'
    ) {
      return;
    }

    if (!currentState.targetWord) {
      dispatch({
        type: 'setMessage',
        message: 'Still loading the word. Please wait.',
      });
      return;
    }

    if (guess.length !== wordLength) {
      dispatch({
        type: 'setMessage',
        message: `Guess must be ${wordLength} letters.`,
      });
      return;
    }

    validationControllerRef.current?.abort();
    const controller = new AbortController();
    validationControllerRef.current = controller;
    dispatch({ type: 'validationStarted' });

    validateWord(guess, { signal: controller.signal })
      .then((isValid) => {
        const latestState = stateRef.current;

        if (!isValid) {
          dispatch({ type: 'validationRejected' });
          return;
        }

        const score = scoreGuess(latestState.targetWord, guess);
        const nextLetterStatuses = mergeKeyboardStatuses(
          latestState.letterStatuses,
          guess,
          score
        );
        const attemptCount = latestState.attempts.length + 1;
        const revealDelay = FLIP_DELAY_MS * wordLength;

        dispatch({ type: 'guessAccepted', guess });

        schedule(() => {
          dispatch({
            type: 'lettersRevealed',
            letterStatuses: nextLetterStatuses,
          });
        }, revealDelay);

        if (guess === latestState.targetWord) {
          schedule(() => {
            const timeTaken = Date.now() - latestState.startTime;
            updateStats(true, attemptCount, timeTaken, wordLength);
            dispatch({
              type: 'gameComplete',
              message: "Congratulations! You've guessed the word.",
            });
          }, revealDelay);
          return;
        }

        if (attemptCount >= MAX_ATTEMPTS) {
          schedule(() => {
            updateStats(false, MAX_ATTEMPTS, null, wordLength);
            dispatch({
              type: 'gameComplete',
              message: `Game over! The word was ${latestState.targetWord}.`,
            });
          }, revealDelay);
          return;
        }

        schedule(() => {
          dispatch({ type: 'revealComplete' });
        }, revealDelay);
      })
      .catch((error) => {
        if (isCanceledRequest(error)) return;

        console.error('Error validating the word:', error);
        dispatch({ type: 'validationFailed' });
      });
  }, [schedule, wordLength]);

  const handleKeyPress = useCallback(
    (key) => {
      const currentState = stateRef.current;

      if (
        currentState.status === 'complete' ||
        currentState.status === 'validating' ||
        currentState.status === 'revealing'
      ) {
        return;
      }

      if (key === 'Enter') {
        submitGuess();
      } else if (key === 'Backspace') {
        dispatch({ type: 'removeLetter' });
      } else if (/^[a-zA-Z]$/.test(key)) {
        dispatch({
          type: 'appendLetter',
          letter: key.toLowerCase(),
          wordLength,
        });
      }
    },
    [submitGuess, wordLength]
  );

  const clearMessage = useCallback(() => {
    dispatch({ type: 'setMessage', message: '' });
  }, []);

  return {
    ...state,
    gameOver: state.status === 'complete',
    handleKeyPress,
    clearMessage,
  };
};
