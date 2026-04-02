# FractPath Calculator Widget

## Overview
The FractPath Calculator Widget is an embeddable React-based ES module designed for the FractPath Scenario Tool. Its primary purpose is to provide a versatile financial calculator experience for various user personas (buyer, homeowner, investor, realtor, operations). The widget supports two main modes: a streamlined "marketing" mode for high-level summaries and a comprehensive "app" mode for detailed financial analysis. It features controlled inputs, structured payload emissions (DraftSnapshot, ShareSummary, SavePayload), and is built for seamless integration into external websites. The project aims to be the single source of financial truth for scenario computations, offering a robust and deterministic tool for real estate financial analysis.

## User Preferences
None.

## System Architecture
The widget is built using React 19, TypeScript, and Vite 7, with Vitest for testing. It outputs an ES module (`dist/index.js`). The core computational logic resides in the `@fractpath/compute` package (v10.2.0), ensuring a single, pure-functional source of financial truth.

**Key Architectural Components:**
- **Widget Core**: `src/widget/` orchestrates the calculator's UI, persona-based configurations, data formatting, snapshot building, and deterministic hashing.
- **Calculator Engine**: `src/calc/` houses the `computeScenario` function and chart series builders, utilizing the canonical `@fractpath/compute` for all financial calculations.
- **Editing Layer**: `src/widget/editing/` manages a unified draft state, provides Tier 1 previews, triggers computations on blur, and handles input validation. It uses a metadata-driven field registry (`fieldMeta.ts`) and a tab configuration (`tabConfig.ts`) for rendering inputs.
- **UI/UX**:
    - Supports persona-based presentation (`personaPresentation.ts`) for hero metrics, summary strips, and marketing bullets, ensuring content is tailored without direct computation.
    - Features modal components like `DealEditModal`, `KioskSelect`, `PreviewPanel`, and `HelpTooltip` for interactive input and information display.
    - Visualizations include `EquityChart.tsx` (SVG line chart with stroke-dashoffset animation) and `SimpleBarChart.tsx` (SVG bar chart with scaleY animation) for displaying financial outcomes.
    - Two primary modes: "marketing" for basic results and "app" for full analysis including detailed outputs and equity charts.
    - Marketing mode features Homeowner/Buyer persona tabs with value panel, 4 summary cards (Home Value, Agreement Amount, Monthly Contribution, Projected Appreciation), animated number transitions, and responsive mobile layout.
    - Design utilizes portal-rendered tooltips, stable modal heights, shimmer loading indicators, and CSS keyframe animations for enhanced user experience.
    - Mobile-responsive with `useIsMobile()` hook (640px breakpoint), full-width CTAs, 2x2 summary card grid, and increased touch targets.
- **Data Flow & Payloads**: The widget emits structured payloads: `DraftSnapshot` (for saving draft states), `ShareSummary` (for sharing high-level results), and `SavePayload` (containing full `ScenarioInputs/Outputs`).
- **Versioning**: Strict versioning is enforced across the compute module (`COMPUTE_VERSION`), integration contract (`CONTRACT_VERSION`), and payload schemas (`SCHEMA_VERSION`), all managed as single sources of truth.
- **Drift Guards**: Automated tests ensure version alignment, canonical field coverage, and determinism across various computational paths.

## Project Structure
- **Widget entry**: `src/widget/FractPathCalculatorWidget.tsx` (public API component)
- **Core layout**: `src/widget/wired.tsx` (state management, layout, persona tabs, summary cards, AnimatedNumber component)
- **Persona presentation**: `src/widget/personaPresentation.ts` (central resolver for hero/strip/chart/bullets per persona — ZERO compute, type-only imports)
- **Charts**: `src/widget/components/SimpleBarChart.tsx` (marketing bar chart with CSS animation), `src/components/EquityChart.tsx` (app equity line chart with stroke animation)
- **Edit modal**: `src/widget/components/DealEditModal.tsx` (full editing interface)
- **Field config**: `src/widget/editing/fieldMeta.ts` (WGT-002 — field registry), `src/widget/editing/tabConfig.ts` (5 tabs)
- **Dev harness**: `src/widget/dev/DraftStateHarness.tsx` (WGT-001) + `FieldMetaHarness.tsx` (WGT-002) + `EditModalHarness.tsx` (WGT-003)
- **Drift guards**: `src/__tests__/versionPin.test.ts` (version pin), `src/__tests__/canonicalCoverage.test.ts` (field coverage), `src/__tests__/determinism.guard.test.ts` (preview+chart+tier1 determinism)
- **Test helpers**: `src/__tests__/helpers/dotPaths.ts` (flattenKeys), `src/__tests__/helpers/normalize.ts` (normalizeTimestamps)
- **Fixtures**: `src/__tests__/fixtures/canonicalInputs.fixture.ts` (canonical DealTerms + Assumptions + Draft fixture)
- **Tests**: `src/__tests__/` (widget tests) + `src/widget/editing/__tests__/` (editing tests) + `packages/compute/tests/` (compute module tests) — 241 tests total across 15 suites

