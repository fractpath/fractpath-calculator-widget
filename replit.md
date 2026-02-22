# FractPath Calculator Widget

## Overview
A React-based embeddable widget (ES module) for the FractPath Scenario Tool. It supports persona-based views (buyer, homeowner, investor, realtor, ops) with two modes (marketing/app), controlled calculator inputs, and structured payload emissions (DraftSnapshot, ShareSummary, SavePayload). Designed to be embedded in external sites.

## Project Architecture
- **Framework**: React 19 + TypeScript + Vite 7
- **Testing**: Vitest
- **Build output**: ES module (`dist/index.js`) for library consumption
- **Dev entry**: `index.html` → `src/main.tsx` (dev harness with persona/mode switcher, harness panels gated behind DEV_HARNESS=true)
- **Lib entry**: `src/lib/index.ts` (public exports for consumers)
- **Widget**: `src/widget/` (FractPathCalculatorWidget, wired calculator, persona config, formatting, snapshot builders, hashing)
- **Calc engine (widget)**: `src/calc/` (computeScenario, buildChartSeries, types, constants)
- **Canonical compute**: `packages/compute/` (@fractpath/compute v10.2.0 — single source of financial truth)
- **Modal components**: `src/widget/components/` (DealEditModal, KioskSelect, PreviewPanel, HelpTooltip — WGT-003)
- **Snapshot view**: `src/widget/components/` (DealSnapshotView, DealKpiStrip, EquityTransferChart — WGT-004)
- **Components**: `src/components/EquityChart.tsx` (SVG line chart)
- **Contract docs**: `docs/architecture/integration-contract.md`
- **Sprint 10 specs**: `docs/financial-core/` (compute spec, runbook, integration specs)
- **Editing layer**: `src/widget/editing/` (WGT-001 unified draft state, Tier 1 preview, blur compute, validation)
- **Field registry**: `src/widget/editing/fieldMeta.ts` (WGT-002 — 27-entry metadata registry with tooltips, anchors, ranges, dynamic percent anchors)
- **Tab config**: `src/widget/editing/tabConfig.ts` (WGT-002 — 5 tabs: payments, ownership, assumptions, protections, fees)
- **Dev harness**: `src/widget/dev/DraftStateHarness.tsx` (WGT-001) + `FieldMetaHarness.tsx` (WGT-002) + `EditModalHarness.tsx` (WGT-003)
- **Persona presentation**: `src/widget/personaPresentation.ts` (central resolver for hero/strip/chart/bullets per persona — ZERO compute, type-only imports)
- **SimpleBarChart**: `src/widget/components/SimpleBarChart.tsx` (SVG bar chart for persona charts)
- **Tests**: `src/__tests__/` (widget tests) + `src/widget/editing/__tests__/` (editing tests) + `packages/compute/tests/` (compute module tests) — 212 tests total across 12 suites

## Key Files
- `vite.config.ts` - Vite config with ES lib build and dev server (port 5000)
- `src/lib/index.ts` - Public API exports (keep stable)
- `src/widget/wired.tsx` - Calculator UI with mode-gated outputs and CTAs
- `src/widget/types.ts` - All widget types (DraftSnapshot, ShareSummary, SavePayload, CalculatorMode, CalculatorPersona, WidgetEvent, etc.) + version constants
- `src/widget/hash.ts` - Deterministic SHA-256 hashing utility
- `src/widget/snapshot.ts` - Builders for DraftSnapshot, ShareSummary, SavePayload
- `src/widget/persona.ts` - Persona config (hero label, hero value selector, helper text)
- `src/widget/format.ts` - Formatting helpers (currency, percent, month)
- `src/widget/editing/feeDefaults.ts` - Single-source fee defaults (platform_fee, servicing_fee_monthly, exit_fee_pct)
- `src/widget/hooks/useKioskInput.ts` - Unified kiosk/custom input behavior hook
- `src/calc/calc.ts` - Deterministic calc engine (computeScenario)
- `src/calc/constants.ts` - DEFAULT_INPUTS and default rates
- `src/main.tsx` - Dev harness entry point
- `docs/architecture/integration-contract.md` - Integration contract (WGT-INT-001)
- `src/widget/editing/defaults.ts` - Default draft canonical inputs (incl. realtor defaults)
- `src/widget/editing/validateDraft.ts` - Draft validation rules (incl. realtor commission constraints)

## Widget Modes
- **marketing**: Shows Basic Results only (hero metric + settlement timing/net payout). Has "Save & Continue" (emits DraftSnapshot) and "Share" (emits ShareSummary) CTAs. No chart, no detailed fields.
- **app**: Full analysis with all outputs (raw payout, transfer fees, clamp details, equity chart). Has "Save" CTA (emits SavePayload with full ScenarioInputs/Outputs).

## Versioning
- `COMPUTE_VERSION`: "10.2.0" — canonical compute module version (packages/compute/src/version.ts)
- `CONTRACT_VERSION`: "10.2.0" — integration contract version (src/widget/types.ts)
- `SCHEMA_VERSION`: "1" — payload schema version for DraftSnapshot/ShareSummary/SavePayload (src/widget/types.ts)
- All version constants are single-source-of-truth; no inline literals allowed

