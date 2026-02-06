# FractPath Calculator Widget

## Overview
A React-based embeddable widget (ES module) for the FractPath Scenario Tool. It supports persona-based views (buyer, homeowner, investor, realtor, ops) with controlled calculator inputs and is designed to be embedded in external sites.

## Project Architecture
- **Framework**: React 19 + TypeScript + Vite 7
- **Build output**: ES module (`dist/index.js`) for library consumption
- **Dev entry**: `index.html` → `src/main.tsx` (dev harness with persona/mode switcher)
- **Lib entry**: `src/lib/index.ts` (public exports for consumers)
- **Widget**: `src/widget/` (FractPathCalculatorWidget, wired calculator, persona config, formatting)
- **Calc engine**: `src/calc/` (computeScenario, buildChartSeries, types, constants)
- **Components**: `src/components/EquityChart.tsx` (SVG line chart)

## Key Files
- `vite.config.ts` - Vite config with ES lib build and dev server (port 5000)
- `src/lib/index.ts` - Public API exports (keep stable)
- `src/widget/wired.tsx` - Calculator UI shell with controlled inputs + outputs
- `src/widget/persona.ts` - Persona config (hero label, hero value selector, helper text)
- `src/widget/format.ts` - Formatting helpers (currency, percent, month)
- `src/widget/types.ts` - Widget prop types (CalculatorPersona, CalculatorMode, etc.)
- `src/calc/calc.ts` - Deterministic calc engine (computeScenario)
- `src/calc/constants.ts` - DEFAULT_INPUTS and default rates
- `src/main.tsx` - Dev harness entry point

## Development
- Dev server runs on port 5000 via `npm run dev`
- Build with `npm run build` → outputs to `dist/`
- TypeScript build uses `tsconfig.build.json` for declarations

## Recent Changes
- 2026-02-06: Implemented WGT-030 Calculator UI shell (controlled inputs, outputs panel, settlement rows, persona-driven hero, equity chart)
- 2026-02-06: Updated dev harness (main.tsx) to render widget with persona/mode toggle
- 2026-02-06: Configured Vite dev server for Replit (port 5000, host 0.0.0.0, allowedHosts: true)
