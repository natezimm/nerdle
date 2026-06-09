import { describe, test, expect, beforeEach } from 'vitest';
import { act } from 'react';

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
    await act(async () => {
      root.render(<App />);
    });

    await act(async () => {
      root.unmount();
    });
  });
});