## Development
- Dev server runs on port 5000 via `npm run dev`
- Build with `npm run build` → outputs to `dist/`
- Test with `npm test` → runs vitest (212 tests across 12 suites)
- Test compute only: `cd packages/compute && npm test` (78 tests across 3 suites)
- TypeScript build uses `tsconfig.build.json` for declarations

## @fractpath/compute (Sprint 10 AGENT-001)
- **Location**: `packages/compute/`
- **Version**: 10.2.0 (COMPUTE_VERSION)
- **Entry**: `computeDeal(terms: DealTerms, assumptions: ScenarioAssumptions): DealResults`
- **Pure functions only**: no DB, no network, no env vars, deterministic
- **Key files**:
  - `src/types.ts` — DealTerms, ScenarioAssumptions, DealResults
  - `src/computeDeal.ts` — all 11 financial steps per sprint-10-compute-spec
  - `src/irr.ts` — Newton-Raphson monthly IRR solver with bisection fallback
  - `src/rounding.ts` — roundMoney(2dp), roundIRRMonthly(6dp), roundIRRAnnual(4dp)
  - `src/version.ts` — COMPUTE_VERSION = "10.2.0"
- **Tests**: 72 tests covering standard/early/late/ceiling/floor/NO_FLOOR/zero-appreciation/FMV-override/determinism + IRR + rounding + DYF scenarios