## Key Files
- `vite.config.ts` - Vite config with ES lib build and dev server (port 5000)
- `src/lib/index.ts` - Public API exports (keep stable)
- `src/widget/types.ts` - Contract types and version constants
- `packages/compute/` - @fractpath/compute canonical engine
- `CHANGELOG.md` - Version history

## Development
- Dev server runs on port 5000 via `npm run dev`
- Build with `npm run build` → outputs to `dist/`
- Test with `npm test` → runs vitest (241 tests across 15 suites)
- Test compute only: `cd packages/compute && npm test` (78 tests across 3 suites)
- TypeScript build uses `tsconfig.build.json` for declarations

## @fractpath/compute (v11 — new buyout/extension/funding-completion model)
- Canonical financial computation library at `packages/compute/`
- Version 11.0.0 (`src/version.ts`)
- Pure-functional, zero external dependencies
- Key files:
  - `src/index.ts` — computeDeal, DealTerms, ScenarioAssumptions, DealResults, RealtorRepresentationMode, ContractWindow
  - `src/version.ts` — COMPUTE_VERSION = "11.0.0"
  - `src/types.ts` — new v11 DealTerms (window/extension/partial-buyout/fee fields), DealResults (funding-completion/buyout/participation outputs), ContractWindow type
  - `src/computeDeal.ts` — new v11 formulas: funding completion factor, appreciation share, buyout amounts, extension premiums, partial buyouts, discount purchase price, setup/servicing fees
- **Tests**: 69 tests across 4 suites covering total/actual funding, completion factor, appreciation share scaling, extension premium (first/second/post-stop), discount purchase price (enabled/disabled), partial buyouts (enabled/disabled), fmv_override, compute_version, determinism, monetary rounding, realtor fees, window classification, golden fixture + IRR solver + rounding utilities
- **MIGRATION COMPLETE**: Widget layer fully migrated to v11 DealTerms/DealResults. Root build passes. 217 tests across 15 suites all green.

