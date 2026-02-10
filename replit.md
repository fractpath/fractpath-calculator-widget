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

## Widget UI (WGT-030)
- **Apply semantics**: No live recompute on keystroke. Outputs start null (empty state). Computed only on explicit Apply button click in modal.
- **Persona header**: Always visible. Homeowner / Buyer primary toggle + "Realtor (beta)" tertiary. Widget manages persona state internally; `persona` prop sets initial value.
- **Persona switch**: Clears outputs to empty state, resets draft inputs, emits persona_switched + inputs_reset events.
- **Input modal**: Darkened backdrop overlay, ESC/click-outside to close, focus trap. Required inputs + assumptions accordion. Marketing = assumptions read-only ("editable after signup"). App = editable.
- **Empty state**: "No results yet" with "Get Started" button before first Apply.

## Widget Modes
- **marketing**: Persona-framed KPI card (hero metric with persona label), 3-col settlement rows (timing/when/net payout), equity chart, read-only assumptions. CTAs: "Save & Continue" (emits DraftSnapshot), "Share" (emits ShareSummary), "Edit Inputs" (reopens modal).
- **app**: Full analysis with 6-col settlement rows (timing/month/net/raw/TF/clamp), equity chart. Apply emits SavePayload. CTA: "Edit Inputs" (reopens modal).

## Widget Events
- calculator_used, share_clicked, save_continue_clicked, save_clicked
- modal_opened, modal_closed, apply_clicked, persona_switched (with previousPersona), inputs_reset

## Versioning
- `contract_version`: "1.0.0" — tracks integration contract version
- `schema_version`: "1.0.0" — tracks DraftSnapshot/ShareSummary/SavePayload schema version
- Both follow semver per WGT-050

## Development
- Dev server runs on port 5000 via `npm run dev`
- Build with `npm run build` → outputs to `dist/`
- Test with `npm test` → runs vitest (87 tests across 5 suites)
- TypeScript build uses `tsconfig.build.json` for declarations

## Recent Changes
- 2026-02-10: WGT-030 UI surface implementation — Apply semantics (no live recompute), persona header with internal state management, modal overlay with focus trap + assumptions accordion, empty state, mode-gated output regions (marketing KPI cards / app 6-col settlement), new WidgetEvent types (modal_opened/closed, apply_clicked, persona_switched, inputs_reset)
- 2026-02-09: Sprint 5 implementation — marketing/app modes, DraftSnapshot, ShareSummary, SavePayload, deterministic hashing, mode-gated UI, integration contract doc
- 2026-02-06: Configured Vite dev server for Replit (port 5000, host 0.0.0.0, allowedHosts: true)
