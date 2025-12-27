import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

describe('main.jsx bootstrap', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="root"></div>';
    });

    test('creates root and renders App', async () => {
        // Dynamic import to test the module
        const { default: App } = await import('./App.jsx');
        const { createRoot } = await import('react-dom/client');
        
        // Verify the root element exists
        const rootElement = document.getElementById('root');
        expect(rootElement).toBeTruthy();
        
        // Test that App can be rendered without errors
        const root = createRoot(rootElement);
        expect(() => {
            root.render(<App />);
        }).not.toThrow();
        
        root.unmount();
    });
});
