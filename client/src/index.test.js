import React from 'react';

describe('index.js bootstrap', () => {
    beforeEach(() => {
        jest.resetModules();
        document.body.innerHTML = '<div id="root"></div>';
    });

    test('creates root and renders App', () => {
        const renderMock = jest.fn();
        const createRootMock = jest.fn(() => ({ render: renderMock }));

        jest.doMock('react-dom/client', () => ({ createRoot: createRootMock }));

        // Import index after mocking
        require('./index');

        expect(createRootMock).toHaveBeenCalledWith(document.getElementById('root'));
        expect(renderMock).toHaveBeenCalled();
    });
});
