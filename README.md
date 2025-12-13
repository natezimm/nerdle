# Nerdle

Nerdle is a Wordle-inspired experience that focuses on technology vocabulary. A React frontend pairs with an Express backend to serve randomized tech words, validate guesses, show letter-flip animations, and store persistent gameplay statistics.

## Features

- **Daily challenge feel**: Players have six attempts to guess a five-letter tech word, with animated flip cards revealing correct, present, or absent letters.
- **Interactive keyboard**: The on-screen keyboard mirrors letter statuses from each guess so feedback stays visible even when using a physical keyboard.
- **Persistent statistics**: The trophy button opens a modal that summarizes total games, win percentage, streaks, fastest solve time, and fewest guesses; stats are stored in `localStorage`.
- **Robust validation**: The server checks each guess against both the curated tech word list and the npm `word-list` package to ensure players submit real words.

## Tech Stack

- **Client**: React, Axios, React Scripts, custom CSS for animations.
- **Server**: Node.js, Express, `word-list` word dictionary, CORS and body parsing middleware.
- **Hosting**: Render (static site for the client, web service for the API).

## Getting Started

### Prerequisites

- Node.js (recommended 18+)
- npm (bundled with Node.js)

### Installation

```bash
git clone https://github.com/your-username/nerdle.git
cd nerdle
```

Install dependencies for each app:

```bash
cd server
npm install
cd ../client
npm install
```

### Running Locally

1. **Server**
   ```bash
   cd server
   npm start
   ```
   The server listens on `http://localhost:4000` by default and exposes the API used by the client.

2. **Client**
   ```bash
   cd client
   npm start
   ```
   The React app runs on `http://localhost:3000` and proxies API requests to the backend.

### Environment Variables

- **Client**
  - `REACT_APP_API_URL` (default: `http://localhost:4000`) – point the client to a different backend in development or production.

- **Server**
  - `PORT` (default: `4000`)
  - `CORS_ORIGIN` – set to the client origin (e.g., `https://nerdle-client.onrender.com`) to allow browser requests in production.

## Testing

- **Client**
  ```bash
  cd client
  npm run test          # interactive mode
  npm run test:coverage # single-run coverage report
  ```
- **Server**
  ```bash
  cd server
  npm test
  ```
  Jest covers the API routes, tech word list, and word list utility loader.

## Build & Deploy

- **Client production build**
  ```bash
  cd client
  npm run build
  ```
  The build output lands in `client/build`.

- **Server production workflow**
  ```bash
  cd server
  npm run build  # builds the client and outputs static assets
  npm start      # serves the API and static bundle (Render config)
  ```

Render configuration:

- **Client**: static site
  - Build command: `npm run build`
  - Publish directory: `build`
- **Server**: web service
  - Start command: `npm start`
  - Root directory: `server`

## API Endpoints

- `GET /api/words/random`  
  Returns a random word from `server/techWords.js`.

- `POST /api/words/validate`  
  Validates a lowercase guess against both the curated tech list and the five-letter dictionary sourced from the `word-list` package.  
  Request body: `{ "word": "guess" }`  
  Response: `{ "valid": true || false }`

## Gameplay & Experience

- Submit guesses by typing on your keyboard, using the on-screen keyboard, or clicking `Enter`/`Backspace`.
- Letter tiles animate with a flip sequence and persist their status to help guide future guesses.
- Tap the trophy button to review how many games you have played, your win rate, streaks, fastest solve time, and fewest guesses.

