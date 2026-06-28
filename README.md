# ReleaseCheck

[![CI](https://github.com/itsmohsin/releasecheck/actions/workflows/ci.yml/badge.svg)](https://github.com/itsmohsin/releasecheck/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-000?logo=next.js)](https://nextjs.org)
[![GraphQL](https://img.shields.io/badge/GraphQL-16-E10098?logo=graphql)](https://graphql.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://postgresql.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A release management checklist tool for software teams. Track release steps with auto-computed status — **planned** → **ongoing** → **done**.

> **Live demo**: [releasecheck.itsmohsin.com](https://releasecheck.itsmohsin.com)

---

## Features

- **Release management** — create, view, and delete releases with name + due date
- **7-step checklist** — track release readiness (PRs merged, tests passing, deployment, etc.)
- **Auto status** — status updates automatically based on step completion
- **Additional notes** — add context to each release
- **GraphQL + REST** — dual API layer (frontend uses GraphQL, REST also available)
- **Responsive** — works on desktop and mobile
- **Enterprise admin UI** — clean, compact, accessible design inspired by Linear and Stripe

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | [Next.js 16](https://nextjs.org) (App Router, React 19, TypeScript) |
| Backend | Next.js API Routes + [GraphQL](https://graphql.org) |
| Database | [PostgreSQL](https://postgresql.org) 16 (hosted on Supabase) |
| Deployment | [Vercel](https://vercel.com) |
| CI | [GitHub Actions](https://github.com/itsmohsin/releasecheck/actions) |
| Containerization | Docker + docker-compose |

## Database Schema

```sql
CREATE TABLE releases (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    due_date TIMESTAMP NOT NULL,
    additional_info TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE release_steps (
    id SERIAL PRIMARY KEY,
    release_id INTEGER NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
    step_index INTEGER NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    UNIQUE(release_id, step_index)
);
```

## API

### REST Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/releases` | List all releases |
| `POST` | `/api/releases` | Create a release |
| `GET` | `/api/releases/:id` | Get release with steps |
| `PUT` | `/api/releases/:id` | Update additional info |
| `PUT` | `/api/releases/:id/steps/:index` | Toggle a step |
| `DELETE` | `/api/releases/:id` | Delete a release |

### GraphQL Endpoint

**`POST /api/graphql`**

```graphql
type Query {
  releases: [Release!]!
  release(id: ID!): Release
}

type Mutation {
  createRelease(name: String!, due_date: String!, additional_info: String): Release!
  updateRelease(id: ID!, additional_info: String!): Release!
  toggleStep(id: ID!, stepIndex: Int!, completed: Boolean!): StepToggleResult!
  deleteRelease(id: ID!): Boolean!
}
```

## Running Locally

### Option 1: Docker (recommended)

```bash
docker compose up
```

Open [http://localhost:3000](http://localhost:3000).

### Option 2: Manual

```bash
# Prerequisites: Node.js 20+, PostgreSQL running
git clone https://github.com/itsmohsin/releasecheck
cd releasecheck
npm install
cp .env.example .env.local   # edit DATABASE_URL
npm run dev
```

### Tests

```bash
npm test
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── graphql/route.ts       # GraphQL endpoint
│   │   └── releases/              # REST endpoints
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                   # Main SPA page
├── components/
│   ├── CreateRelease.tsx           # Form to create
│   ├── Modal.tsx                   # Confirmation dialog
│   ├── ReleaseDetail.tsx           # Detail + checklist
│   ├── ReleaseList.tsx             # Table of releases
│   └── Toast.tsx                   # Toast notifications
└── lib/
    ├── api.ts                      # GraphQL client
    ├── db.ts                       # PostgreSQL + queries
    ├── db.test.js                  # Unit tests
    ├── graphql/
    │   ├── resolvers.ts
    │   └── typeDefs.ts
    ├── steps.ts                    # Step definitions
    └── types.ts                    # TypeScript types
```

## Deployment

The app is deployed on Vercel with automatic deploys from the `main` branch.

- **Production**: [releasecheck.itsmohsin.com](https://releasecheck.itsmohsin.com)
- **Repository**: [github.com/itsmohsin/releasecheck](https://github.com/itsmohsin/releasecheck)

## What I'd Add Next

Given more time, I'd add:
- **User authentication** — multi-team support
- **Step reordering** — drag-and-drop checklist
- **Webhook notifications** — Slack/Discord on release completion
- **Dark mode** — theme toggle
- **E2E tests** — Playwright for critical flows
- **CI pipeline hooks** — auto-run tests on PR
