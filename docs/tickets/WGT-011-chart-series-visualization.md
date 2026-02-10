# WGT-011 — Chart series + visualization (engine-to-chart transform + minimal render)

## Objective
Generate **chart-ready series** from the deterministic calculator engine outputs (WGT-010) and render a minimal,
investor-presentable chart surface:

- Equity ownership over time (primary)
- Exit summary representation (Early / Standard / Late) as markers/tooltips/secondary series

This ticket must **not introduce any new math** beyond formatting and transforming existing computed outputs.

---

## Dependencies
- WGT-010 — Deterministic calculator engine (ScenarioInputsV1/ScenarioOutputsV1)
- WGT-031 — Marketing Basic Results allowlist (ensure marketing mode only renders allowed chart data)

---

## Non-goals
- No new math formulas
- No changes to computeScenarioV1 logic
- No persistence
- No networking
- No design-system refactors beyond adding a minimal chart component

---

## Deliverables

### 1) Chart series builder
Create:
- `shared/calc/chart.ts`

Export:
- `buildChartSeriesV1(inputs: ScenarioInputsV1, outputs: ScenarioOutputsV1): ScenarioChartSeriesV1`

Where `ScenarioChartSeriesV1` includes only **derived series** required for rendering:

Required series:
- `equityOverTime`
  - array of points: `{ monthIndex, monthLabel, buyerEquityPct, homeownerEquityPct }`
- `fmvOverTime` (optional, but recommended if already in outputs)
  - array: `{ monthIndex, estimatedFmv }`

Exit summary representation (required):
- `exitMarkers`
  - `{ scenario: "early" | "standard" | "late", exitMonthIndex, buyerPayout, homeownerNet, floorApplied, capApplied }`

Rules:
- No recalculation of settlement amounts; use outputs’ scenario values
- Any “exitMonthIndex” must be derived from existing input horizon/CPW windows (index math only)
- Provide stable ordering and consistent labels

### 2) Minimal chart component
Create:
- `client/components/EquityChart.tsx` (or equivalent location in widget repo)

Requirements:
- Render equity ownership over time using the series from `buildChartSeriesV1`
- Include a minimal legend:
  - Buyer equity
  - Homeowner equity
- Render exit summary representation:
  - marker(s) on the time axis OR
  - tooltip rows when hovering OR
  - secondary series points (choose simplest with your chart lib)

Implementation constraints:
- Use the project’s existing chart library if present
- If none, use **Recharts** (preferred for Next/shadcn ecosystems)
- Must render with defaults (no runtime errors)

---

## Acceptance Criteria
- `buildChartSeriesV1` exists and produces chart-ready data from inputs+outputs
- Chart renders with default inputs (local dev) without errors
- Equity ownership over time is visible and readable
- Exit summary representation is present (marker/tooltip/secondary series)
- No new math is introduced (transform only)
- Marketing mode can safely render the chart without exposing non-allowed fields

---

## QA Checklist
- Equity % series stays within [0, 100]
- Buyer + Homeowner equity sums to 100 at each point (within rounding tolerance)
- Exit markers align to expected months/years
- Chart handles small screens without breaking layout
