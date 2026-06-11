# Architecture

## Runtime Topology

Nerdle is a two-package Node application with a Vite/React client in `client/` and an Express API in `server/`. Local development runs the API on port `4000` and the client on port `3000`, with Vite proxying `/api` calls to the server.

## Architecture Diagram

```mermaid
flowchart LR
  Visitor["Player browser"] --> Client["React 18 + Vite client<br/>client/"]
  Client --> GameState["useNerdleGame<br/>gameplay state + scoring"]
  Client --> UI["Grid, keyboard, modals<br/>client/src/components"]
  Client --> Stats["Browser stats<br/>localStorage"]
  Client --> ApiClient["Word API client<br/>client/src/api/words.js"]
  ApiClient --> Express["Express API<br/>server/"]
  Express --> Random["GET /api/words/random"]
  Express --> Validate["POST /api/words/validate"]
  Random --> Words["Curated tech words"]
  Validate --> Dictionary["Tech words + word-list dictionary"]
  Express --> Middleware["Helmet, CORS,<br/>rate limits, validation"]
  Repo["Repo quality gate<br/>npm run quality"] --> Build["Client build<br/>client/build"]
  Build --> Deploy["GitHub Actions<br/>deploy-nerdle.sh"]

  classDef user fill:#f8fafc,stroke:#475569,color:#0f172a
  classDef site fill:#e0f2fe,stroke:#0369a1,color:#0c4a6e
  classDef server fill:#ffedd5,stroke:#c2410c,color:#7c2d12
  classDef repo fill:#eef2ff,stroke:#4338ca,color:#312e81
  classDef client fill:#dcfce7,stroke:#15803d,color:#14532d
  classDef data fill:#fef3c7,stroke:#b45309,color:#78350f
  classDef delivery fill:#f3e8ff,stroke:#7e22ce,color:#581c87
  classDef external fill:#fee2e2,stroke:#b91c1c,color:#7f1d1d
  class Visitor user
  class Client,GameState,UI,ApiClient client
  class Express,Random,Validate,Middleware server
  class Stats,Words,Dictionary data
  class Repo,Build,Deploy delivery
```

## Source Boundaries

The client owns gameplay state, rendering, keyboard interaction, modals, local statistics, and API calls. The server owns word selection, guess validation, security middleware, CORS, rate limits, and health checks. Shared quality tooling lives at the repo root.

## Quality Gates

Run `npm run quality` from the repo root after installing root, client, and server npm dependencies. The gate checks Prettier formatting, ESLint, TypeScript `checkJs`, client Vitest coverage, server Jest coverage, and the client production build.

## Deployment Flow

GitHub Actions runs the root quality gate for pull requests and pushes to `main`. Pushes to `main` deploy through a protected production job that SSHes to Lightsail and runs `~/deploy-scripts/deploy-nerdle.sh`, then checks `/` and `/api/health`.

## Workspace Connectivity

```mermaid
flowchart LR
  subgraph Workspace["Five repository workspace"]
    PortfolioRepo["nathanzimmerman.com<br/>portfolio"]
    BrickRepo["brick-breaker-resume<br/>Phaser resume game"]
    NerdleRepo["nerdle<br/>React + Express word game"]
    SudokuRepo["sudoku<br/>Angular + ASP.NET Core"]
    BlackjackRepo["blackjack<br/>React + Spring Boot"]
  end

  PortfolioRepo --> PortfolioSite["nathanzimmerman.com"]
  BrickRepo --> BrickSite["resume.nathanzimmerman.com"]
  NerdleRepo --> NerdleSite["nerdle.nathanzimmerman.com"]
  SudokuRepo --> SudokuSite["sudoku.nathanzimmerman.com"]
  BlackjackRepo --> BlackjackSite["blackjack.nathanzimmerman.com"]

  PortfolioSite --> BrickSite
  PortfolioSite --> NerdleSite
  PortfolioSite --> SudokuSite
  PortfolioSite --> BlackjackSite

  PortfolioRepo --> Actions["GitHub Actions<br/>quality + deploy workflows"]
  BrickRepo --> Actions
  NerdleRepo --> Actions
  SudokuRepo --> Actions
  BlackjackRepo --> Actions
  Actions --> Lightsail["AWS Lightsail<br/>static sites + app services"]
  Lightsail --> PortfolioSite
  Lightsail --> BrickSite
  Lightsail --> NerdleSite
  Lightsail --> SudokuSite
  Lightsail --> BlackjackSite

  classDef user fill:#f8fafc,stroke:#475569,color:#0f172a
  classDef site fill:#e0f2fe,stroke:#0369a1,color:#0c4a6e
  classDef server fill:#ffedd5,stroke:#c2410c,color:#7c2d12
  classDef repo fill:#eef2ff,stroke:#4338ca,color:#312e81
  classDef client fill:#dcfce7,stroke:#15803d,color:#14532d
  classDef data fill:#fef3c7,stroke:#b45309,color:#78350f
  classDef delivery fill:#f3e8ff,stroke:#7e22ce,color:#581c87
  classDef external fill:#fee2e2,stroke:#b91c1c,color:#7f1d1d
  class PortfolioRepo,BrickRepo,NerdleRepo,SudokuRepo,BlackjackRepo repo
  class PortfolioSite,BrickSite,NerdleSite,SudokuSite,BlackjackSite site
  class Actions,Lightsail delivery
```

## Deferred Architecture Follow-Ups

The browser currently receives the target word for a casual-game tradeoff. A cheat-resistant version should keep the answer server-side and introduce a per-game server session or signed game token.
