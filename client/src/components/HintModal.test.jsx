import { render, screen, fireEvent } from '@testing-library/react';
import { vi, test, expect } from 'vitest';
import HintModal from './HintModal.jsx';
import { requestGameHint } from '../api/games';
vi.mock('../api/games', () => ({
  requestGameHint: vi.fn(),
  isCanceledRequest: () => false,
}));
test('reveals only on request, retries failures, and keeps the hint when reopened', async () => {
  vi.mocked(requestGameHint)
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce({ position: 2, letter: 'p' });
  const props = { gameId: 'game-1', isOpen: true, onClose: vi.fn() };
  const { rerender } = render(<HintModal {...props} />);
  expect(requestGameHint).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Reveal letter' }));
  expect(await screen.findByText(/Could not load/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Reveal letter' }));
  expect(await screen.findByText('P')).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('Letter 2 is P.');
  rerender(<HintModal {...props} isOpen={false} />);
  rerender(<HintModal {...props} />);
  expect(screen.getByRole('status')).toHaveTextContent('Letter 2 is P.');
  expect(requestGameHint).toHaveBeenCalledTimes(2);
});

test('requests a category without revealing a letter', async () => {
  vi.mocked(requestGameHint).mockResolvedValueOnce({
    category: 'Databases & queries',
  });
  render(
    <HintModal
      gameId="category-game"
      type="category"
      isOpen={true}
      onClose={vi.fn()}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Reveal category' }));
  expect(await screen.findByText('Databases & queries')).toBeInTheDocument();
  expect(requestGameHint).toHaveBeenLastCalledWith(
    'category-game',
    expect.objectContaining({ type: 'category' })
  );
  expect(screen.queryByText('Reveal letter')).not.toBeInTheDocument();
});