## Recent Changes
- 2026-04-02: v11 Cleanup & Chart Replacement — (1) Replaced EquityTransferChart placeholder with real "Contract Value Overview" component using v11 DealResults (Total Funded, Participation Value, Base Buyout, Adj. Buyout progress bars + funding completion / appreciation share / window KPIs). (2) Rewrote src/calc/chart.ts with v11 milestone chart types (ChartPoint now has contractValue/participationValue/buyoutAmount instead of homeValue/equityPct). (3) Updated EquityChart.tsx to render currency-based "Contract Value Over Time" line chart with milestone points and year labels instead of legacy equity-percent axis. (4) Cleaned up wired.tsx settlement scenarios grid — removed "Raw Payout / Transfer Fee / Clamp" columns, replaced with "Base Buyout / Adj. Buyout / Exit Year / Scenario" 4-column grid. (5) Rewrote src/calc/types.ts: removed all stale floor/cap/ISA/DYF inline comments, annotated v11 field mappings (rawPayout = base_buyout_amount, netPayout = extension_adjusted_buyout_amount). (6) Ran full dead-code sweep — zero stale v10 references in active source. Build: 124KB. 217/217 tests pass.
- 2026-04-02: v11 Full Widget Migration — Completed widget layer migration to v11 DealTerms/DealResults. Updated wired.tsx (buildMarketingDealTerms rewritten for v11 window/extension/fee fields, isa_settlement → extension_adjusted_buyout_amount, fee accordion updated). Updated all 6 failing test suites: versionPin.test.ts ("11.0.0"), canonicalCoverage.test.ts (v11 required keys, FIELD_META count 20), determinism.guard.test.ts (v11 field references), personaPresentation.test.ts (v11 DealTerms, Buyout payout, appreciation share), marketing-lite-wiring.test.ts (v11 fields, exit_admin_fee semantics), determinism.test.ts ("11.0.0"), fieldMetaCoverage.test.ts (20 entries), mode-gating.test.ts (v11 realtor fields). Added vitest exclude for .local tmp pnpm cache. Build output: 120KB. 217/217 tests pass across 15 suites.
- 2026-04-02: v11 Compute Engine Refactor — Replaced legacy floor/cap/IRR/DYF model with new FractPath buyout/extension/funding-completion model. New DealTerms adds window/extension/partial-buyout/fee fields; removes payback_window, timing_factor, floor/ceiling_multiple, downside_mode, DYF, platform_fee, exit_fee_pct, realtor_commission_payment_mode. New DealResults adds total_scheduled_buyer_funding, actual_buyer_funding_to_date, funding_completion_factor, appreciation share (scheduled/effective), buyout amounts (base/extension-adjusted/partial 25/50/75), discount_purchase_price, current_window, fractpath fee outputs; removes all ISA/IRR/vested-equity/timing-factor fields. COMPUTE_VERSION bumped to 11.0.0. 69 compute tests pass across 4 suites. Root build currently fails (expected) — widget layer (src/widget/*, src/calc/*) still references legacy v10 fields and must be migrated in a follow-up ticket.
- 2026-03-10: Ticket 2A UI Corrections — (1) Restored Realtor tab (was regressed in Ticket 2, now all 3 MARKETING_PERSONAS displayed: Homeowner/Buyer/Realtor). (2) Tabs restyled as segmented pill control (dark fill on active) replacing underline tabs. (3) Replaced PERSONA_VALUE_PANEL (headline + body + chips) with single-line PERSONA_VALUE_LINE descriptions per persona — no chips, no body blocks. (4) Removed redundant sections: marketing bullets list, appreciation callout box. (5) KPI strip labels now time-explicit: "Home Value Today", "Cash Unlocked Today", "Monthly Contribution / {N} Months", "Projected Value in {N} Years". (6) SimpleBarChart uses CMYK-inspired palette: cyan #0891b2, magenta #c026d3, amber #ca8a04 (replacing all-grayscale). (7) EquityChart: equity line in cyan #0891b2, settlement markers colored per timing (early=amber, standard=cyan, late=magenta). (8) Tightened spacing throughout. NO changes to compute logic, payload schemas, CTA labels, or app mode. 241 tests, 15 suites, build 129KB.
- 2026-03-10: UI Polish (Ticket 2) — Premium visual overhaul. (1) Title: "Model Your Scenario" + subtext replacing old "FractPath Calculator". (2) Container: border-radius 16px, padding 24px, subtle shadow. (3) Persona tabs: Homeowner/Buyer tabs with value panel (headline, body, chips) and fade animation. (4) Summary cards: 4-card grid (Home Value, Agreement Amount, Monthly Contribution, Projected Appreciation) with AnimatedNumber transitions. (5) Chart animations: SimpleBarChart scaleY animation, EquityChart stroke-dashoffset draw animation, responsive SVG. (6) Mobile UX: useIsMobile hook (640px), stacked layout, full-width CTAs, 2x2 card grid, larger touch targets, 16px min text. (7) CTA helper copy: "Create a free account..." below buttons. (8) Typography: 32px title, 16px subtext, 24px summary numbers, fintech-grade hierarchy. (9) Color: black/white/charcoal palette, no bright colors. (10) Accessibility: focus-visible outlines, keyboard tab nav, range slider styling. NO changes to compute logic, payload schemas, or CTA labels. 241 tests, 15 suites, build passing.
- 2026-02-23: Sprint 11 Drift Guards — Version pin guard (CONTRACT_VERSION + COMPUTE_VERSION alignment), canonical field coverage guard (defaults vs FIELD_META vs TAB_CONFIG), determinism guard (previewCompute + computeDeal + deriveTier1Preview + buildChartSeries), mode gating guard (permission constraints, marketing persona restriction, realtor commission validation). Added helpers (dotPaths.ts, normalize.ts), fixture (canonicalInputs.fixture.ts). 241 tests, 15 suites, build passing.
- 2026-02-22: Sprint 10 Distribution Hardening — Replaced all relative compute imports with canonical @fractpath/compute. Added file:./packages/compute dependency. Restored prebuild script. Un-gitignored dist/ and dist-types/ for git-tag install.

## External Dependencies
- **@fractpath/compute**: Version 10.2.0, located at `packages/compute/`, serves as the canonical financial computation library. It's a pure-functional module, free from external dependencies like databases or network calls.
