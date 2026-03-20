# Golf Group Score Tracker

A dark-themed golf score tracker with leaderboards, player comparisons, round history, and AI-powered scorecard parsing via Claude Vision.

## Features

- **Season Leaderboard** — Sortable standings by gross avg, net avg, wins, money won
- **Player vs Player** — H2H records, score differential trends, front/back 9 breakdowns
- **Team vs Team** — Combined net comparisons across shared rounds
- **Round History** — Expandable hole-by-hole scorecards with skins results
- **Player Profiles** — Scoring trends, handicap tracking, H2H records
- **AI Scorecard Parsing** — Upload a scorecard image and Claude Vision extracts all scores automatically

## Tech Stack

- Next.js 15 (App Router)
- Tailwind CSS 4
- Recharts
- Anthropic Claude Vision API

## Local Development

```bash
# Install dependencies
npm install

# Create .env.local with your Anthropic API key (needed for scorecard image parsing)
echo "ANTHROPIC_API_KEY=your-key-here" > .env.local

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The app comes pre-loaded with 3 sample players and 3 sample rounds.

## Deploy to Vercel

### Option 1: Vercel CLI

```bash
npm i -g vercel
vercel
```

### Option 2: GitHub Integration

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo
3. Vercel auto-detects Next.js — click Deploy

### Set Environment Variable

In the Vercel Dashboard:
1. Go to your project → Settings → Environment Variables
2. Add `ANTHROPIC_API_KEY` with your Anthropic API key
3. Redeploy for the change to take effect

## Important: Data Persistence

This app uses file-based JSON storage (`/data/players.json` and `/data/rounds.json`). On Vercel's serverless platform, the filesystem is **read-only at runtime** — so new rounds added via the `/add` page will not persist between deployments.

For production use with persistent data, consider:
- **Vercel KV** or **Vercel Postgres** (free tier available)
- **Self-host** on a VPS where file writes persist
