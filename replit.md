# FractPath Calculator Widget

## Overview
A React-based embeddable widget (ES module) for the FractPath Scenario Tool. It supports persona-based views (buyer, homeowner, investor, realtor, ops) with two modes (marketing/app), controlled calculator inputs, and structured payload emissions (DraftSnapshot, ShareSummary, SavePayload). Designed to be embedded in external sites.

## Project Architecture
- **Framework**: React 19 + TypeScript + Vite 7
- **Testing**: Vitest
- **Build output**: ES module (`dist/index.js`) for library consumption
- **Dev entry**: `index.html` → `src/main.tsx` (dev harness with persona/mode switcher)
- **Lib entry**: `src/lib/index.ts` (public exports for consumers)
- **Widget**: `src/widget/` (FractPathCalculatorWidget, wired calculator, persona config, formatting, snapshot builders, hashing)
- **Calc engine**: `src/calc/` (computeScenario, buildChartSeries, types, constants)
- **Components**: `src/components/EquityChart.tsx` (SVG line chart)
- **Contract docs**: `docs/architecture/integration-contract.md`
- **Tests**: `src/__tests__/` (determinism, schema allowlist, mode gating)

## Key Files
- `vite.config.ts` - Vite config with ES lib build and dev server (port 5000)
- `src/lib/index.ts` - Public API exports (keep stable)
- `src/widget/wired.tsx` - Calculator UI with mode-gated outputs and CTAs
- `src/widget/types.ts` - All widget types (DraftSnapshot, ShareSummary, SavePayload, CalculatorMode, CalculatorPersona, WidgetEvent, etc.) + version constants
- `src/widget/hash.ts` - Deterministic SHA-256 hashing utility
- `src/widget/snapshot.ts` - Builders for DraftSnapshot, ShareSummary, SavePayload
- `src/widget/persona.ts` - Persona config (hero label, hero value selector, helper text)
- `src/widget/format.ts` - Formatting helpers (currency, percent, month)
- `src/calc/calc.ts` - Deterministic calc engine (computeScenario)
- `src/calc/constants.ts` - DEFAULT_INPUTS and default rates
- `src/main.tsx` - Dev harness entry point
- `docs/architecture/integration-contract.md` - Integration contract (WGT-INT-001)

## Widget Modes
- **marketing**: Shows Basic Results only (hero metric + settlement timing/net payout). Has "Save & Continue" (emits DraftSnapshot) and "Share" (emits ShareSummary) CTAs. No chart, no detailed fields.
- **app**: Full analysis with all outputs (raw payout, transfer fees, clamp details, equity chart). Has "Save" CTA (emits SavePayload with full ScenarioInputs/Outputs).

## Versioning
- `contract_version`: "1.0.0" — tracks integration contract version
- `schema_version`: "1.0.0" — tracks DraftSnapshot/ShareSummary/SavePayload schema version
- Both follow semver per WGT-050

## Development
- Dev server runs on port 5000 via `npm run dev`
- Build with `npm run build` → outputs to `dist/`
- Test with `npm test` → runs vitest (30 tests across 3 suites)
- TypeScript build uses `tsconfig.build.json` for declarations

## Recent Changes
- 2026-02-09: Sprint 5 implementation — marketing/app modes, DraftSnapshot, ShareSummary, SavePayload, deterministic hashing, mode-gated UI, integration contract doc, 30 vitest tests
- 2026-02-06: Implemented WGT-030 Calculator UI shell (controlled inputs, outputs panel, settlement rows, persona-driven hero, equity chart)
- 2026-02-06: Configured Vite dev server for Replit (port 5000, host 0.0.0.0, allowedHosts: true)
