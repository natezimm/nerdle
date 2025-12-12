// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Suppress noisy, expected console warnings/errors during tests.
const _realConsoleError = console.error.bind(console);
const _realConsoleWarn = console.warn.bind(console);
const IGNORED_MESSAGES = [
	'ReactDOMTestUtils.act',
	'Error fetching the word:',
	'Error validating the word:',
];

console.error = (...args) => {
	try {
		const msg = args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
		if (IGNORED_MESSAGES.some((m) => msg.includes(m))) return;
	} catch (e) {
		// fallthrough to real console
	}
	_realConsoleError(...args);
};

console.warn = (...args) => {
	try {
		const msg = args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ');
		if (IGNORED_MESSAGES.some((m) => msg.includes(m))) return;
	} catch (e) {
		// fallthrough to real console
	}
	_realConsoleWarn(...args);
};
