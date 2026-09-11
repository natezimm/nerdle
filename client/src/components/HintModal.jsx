import React, { useEffect, useRef, useState } from 'react';
import { useModalBehavior } from '../hooks/useModalBehavior';
import { requestGameHint, isCanceledRequest } from '../api/games';

export default function HintModal({
  gameId,
  isOpen,
  onClose,
  type = 'letter',
}) {
  const isCategory = type === 'category';
  const title = isCategory ? 'Category hint' : 'Letter hint';
  const dialogRef = useModalBehavior({ isOpen, onClose });
  const controllerRef = useRef(null);
  const [hint, setHint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => () => controllerRef.current?.abort(), []);

  const reveal = async () => {
    if (controllerRef.current || hint) return;
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);
    setError('');
    try {
      const result = await requestGameHint(gameId, {
        signal: controller.signal,
        type,
      });
      if (!controller.signal.aborted) setHint(result);
    } catch (error) {
      if (!isCanceledRequest(error))
        setError(
          error?.response?.data?.error ||
            'Could not load your hint. Please try again.'
        );
    } finally {
      controllerRef.current = null;
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div
      className="modal-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hint-title"
        tabIndex={-1}
        ref={dialogRef}
      >
        <div className="modal-header">
          <h2 id="hint-title" aria-label={title}>
            {title}
          </h2>
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Close hint"
          >
            &times;
          </button>
        </div>
        <p>
          {isCategory
            ? 'A technology category to point you in the right direction.'
            : 'One letter hint per game.'}{' '}
          Neither hint uses a guess.
        </p>
        <div role="status">
          {hint && isCategory ? (
            <p className="hint-result">{hint.category}</p>
          ) : hint ? (
            <p className="hint-result">
              Letter {hint.position} is{' '}
              <strong>{hint.letter.toUpperCase()}</strong>.
            </p>
          ) : (
            <p>
              {isCategory
                ? 'Start with this gentle nudge before revealing a letter.'
                : 'Reveal a position you haven’t already solved.'}
            </p>
          )}
          {error && <p>{error}</p>}
        </div>
        {!hint && (
          <button
            className="settings-action"
            onClick={reveal}
            disabled={loading}
          >
            {loading
              ? 'Loading…'
              : isCategory
                ? 'Reveal category'
                : 'Reveal letter'}
          </button>
        )}
      </div>
    </div>
  );
}
