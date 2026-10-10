# Company Detailed View

A Screener.in-inspired company analysis page for listed Indian companies, built with live market data.

> 🚧 Work in progress — sections below will be completed as features land.

## Tech Stack

| Layer    | Technology                                             |
| -------- | ------------------------------------------------------ |
| Frontend | Next.js (App Router), React, TypeScript, Tailwind CSS, Recharts |
| Backend  | Node.js, Express 5, TypeScript, Zod, node-cache        |

## Project Structure

```
.
├── frontend/              # Next.js app
│   └── src/
│       ├── app/           # Routes (App Router)
│       ├── components/    # Reusable UI components
│       ├── lib/           # API client, config, formatters
│       └── types/         # Shared TS types
└── backend/               # Express API
    └── src/
        ├── config/        # Env validation
        ├── routes/        # Route definitions
        ├── controllers/   # Request handlers
        ├── services/      # Business logic + data provider adapters
        ├── middleware/    # Error handling, rate limiting
        ├── utils/         # Cache, HTTP errors
        └── types/
```

## Setup

Prerequisites: Node.js 20+ and npm.

### Backend

```bash
cd backend
cp .env.example .env      # then fill in MARKET_API_KEY
npm install
npm run dev               # http://localhost:5500/api/health
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev               # http://localhost:3000
```

## Data Provider

_TBD — provider, endpoints used, and free-tier limitations will be documented here._

## Architecture / Approach

_TBD_

## Assumptions & Incomplete Features

_TBD_
