# Ask Ally

Fixture-driven conversational insights prototype for CommerceIQ NAMs.

## What it is

Ally answers gap-to-plan, Buy Box, promo, and MAP questions with dollar-first answers, charts, drill/pivot chips, dashboards, decks, and automations — **without a live backend**. Answers come from hand-authored fixtures played through a real UI pipeline (thinking → stream → visuals).

## Stack

- React 18+ / TypeScript / Vite
- Tailwind CSS v4
- `@ciq-dev/ciq-design-system` (chat primitives, feedback, tables, etc.)
- Zustand + localStorage
- React Router (`/chat`, `/automations`, `/settings`)

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

## Try these prompts

- “Run Gap to plan analysis for the entire portfolio” — dedicated report template
- “Which categories did not meet last week's plan?” — category gap table
- “Why did Skin Care miss?” — ranked bars drill
- “Which SKUs have chronic Buy Box loss?” — heat strip
- “Promo compliance status for Skin Care” — status board
- “Check MAP pricing against my policy file” — file echo-back (or attach a file)
- “Alert me if MAP breaks again” — automation + backtest
- “Build a slide deck” — outline → build flow

## Design system wiring

```css
@import "tailwindcss";
@import "./styles/tokens.css";   /* copied — npm package does not ship tokens.css yet */
@import "./styles/ciq-theme.css";
@source "../node_modules/@ciq-dev/ciq-design-system/dist";
```

## Future integration seam

Replace fixture playback in [`src/agent/runner.ts`](src/agent/runner.ts) with a real ACP/LLM call. Keep agent identity in [`src/config/agent.ts`](src/config/agent.ts).

## Desktop only

Optimized for 1280–1920px. Mobile is out of scope for this prototype.
