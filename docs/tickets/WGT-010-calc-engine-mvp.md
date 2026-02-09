TICKET WGT-010 — Deterministic calculator engine (MVP)

Objective
Implement the FractPath marketing scenario math as a deterministic engine.

Source specs
- fractpath-marketing/docs/marketing-homepage-spec.md (Calculator Logic Requirements)
- fractpath-marketing/docs/tickets/MKT-005-calculator-logic-charts.md

Non-goals
- No HubSpot/network calls
- No persistence
- No auth

Deliverables
- shared/calc/types.ts (ScenarioInputs/ScenarioOutputs)
- shared/calc/constants.ts (defaults: g, TF_early/late, FM, CM, CPW start/end)
- shared/calc/calc.ts computeScenario(inputs): outputs

Acceptance Criteria
- Computes time series vesting (upfront + monthly)
- Standard/Early/Late settlement outputs
- TF applies to payout amount (not FMV)
- Floor/cap applied: floor=IBA*FM, cap=IBA*CM
- Deterministic, no randomness
