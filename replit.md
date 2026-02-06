# FractPath Calculator Widget

## Overview
A React-based embeddable widget (IIFE format) for the FractPath Scenario Tool. It supports persona-based views (Buyer, Homeowner, Realtor) and is designed to be embedded in external sites (e.g., Webflow).

## Project Architecture
- **Framework**: React 19 + TypeScript + Vite 7
- **Build output**: IIFE bundle (`dist/fractpath-calculator.js`) for embedding
- **Dev entry**: `index.html` → `src/main.tsx` (standard React app)
- **Widget entry**: `src/index.tsx` (exports `mount`, `setPersona`, `getScenarioSummary`, `resetScenario` via `window.FractPathCalculator`)
- **Widget host test page**: `widget-host/index.html`

## Key Files
- `vite.config.ts` - Vite config with IIFE lib build and dev server settings
- `src/App.tsx` - Main React component with persona switching
- `src/index.tsx` - Widget API (mount, setPersona, etc.)
- `src/main.tsx` - Dev-mode entry point

## Development
- Dev server runs on port 5000 via `npm run dev`
- Build with `npm run build` → outputs to `dist/`

## Recent Changes
- 2026-02-06: Configured Vite dev server for Replit (port 5000, host 0.0.0.0, allowedHosts: true)
