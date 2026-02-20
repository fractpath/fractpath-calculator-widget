# Changelog

## 1.0.0 (2026-02-20)

Sprint 11 finalization — first deployment-ready release.

### Export Surface (WGT-005)
- `FractPathCalculatorWidget` — canonical embeddable widget component
- `DealSnapshotView` — read-only deal snapshot viewer
- `DealEditModal` — wizard-style deal editor
- `DealKpiStrip`, `EquityTransferChart` — optional subcomponents
- `resolvePersonaPresentation` — persona-aware hero/strip/chart/bullet resolver
- `MARKETING_PERSONAS` — allowed personas for marketing embed (`buyer`, `homeowner`, `realtor`)
- `getLabel`, `getSummaryOrder`, `getPersonaConfig` — persona translation helpers
- `FEE_DEFAULTS` — canonical fee defaults
- `useKioskInput` — kiosk/custom input behavior hook
- `buildDraftSnapshot`, `buildShareSummary`, `buildSavePayload`, `buildFullDealSnapshotV1` — snapshot builders
- `deterministicHash` — SHA-256 hashing utility
- `computeScenario`, `normalizeInputs`, `buildChartSeries`, `EquityChart` — legacy calc/chart (backward compat)
- All public types: `CalculatorPersona`, `CalculatorMode`, `DevAuthRole`, `FullDealSnapshotV1`, `DraftSnapshot`, `ShareSummary`, `SavePayload`, `WidgetEvent`, `FractPathCalculatorWidgetProps`, `DraftCanonicalInputs`, persona presentation types, calc types

### Canonical Compute
- `@fractpath/compute` v10.2.0 — single source of financial truth (no changes in this release)
- `CONTRACT_VERSION` = "10.2.0", `SCHEMA_VERSION` = "1"

### Persona Presentation (WGT-UX-012)
- Persona-accurate hero metrics: buyer→investor_profit, homeowner→invested_capital_total, realtor→realtor_fee_total_projected
- Summary strip chips with derived tokens (implied_equity_share_pct, remaining_opportunity_value)
- SimpleBarChart SVG component for persona-specific bar charts
- App mode: read-only deal-term chips, Edit button gated by canEdit prop
- DEV_AUTH override (dev-only): ?devAuth=editor|viewer|loggedOut

### Marketing Embed
- Marketing personas restricted to buyer/homeowner/realtor (ops/investor excluded)
- Marketing-lite calls computeDeal directly from UI state (no split-brain)

### Tests
- 212 tests across 12 suites, all passing
