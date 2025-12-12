<div align="center">
  <img width="1200" alt="Trace CRM Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
  <h1>Trace CRM Dashboard</h1>
  <p>Modern CRM & pipeline dashboard built with React + Vite</p>
  <a href="https://kishor-irnak.github.io/Trace.V.02/"><strong>Live Demo (GitHub Pages)</strong></a>
</div>

## Table of Contents
- Overview
- Features
- Tech Stack
- Project Structure
- Getting Started
- Environment Variables
- Available Scripts
- GitHub Pages Deployment
- Preview
- Troubleshooting

## Overview
Trace CRM is a single-page dashboard that showcases pipeline health, recent leads, KPIs, and billing/settings views. It uses mocked CRM data with a lightweight service layer so the UI feels dynamic without needing a backend.

## Features
- **Dashboard KPIs**: Total revenue, active leads, win rate, avg deal size with trend pills.
- **Pipeline Visualization**: Stage-by-stage value chart via Recharts.
- **Lead Drawer**: Quick-create lead drawer with validation.
- **Navigation & Layout**: App shell with side navigation, user profile, and top actions.
- **Responsive UI**: Glassmorphism-inspired cards and responsive grids.
- **Settings & Billing Views**: Placeholder pages ready for real data wiring.

## Tech Stack
- **Framework**: React 18, TypeScript
- **Build Tool**: Vite 6
- **Charts**: Recharts
- **Icons**: lucide-react
- **Deployment**: gh-pages (GitHub Pages)

## Project Structure
```
.
├── App.tsx              # Route-less navigation + layout shell
├── components/          # Layout, LeadDrawer, UI primitives (GlassCard)
├── pages/               # Dashboard, Pipeline, Leads, Billing, Settings
├── services/crmService.ts  # Mock CRM data + subscription helper
├── constants.ts         # Pipeline stage metadata
├── types.ts             # Shared TypeScript types
├── vite.config.ts       # Vite + base path for GitHub Pages
└── package.json         # Scripts and dependencies
```

## Getting Started
**Prerequisites:** Node.js 18+ and npm.

1) Install dependencies  
`npm install`

2) (Optional) Set your Gemini API key if you plan to call Gemini later  
Create `.env.local` and set:
```
GEMINI_API_KEY=your-key-here
```

3) Run locally  
`npm run dev`  
Then open the printed localhost URL (default: http://localhost:3000).

## Environment Variables
The build injects:
- `GEMINI_API_KEY` (exposed as `process.env.GEMINI_API_KEY`)
- `API_KEY` (mirrors GEMINI key for compatibility)

If you don’t need Gemini, you can skip setting it; UI runs with mock data.

## Available Scripts
- `npm run dev` — start Vite dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build
- `npm run deploy` — build and publish `dist` to the `gh-pages` branch (runs `predeploy` → `build`)

## GitHub Pages Deployment
Already configured for this repo:
- `vite.config.ts` sets `base: '/Trace.V.02/'` for correct asset paths.
- `npm run deploy` publishes `dist/` to `gh-pages`.

If you fork/rename:
1) Update `base` in `vite.config.ts` to `'/your-repo-name/'`.
2) Update the README links if needed.
3) Run `npm run deploy`.
4) In GitHub → Settings → Pages, select branch `gh-pages`, folder `/ (root)`.

## Preview
- Live: https://kishor-irnak.github.io/Trace.V.02/
- Banner (hero): shown above.  
If you capture your own screenshots, add them to the repo (e.g., `assets/`) and reference them here.

## Troubleshooting
- **Blank page on GitHub Pages**: Ensure `base` matches the repo name and that Pages is pointed to `gh-pages` root.
- **Chunk size warning**: Recharts bundle can exceed 500 kB; you can add manual chunking in Vite if desired.
- **Env key not loading**: Make sure `.env.local` exists and restart `npm run dev` after changes.
