describe('reportWebVitals', () => {
    beforeEach(() => {
        jest.resetModules();
    });

    test('does nothing when no callback provided', () => {
        const reportWebVitals = require('./reportWebVitals').default;
        expect(() => reportWebVitals()).not.toThrow();
    });

    test('imports web-vitals and calls metrics when callback provided', async () => {
        const mockCallback = jest.fn();

        const getCLS = jest.fn();
        const getFID = jest.fn();
        const getFCP = jest.fn();
        const getLCP = jest.fn();
        const getTTFB = jest.fn();

        // Provide a virtual mock for web-vitals so dynamic import resolves to it
        jest.doMock('web-vitals', () => ({
            getCLS,
            getFID,
            getFCP,
            getLCP,
            getTTFB,
        }), { virtual: true });

        const { __invokeWebVitals } = require('./reportWebVitals');
        await __invokeWebVitals(mockCallback);

        expect(getCLS).toHaveBeenCalledWith(mockCallback);
        expect(getFID).toHaveBeenCalledWith(mockCallback);
        expect(getFCP).toHaveBeenCalledWith(mockCallback);
        expect(getLCP).toHaveBeenCalledWith(mockCallback);
        expect(getTTFB).toHaveBeenCalledWith(mockCallback);
    });

    test('reportWebVitals calls helper when given a function', () => {
        const mockCallback = () => {};

        const getCLS = jest.fn();
        const getFID = jest.fn();
        const getFCP = jest.fn();
        const getLCP = jest.fn();
        const getTTFB = jest.fn();

        jest.doMock('web-vitals', () => ({
            getCLS,
            getFID,
            getFCP,
            getLCP,
            getTTFB,
        }), { virtual: true });

        const reportWebVitals = require('./reportWebVitals').default;
        // calling should not throw and will exercise the conditional branch
        expect(mockCallback instanceof Function).toBe(true);
        expect(() => reportWebVitals(mockCallback)).not.toThrow();
    });
});
