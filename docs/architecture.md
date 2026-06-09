# Nerdle Architecture

Nerdle is intentionally small, but the code is split around production ownership boundaries:

- `client/src/api`: HTTP client wrappers. React code does not call Axios directly.
- `client/src/game`: pure game rules and the `useNerdleGame` state machine.
- `client/src/components`: presentational UI components.
- `server/app.js`: Express app factory, middleware, CORS, rate limits, and route mounting.
- `server/server.js`: process entrypoint that only starts the listener.
- `server/routes`: HTTP route definitions.
- `server/services`: reusable server-side domain logic.

## Client State Flow

`useNerdleGame` owns the game lifecycle:

1. Fetch a random word for the selected length.
2. Accept keyboard input while the game is playable.
3. Validate a submitted guess with the server.
4. Score the guess with `scoreGuess`.
5. Lock input during tile reveal.
6. Update keyboard letter status using strongest-known status priority.
7. Update local stats on win/loss.

The hook uses `AbortController` for in-flight API requests and clears reveal timers when the word length changes or the component unmounts. This prevents stale responses and delayed state updates from crossing game boundaries.

## Scoring Rules

Guess scoring is centralized in `client/src/game/scoring.js`. It uses a two-pass Wordle-style algorithm:

1. Mark exact matches first and reserve them.
2. Count remaining target letters.
3. Mark present letters only while remaining counts exist.
4. Mark all other letters absent.

This avoids over-crediting duplicate letters.

## Server Boundaries

The server app is created in `server/app.js` so tests can instantiate the app without opening a port. `server/server.js` imports that app and starts listening only outside `NODE_ENV=test`.

Word selection and validation live in `server/services/wordService.js`. Validation uses `Set` lookups for dictionary and curated tech-word lists instead of repeated array scans.

## Security Model

The app uses Helmet, a CORS allowlist, request body limits, and endpoint rate limits. The current gameplay model still sends the target word to the browser via `GET /api/words/random`, so users can inspect network traffic or React state to see the answer.

That is acceptable for this casual portfolio game, but it is not a cheat-resistant architecture. A cheat-resistant version would keep the answer server-side and validate guesses against a server-side game session or signed puzzle token.

## Deployment

GitHub Actions runs quality checks on pull requests and pushes to `main`. Deploy runs only for `main` pushes after CI passes. The production job uses a protected environment, a deployment concurrency group, SSH known-host verification, and post-deploy health checks for `/` and `/api/health`.

## Operational Notes

- Real environment files should stay local and ignored. Commit `.env.example` files instead.
- Root quality commands are available through `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm test`, and `npm run build`.
- Playwright/E2E automation is intentionally not included yet. Add it later when the project is ready for browser-level smoke tests.
