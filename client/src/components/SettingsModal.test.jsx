import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, test, expect } from 'vitest';
import SettingsModal from './SettingsModal.jsx';

describe('SettingsModal', () => {
    test('does not render when closed', () => {
        render(
            <SettingsModal
                isOpen={false}
                onClose={vi.fn()}
                theme="light"
                onToggleTheme={vi.fn()}
                wordLength={5}
                onWordLengthChange={vi.fn()}
            />
        );
        expect(screen.queryByText('Settings')).not.toBeInTheDocument();
    });

    test('renders when open and displays settings options', () => {
        render(
            <SettingsModal
                isOpen={true}
                onClose={vi.fn()}
                theme="light"
                onToggleTheme={vi.fn()}
                wordLength={5}
                onWordLengthChange={vi.fn()}
            />
        );
        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByText('Theme')).toBeInTheDocument();
        expect(screen.getByText('Word Length')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '6' })).toBeInTheDocument();
    });

    test('calls onClose when close button is clicked', () => {
        const onClose = vi.fn();
        render(
            <SettingsModal
                isOpen={true}
                onClose={onClose}
                theme="light"
                onToggleTheme={vi.fn()}
                wordLength={5}
                onWordLengthChange={vi.fn()}
            />
        );
        fireEvent.click(screen.getByRole('button', { name: 'Close settings' }));
        expect(onClose).toHaveBeenCalled();
    });

    test('calls onClose when clicking overlay background', () => {
        const onClose = vi.fn();
        const { container } = render(
            <SettingsModal
                isOpen={true}
                onClose={onClose}
                theme="light"
                onToggleTheme={vi.fn()}
                wordLength={5}
                onWordLengthChange={vi.fn()}
            />
        );
        const overlay = container.querySelector('.modal-overlay');
        fireEvent.mouseDown(overlay);
        expect(onClose).toHaveBeenCalled();
    });

    test('does not close when clicking modal content', () => {
        const onClose = vi.fn();
        render(
            <SettingsModal
                isOpen={true}
                onClose={onClose}
                theme="light"
                onToggleTheme={vi.fn()}
                wordLength={5}
                onWordLengthChange={vi.fn()}
            />
        );
        fireEvent.mouseDown(screen.getByRole('dialog'));
        expect(onClose).not.toHaveBeenCalled();
    });

    test('calls onToggleTheme when theme button is clicked', () => {
        const onToggleTheme = vi.fn();
        render(
            <SettingsModal
                isOpen={true}
                onClose={vi.fn()}
                theme="light"
                onToggleTheme={onToggleTheme}
                wordLength={5}
                onWordLengthChange={vi.fn()}
            />
        );
        fireEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }));
        expect(onToggleTheme).toHaveBeenCalled();
    });

    test('shows correct theme toggle text for dark mode', () => {
        render(
            <SettingsModal
                isOpen={true}
                onClose={vi.fn()}
                theme="dark"
                onToggleTheme={vi.fn()}
                wordLength={5}
                onWordLengthChange={vi.fn()}
            />
        );
        expect(screen.getByText('Light')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument();
    });

    test('calls onWordLengthChange when word length option is clicked', () => {
        const onWordLengthChange = vi.fn();
        render(
            <SettingsModal
                isOpen={true}
                onClose={vi.fn()}
                theme="light"
                onToggleTheme={vi.fn()}
                wordLength={5}
                onWordLengthChange={onWordLengthChange}
            />
        );
        fireEvent.click(screen.getByRole('button', { name: '4' }));
        expect(onWordLengthChange).toHaveBeenCalledWith(4);
        fireEvent.click(screen.getByRole('button', { name: '6' }));
        expect(onWordLengthChange).toHaveBeenCalledWith(6);
    });

    test('marks selected word length button as selected', () => {
        render(
            <SettingsModal
                isOpen={true}
                onClose={vi.fn()}
                theme="light"
                onToggleTheme={vi.fn()}
                wordLength={5}
                onWordLengthChange={vi.fn()}
            />
        );
        expect(screen.getByRole('button', { name: '5' })).toHaveClass('selected');
        expect(screen.getByRole('button', { name: '4' })).not.toHaveClass('selected');
        expect(screen.getByRole('button', { name: '6' })).not.toHaveClass('selected');
    });
});
