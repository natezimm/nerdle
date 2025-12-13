import { render, screen, fireEvent } from '@testing-library/react';
import Keyboard from './Keyboard';

describe('Keyboard', () => {
    test('passes letter statuses through class names and calls onKeyPress', async () => {
        const onKeyPress = jest.fn();
        render(<Keyboard onKeyPress={onKeyPress} letterStatuses={{ a: 'correct', b: 'present' }} />);
        const aButton = screen.getByRole('button', { name: 'A' });
        fireEvent.click(aButton);
        expect(onKeyPress).toHaveBeenCalledWith('a');
        expect(aButton).toHaveClass('correct');
        const bButton = screen.getByRole('button', { name: 'B' });
        fireEvent.click(bButton);
        expect(onKeyPress).toHaveBeenCalledWith('b');
        expect(bButton).toHaveClass('present');
    });

    test('invokes onKeyPress for Enter and Backspace keys', async () => {
        const onKeyPress = jest.fn();
        const { container } = render(<Keyboard onKeyPress={onKeyPress} letterStatuses={{}} />);
        fireEvent.click(screen.getByRole('button', { name: 'Enter' }));
        expect(onKeyPress).toHaveBeenCalledWith('Enter');
        const backspaceButton = container.querySelector('.key-backspace');
        fireEvent.click(backspaceButton);
        expect(onKeyPress).toHaveBeenCalledWith('Backspace');
    });

    test('handles first row letters through onKeyPress', () => {
        const onKeyPress = jest.fn();
        render(<Keyboard onKeyPress={onKeyPress} letterStatuses={{}} />);
        fireEvent.click(screen.getByRole('button', { name: 'Q' }));
        expect(onKeyPress).toHaveBeenCalledWith('q');
    });
});
