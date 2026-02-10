# WGT-010 — Deterministic calculator engine (MVP, widget-owned)

## Objective
Implement the FractPath calculator math as a **pure, deterministic engine** that produces:
- marketing-safe “Basic Results” (WGT-031)
- full-fidelity outputs for the app (WGT-030)

This engine is the **only** source of truth for numeric outputs across repos.

---

## Canonical References (Treat as Truth)
- fractpath-marketing/docs/marketing-homepage-spec.md (Calculator Logic Requirements)
- fractpath-marketing/docs/tickets/MKT-005-calculator-logic-charts.md
- WGT-031 (Basic Results allowlist + gating rules)
- WGT-040 (DraftSnapshot schema + determinism guarantees)
- WGT-050 (contract versioning, no silent mutation)

---

## Non-goals
- No HubSpot or other network calls
- No persistence
- No authentication
- No UI work in this ticket
- No ROI/IRR/APR computation for marketing (outputs may exist internally, but must not be displayed in marketing mode)

---

## Deliverables (Code)
Create a minimal, testable engine module:

1) `shared/calc/types.ts`
- `ScenarioInputsV1`
- `ScenarioOutputsV1`
- `ScenarioSeriesV1` (time series arrays for charts)
- `ScenarioAssumptionsV1` (defaults + identifiers)

2) `shared/calc/constants.ts`
- defaults + assumption set identifier:
  - appreciation `g` (annual)
  - timing factors `TF_early`, `TF_late`
  - floor multiplier `FM`
  - ceiling multiplier `CM`
  - contribution window `CPW_start_year`, `CPW_end_year`
  - any other fixed defaults used by calc
- export `ASSUMPTIONS_VERSION = "v1"` (string)

3) `shared/calc/calc.ts`
- `computeScenarioV1(inputs: ScenarioInputsV1): ScenarioOutputsV1`
- must be pure and deterministic

4) Tests + fixtures (required)
- `shared/calc/__tests__/calc.test.ts`
- golden fixtures with known inputs → exact outputs
- ensure stable rounding and ordering

---

## Required Engine Behaviors (MVP)

### A) Determinism
- No randomness
- No time-based branching
- No network
- Same inputs + same assumptions → identical outputs

### B) Time series vesting (upfront + monthly)
Inputs must support:
- property value basis / starting value (SV)
- upfront contribution
- monthly contribution
- monthly count (or horizon years -> months)
- persona context is NOT math-affecting (copy framing only; math identical)

Engine must compute:
- cumulative capital contributed over time (IBA / contributed-to-date)
- vested equity % over time (simple proportional model per current spec)
- remaining homeowner equity % over time
- produce a series suitable for charts

### C) Property value growth (estimate)
- FMV(t) uses starting value * appreciation assumption
- Growth is applied only to estimated FMV, not timing factor

### D) Settlement scenarios (Early / Standard / Late)
Compute three scenario outcomes:
- Early settlement
- Standard settlement
- Late settlement

Rules:
- **FMV is the same** for all three scenarios at a given evaluation time
- **Timing Factor applies to payout amount, not FMV**

### E) Floor / Cap application (explicit)
Apply floor and cap to payout bounds using:
- `floor = IBA * FM`
- `cap = IBA * CM`

Outputs must explicitly include:
- raw payout (pre-floor/cap)
- floor-adjusted payout
- cap-adjusted payout
- flags: `floorApplied`, `capApplied`

---

## Output Shape Requirements (to support downstream tickets)

### Outputs must include:
- headline values (marketing-safe candidates)
- scenario table values (Early/Standard/Late)
- chart series arrays (months, fmv, equity split, etc.)
- assumptions/meta block:
  - `assumptionsVersion`
  - `engineVersion` (package version or constant)
  - `inputsHash` (optional now; required by WGT-040 when emitting DraftSnapshot)

### Marketing-safe allowlist alignment
Ensure outputs can be trivially mapped to WGT-031 Basic Results:
- estimated_cash_unlocked (or equivalent)
- estimated_equity_fraction_sold (or equivalent)
- estimated_home_value_used_for_calculation
- estimated_future_value_range
- estimated_cost_of_capital_range (if computed; otherwise omit and keep marketing output consistent with WGT-031 list)

If a field is not marketing-allowed, it still may exist in full outputs, but must not be displayed in marketing mode.

---

## Acceptance Criteria
- Engine computes time series vesting (upfront + monthly)
- Engine computes Early/Standard/Late settlement outputs
- Timing factor modifies payout amount (not FMV)
- Floor/cap applied exactly:
  - floor = IBA * FM
  - cap = IBA * CM
- Outputs are deterministic and stable under tests
- No external calls, no persistence, no auth

---

## Notes / Guardrails
- Keep math minimal and reversible (no speculative refactors)
- Prefer explicit units (cents vs dollars, months vs years)
- Define rounding rules once and test them (avoid float drift)
- Persona influences UI framing only (engine ignores persona for numeric outputs)
