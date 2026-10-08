# Nerdle agent guide

## Scope and workspace

Nerdle is a technology word-guessing game with a React/Vite client and Express API, deployed at `nerdle.nathanzimmerman.com`. The server owns answers, guesses, hints, and game completion; the client owns presentation and local statistics.

This repo and `../nathanzimmerman.com`, `../brick-breaker-resume`, `../blackjack`, and `../sudoku` are independent Git repositories. Root, client, and server npm packages here have separate lockfiles and installs. Read a sibling's guide before changing it. Check the working tree and preserve unrelated changes. See `docs/architecture.md` for context; executable configuration takes precedence over stale prose.

## Where to work

- `client/src/game/useNerdleGame.js`: gameplay orchestration; `scoring.js`: keyboard status merging.
- `client/src/api/games.js`: API calls; `client/src/components/`: grid, keyboard, alerts, and modals.
- `client/src/utils/` and `hooks/`: statistics, appearance, and shared modal behavior.
- `server/app.js`: Express app/middleware; `server/server.js`: process entry and listener.
- `server/routes/gameRoutes.js`: game creation, guesses, and hints.
- `server/services/gameService.js`: authoritative game state and scoring; `server/services/wordService.js`: dictionary and word selection; `server/techWords.js` and `server/wordCategories.js`: curated words and hint categories.
- Colocated client tests, `server/__tests__/`, and `e2e/nerdle.spec.js`: test entry points.

## Commands and runtime caveat

Node declarations conflict: `.nvmrc` and CI select 22, and the server requires `>=22 <23`; root/client manifests declare 26. No single Node major satisfies all these declarations. Record the runtime used and any resulting failures when validating changes.

Run these commands from the repo root:

- Install: `npm ci`, `npm ci --prefix client`, and `npm ci --prefix server`.
- API development: `npm run dev --prefix server` (port 4000).
- Client development: `npm run dev --prefix client` (port 3000, proxies `/api` to port 4000).
- API requests use relative `/api/games` URLs. The client does not currently read `VITE_API_URL`, despite the suggestion in `client/.env.example`. Server overrides are documented in `server/.env.example`.
- Build: `npm run build` produces `client/build/` for deployment compatibility.
- Client tests: `npm run client:test`; client coverage: `npm run test:coverage --prefix client`.
- Server tests/coverage: `npm run server:test` (Jest with ESM options configured by the package script).
- Combined unit tests: `npm test`; static checks: `npm run lint` and `npm run typecheck` (TypeScript checking JavaScript).
- Browser tests: `npm run test:e2e`; install browsers with `npx playwright install chromium webkit` if needed.
- Full CI gate: `npm run quality` runs formatting, lint, typecheck, unit tests, and Playwright. The gate includes server coverage; run client coverage separately when needed. Playwright builds and previews the client without starting the API.
- Documentation-only checks: `npx prettier --check <files>`.

## Behavior to preserve

- Keep answers and scoring authoritative on the server. Starting a game returns an opaque ID; only terminal results disclose the answer. Hints must use the server's controlled hint response.
- Preserve 4/5/6-letter play, repeated-letter scoring, keyboard status priority, invalid-guess handling, and attempt limits. Keep category hints aligned with the curated word pools.
- Games live in bounded, expiring process memory. API restarts invalidate active games; do not assume durable or shared state across instances.
- Keep validation, rate limits, and CORS intact. Maintain contract alignment between API routes, client calls, and tests.
- Use ESM and existing JSDoc/checkJs conventions. Client tests use Vitest; server tests use Jest.
- Browser tests mock API responses and cover desktop/mobile Chromium and mobile WebKit. Backend changes need server tests as well.

## Verification and delivery

Run relevant checks and use `npm run quality` for broad application changes. Report failures and checks not run. Edit sources rather than generated builds or reports, and update this guide when commands or architecture change.

All five repos default to Playwright port 4173. Run browser suites sequentially and stop unrelated previews first: local Playwright runs reuse an existing server, which can accidentally test another repo. `.github/workflows/deploy.yml` runs CI for PRs targeting `main` and pushes to `main`; successful main pushes deploy through the `production` environment and external GCP script.
