# Crimson Caravan

A social casino for adults (18+): three old tables, a fortune tent, and a locked chest of digital prizes. Diamonds have no cash value.

## What's inside

- **Tables:** slots, blackjack and roulette (`src/components/games/`)
- **Fortune tent:** a fortune-telling page
- **Vault and prizes:** a locked chest of digital prizes; keys are shown once, then forgotten
- **Play pacing:** one hour of play every four hours, with free diamonds accruing while you are away

Game rules and payouts live in `src/lib/game/rules.ts`. Routes are in `src/routes/` (`slots`, `blackjack`, `roulette`, `fortune`, `prizes`, `vault`, `login`).

## Getting started

Requires Node.js and npm.

```bash
npm install
npm run dev        # dev server on http://localhost:8080
```

| Command | What it does |
|---|---|
| `npm run build` | Production build, then runs database migrations |
| `npm run preview` | Preview the built app |
| `npm test` | Unit tests (Node's built-in test runner) |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Tech

React with TanStack Router, built with Vite. Auth and data layers live in `src/lib/auth` and `src/lib/app-data`; migrations are in `migrations/`.

This project began as an export from Grok's App Builder.