## Recent Changes
- 2026-02-22: Sprint 10 Distribution Hardening — Replaced all relative compute imports (../packages/compute/src/index.js) with canonical @fractpath/compute. Added file:./packages/compute dependency (no workspace: protocol). Restored prebuild script. Fixed useDealDraftState.ts template literal type syntax. Un-gitignored dist/ and dist-types/ for git-tag install. All Sprint 10 checkpoints pass: zero workspace refs, zero relative imports, clean build, dist exists, single compute copy, no duplicate math. 212 tests, 12 suites, build passing.
- 2026-02-20: WGT-UX-012 — Persona-accurate hero metrics, summary strips, simple bar charts, and tokenized marketing bullets. (1) New personaPresentation.ts central resolver (ZERO compute, type-only imports) maps buyer→investor_profit hero, homeowner→invested_capital_total hero, realtor→realtor_fee_total_projected hero. (2) Persona-specific summary strip chips with derived tokens (implied_equity_share_pct, remaining_opportunity_value). (3) SimpleBarChart SVG component for persona-specific bar charts. (4) App mode layout: hides input panel, shows read-only deal-term chips, Edit button when canEdit=true. (5) DEV_AUTH override via ?devAuth=editor|viewer|loggedOut query param or VITE_DEV_AUTH env (dev-only, guarded). (6) DevAuthRole type and canEdit prop added to FractPathCalculatorWidgetProps. (7) 29 new tests covering hero selection, strip chips, token integrity, no-compute import guard, chart spec, bullet content, and DEV_AUTH gating (212 total, 12 suites). Build passing.
- 2026-02-20: WGT-SPLIT-BRAIN — Fixed marketing-lite split-brain where computeScenario derived monthly_payment from vesting constants instead of user input. Marketing-lite now calls computeDeal directly with buildMarketingDealTerms/buildMarketingAssumptions from explicit UI state (propertyValue, upfrontPayment, monthlyPayment, numberOfPayments, exitYear, growthRate, realtorMode/Pct). Eliminated stale defaults bug (upfront=0 producing ~209k). Marketing personas restricted to buyer/homeowner/realtor (ops/investor gated to DEV_HARNESS). Callback handlers emit proper DraftSnapshot/ShareSummary types. 23 new tests (183 total, 11 suites). Build passing.
- 2026-02-20: WGT-UX-011b — Content-layer bullets. (1) Marketing lite: 3-4 persona-framed bullets under settlement projection derived from existing outputs (netPayout, investment, term, growth rate). Persona controls wording (buyer "paid"/homeowner "received"/realtor "commission framing"), never values. (2) Edit modal: per-tab "What this means" explainer block under PreviewPanel — Payments (upfront + installments), Ownership (contract term + earliest settlement), Protections (floor/cap availability), Assumptions (growth/exit disclaimers), Fees (platform + servicing + exit descriptions). All content from contentBullets.ts. No compute, schema, or canonical changes. 160 tests, 10 suites, build passing.
- 2026-02-20: WGT-UX-011 — Marketing lite + persona translation + UX fixes. (1) Dev harness gated behind VITE_DEV_HARNESS=true or ?DEV_HARNESS=true query param. (2) Centralized fee defaults (platform_fee=2500, servicing_fee_monthly=49, exit_fee_pct=1%) in feeDefaults.ts, wired into defaults.ts + snapshot.ts. (3) Persona translation layer: getLabel(fieldId, persona) for persona-specific input labels, getSummaryOrder(persona) for summary ordering. (4) Marketing lite: standard scenario only, growth rate as read-only assumption text, no floor/ceiling/downside controls, disclosure block with CTA to register. (5) Realtor inputs (representation mode + commission %) in marketing widget. (6) Fee defaults displayed read-only in marketing view. (7) useKioskInput hook for unified kiosk/custom/slider behavior. (8) Modal fixes: portal-rendered tooltips (no clipping), stable modal height, shimmer loading indicator in PreviewPanel, underline tab style. No canonical drift — compute engine, payload shapes, and canonical keys unchanged. 160 tests, 10 suites, build passing.
- 2026-02-20: v10.2 Contract Alignment — Realtor commission compute per canonical contract. DealTerms realtor fields now required (not optional). DealResults expanded with timing_factor_applied, isa_standard_pre_dyf, 5 realtor fee fields (total/upfront/installments + buyer/seller attribution). dyf_floor_amount changed to number|null. computeDeal implements Section 6C commission totals + Section 6D equity-weighted attribution per payment event with PER_PAYMENT_EVENT guard. DealSnapshotView uses canonical fee outputs. 18 new realtor commission tests incl. explicit numeric attribution verification (160 total, 10 suites). Build passing.
- 2026-02-20: WGT-004 — Read-only Deal Snapshot View. Added DealSnapshotView (header + status badge + 5 detail tabs), DealKpiStrip (6 horizontal KPI cards), EquityTransferChart (placeholder — compute v10.2 has no schedule series). All values from canonical compute outputs, no duplicate math. Conditional DYF/FMV/realtor rendering. SnapshotViewHarness dev component. (142 tests, build passing)
- 2026-02-20: WGT-003 — Deal Edit Modal (Wizard + Kiosk Inputs). Added DealEditModal, KioskSelect, PreviewPanel, HelpTooltip components. Metadata-driven rendering of all 27 fields via TAB_CONFIG + FIELD_META. Realtor coupling: NONE forces commission=0 and disables control. Percent fields convert display→decimal on blur. Compute triggers on blur/anchor/enum. Save disabled for realtor persona. EditModalHarness dev component. (142 tests, build passing)
- 2026-02-20: WGT-000 — Aligned widget draft + field registry to canonical compute v10.2.0. Added 3 realtor fields (representation_mode, commission_pct, payment_mode) and investor_irr_annual_net (null) to DealTerms/DealResults. Expanded field registry from 19→27 entries (3 realtor + servicing_fee_monthly + liquidity_trigger_year + 3 DYF). Added realtor commission validation (0-6%, 0% when NONE). Updated snapshot mapper with realtor defaults. Tab config: 5 tabs with DYF section under Protections, Realtor section under Fees. 4 new validation tests (142 total, 10 suites). Build passing.
- 2026-02-20: Phase 1 — Widget emits canonical FullDealSnapshotV1 with 10.2 versions. FullDealSnapshotV1 type now uses canonical DealTerms/ScenarioAssumptions/DealResults from @fractpath/compute. Added mapWidgetInputsToDealTerms (with documented defaults), mapWidgetInputsToAssumptions, buildFullDealSnapshotV1 to snapshot.ts. wired.tsx handleSave emits FullDealSnapshotV1 via computeDeal. now_iso + created_at required. Exported from lib/index.ts. (138 tests, build + pack passing)
- 2026-02-20: Phase 0 version unification — COMPUTE_VERSION → 10.2.0, CONTRACT_VERSION → 10.2.0, SCHEMA_VERSION → "1", eliminated all inline version literals, package.json aligned (138 tests passing)
- 2026-02-19: WGT-002 — Field metadata registry (19 entries with tooltips/anchors/ranges) + tab config (5 tabs) + FieldMetaHarness + 12 drift guard tests (138 total)
- 2026-02-19: WGT-001 — Unified canonical draft state layer: DraftCanonicalInputs (deal_terms + scenario), Tier 1 preview (upfrontCash, installmentsLabel, totalInstallments, totalCashPaid), blur-triggered preview compute via @fractpath/compute, MVP validation, useDealDraftState hook, DraftStateHarness dev component, 21 new tests (8 deriveTier1Preview + 13 validateDraft)
- 2026-02-13: Sprint 10 AGENT-010 — Duration Yield Floor (DYF) feature: 3 optional DealTerms fields, 2 DealResults fields, applyDurationYieldFloor after standard clamp, 16 new tests (72 compute total, 102 repo total)
- 2026-02-12: Sprint 10 AGENT-001 — Canonical compute module (@fractpath/compute) with DealTerms/ScenarioAssumptions/DealResults, computeDeal(), IRR solver, rounding, 56 tests
- 2026-02-09: Sprint 5 implementation — marketing/app modes, DraftSnapshot, ShareSummary, SavePayload, deterministic hashing, mode-gated UI, integration contract doc, 30 vitest tests
- 2026-02-06: Implemented WGT-030 Calculator UI shell (controlled inputs, outputs panel, settlement rows, persona-driven hero, equity chart)
- 2026-02-06: Configured Vite dev server for Replit (port 5000, host 0.0.0.0, allowedHosts: true)
