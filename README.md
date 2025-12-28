[![CI](https://github.com/natezimm/nerdle/actions/workflows/deploy.yml/badge.svg)](https://github.com/natezimm/nerdle/actions/workflows/deploy.yml)
[![Coverage](https://img.shields.io/badge/coverage-checked-brightgreen)](#testing--quality)

# Nerdle

Nerdle is a Wordle-inspired experience that focuses on technology vocabulary. A React frontend pairs with an Express backend to serve randomized tech words, validate guesses, show letter-flip animations, and store persistent gameplay statistics.

Live: `https://nerdle.nathanzimmerman.com`

## Features

- **4/5/6-letter games**: Choose word length from the settings modal; each new game fetches a random tech word of that length.
- **Animated feedback**: Tile flip animations reveal correct/present/absent letters; results also apply to the on-screen keyboard.
- **Stats (per word length)**: Trophy modal shows games played, win %, current/max streak, fastest solve time, and fewest guesses (stored in `localStorage`).
- **Theme toggle**: Light/dark mode, persisted in `localStorage`.
- **Server-side guess validation**: A guess is valid if it’s either in the curated tech list or the `word-list` dictionary for that word length.

## Tech Stack

- **Client**: React 18, Vite, Axios, Testing Library / Vitest.
- **Server**: Node.js (ESM, Node 22), Express, `word-list`, Jest + Supertest.
- **Deploy**: GitHub Actions + AWS Lightsail (via SSH).

## Security
- **Helmet**: Sets secure HTTP headers (XSS protection, content security policy, etc.)
- **CORS**: Strict origin allowlist; only trusted domains and localhost (in dev) are permitted.
- **Rate Limiting**:
  - Global: 100 requests per 15 minutes per IP.
  - `/api/words/validate`: 20 requests per minute to prevent brute-force guessing.
- **Input Validation**: The `/validate` endpoint enforces:
  - Alphabetic characters only (`a-zA-Z`).
  - Length between 1–10 characters.
- **Body Size Limit**: JSON payloads capped at 10KB to prevent large payload attacks.

## Getting Started

### Prerequisites

- Node.js 22 (see `.nvmrc`)
- npm (bundled with Node.js)

### Installation

```bash
git clone https://github.com/natezimm/nerdle.git
cd nerdle
```

Install dependencies for each app:

```bash
cd client && npm ci
cd ../server && npm ci
```

### Running Locally

1. **Server** (port `4000`)
   ```bash
   cd server
   npm start
   ```
   The server listens on `http://localhost:4000` by default and exposes the API used by the client.

2. **Client** (port `3000`)
   ```bash
   cd client
   npm run dev
   ```
   The React app runs on `http://localhost:3000` and proxies `/api` requests to `http://localhost:4000` (see `client/vite.config.js`).

### Environment Variables

- **Server**
  - `PORT` (default: `4000`)
  - `CORS_ORIGIN` – additional allowed origin for browsers (optional)
  - `NODE_ENV` – set to `production` in production

## Testing & Quality

- **Client** (Vitest)
  ```bash
  cd client
  npm test              # watch mode
  npm test -- --run     # single run
  npm run test:coverage # coverage report
  ```
- **Server** (Jest)
  ```bash
  cd server
  npm test
  ```
  Jest covers the API routes, tech word list, and word list loader (ESM tests run with `--experimental-vm-modules`).

- CI runs client and server test suites on every push to `main`
- Code coverage is checked and enforced before deployment
- Coverage thresholds:
  - Lines ≥ 90%
  - Statements ≥ 85%
  - Functions ≥ 85%
  - Branches ≥ 80%

## Build & Deploy

- **Client production build**
  ```bash
  cd client
  npm run build
  ```
  The build output lands in `client/build`.

- **Deploy (Lightsail)**
  - GitHub Actions runs CI, then SSHes into a Lightsail instance and runs `~/deploy-scripts/deploy-nerdle.sh`.
  - The workflow also checks `GET /` and `GET /api/health` after deploy (see `.github/workflows/deploy.yml`).

## API Endpoints

- `GET /api/health`  
  Returns `{ "status": "ok" }`.

- `GET /api/words/random`  
  Returns a random tech word. Supports `?length=4|5|6` (default: `5`).

- `POST /api/words/validate`  
  Validates a guess against both the curated tech list and the `word-list` dictionary for the submitted word length.  
  Request body: `{ "word": "guess" }`  
  Response: `{ "valid": true || false }`

## Gameplay & Experience

- Submit guesses by typing on your keyboard, using the on-screen keyboard, or clicking `Enter`/`Backspace`.
- Letter tiles animate with a flip sequence and persist their status to help guide future guesses.
- Tap the trophy button to review stats for the current word length.
- Tap the gear button to switch theme and word length.
