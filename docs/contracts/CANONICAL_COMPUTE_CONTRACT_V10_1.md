FractPath Canonical Compute Contract
Version 10.1.0 (DYF Override + Fee Base + Exit Rounding Locked)

Purpose:
Eliminate compute drift across widget, app, and marketing repos by defining a single, deterministic, versioned compute contract.

This document supersedes previous chat-derived summaries.
Replit agents must reference this file when implementing compute logic.

0) Non-Negotiables

Canonical inputs + outputs use snake_case only.

No new fields may be added without:

Updating this document

Updating TypeScript types

Updating validators

Updating golden tests

No silent recompute if canonical snapshot validates.

All math must be deterministic and reproducible.

1) Canonical Inputs
1A) DealTerms (Binding Once Approved)
export type DownsideMode = "HARD_FLOOR" | "NO_FLOOR";

export interface DealTerms {
  // Property + payments
  property_value: number;          // USD at contract start
  upfront_payment: number;         // USD at month 0
  monthly_payment: number;         // USD per month
  number_of_payments: number;      // total scheduled months

  // Payback windows
  payback_window_start_year: number;
  payback_window_end_year: number;
  timing_factor_early: number;
  timing_factor_late: number;

  // Return bounds
  floor_multiple: number;
  ceiling_multiple: number;
  downside_mode: DownsideMode;

  // Duration governance
  contract_maturity_years: number;
  liquidity_trigger_year: number;
  minimum_hold_years: number;

  // Fees (LOCKED UNITS)
  platform_fee: number;            // flat USD
  servicing_fee_monthly: number;   // USD per month
  exit_fee_pct: number;            // % of projected FMV

  // Duration Yield Floor (DYF)
  duration_yield_floor_enabled?: boolean;
  duration_yield_floor_start_year?: number | null;
  duration_yield_floor_min_multiple?: number | null;
}

1B) ScenarioAssumptions (Editable What-If Inputs)
export interface ScenarioAssumptions {
  annual_appreciation: number;   // e.g. 0.04
  closing_cost_pct: number;      // % of FMV at exit
  exit_year: number;             // fractional allowed
  fmv_override?: number | null;
}

2) Canonical Outputs
export interface DealResults {
  // Core economics
  invested_capital_total: number;
  vested_equity_percentage: number;
  projected_fmv: number;
  base_equity_value: number;

  gain_above_capital: number;
  timing_factor_applied: number;

  isa_pre_floor_cap: number;

  floor_amount: number;
  ceiling_amount: number;

  isa_standard_pre_dyf: number;

  dyf_floor_amount: number | null;
  dyf_applied: boolean;

  isa_settlement: number;

  // Investor economics
  investor_profit: number;
  investor_multiple: number;
  investor_irr_annual: number;

  compute_version: string;
}

3) Deterministic Compute Rules
Step 0 — Exit Month Rule (LOCKED)
exit_month = floor(exit_year * 12)
payments_made_by_exit = min(number_of_payments, exit_month)


Settlement occurs at month = exit_month.

Step 1 — Invested Capital (IBA)
invested_capital_total =
  upfront_payment +
  (monthly_payment * payments_made_by_exit)

Step 2 — Equity Vesting (DCA Model)

Upfront equity:

equity_upfront = upfront_payment / property_value


For each paid month m:

property_value_m =
  property_value * (1 + annual_appreciation)^(m / 12)

equity_m = monthly_payment / property_value_m


Total vested:

vested_equity_percentage =
  equity_upfront + Σ equity_m

Step 3 — FMV at Exit

If override exists:

projected_fmv = fmv_override


Else:

projected_fmv =
  property_value * (1 + annual_appreciation)^exit_year

Step 4 — Base Equity Value
base_equity_value =
  projected_fmv * vested_equity_percentage

Step 5 — Gain Above Capital
gain_above_capital =
  base_equity_value - invested_capital_total

Step 6 — Timing Factor (Gain Only)
timing_factor_applied =
  timing_factor_early if exit_year < payback_window_start_year
  timing_factor_late  if exit_year > payback_window_end_year
  1 otherwise

Step 7 — Pre Floor/Cap Settlement

Timing factor applies only to gain:

isa_pre_floor_cap =
  invested_capital_total +
  (gain_above_capital * timing_factor_applied)

Step 8 — Apply Downside Mode + Ceiling
floor_amount =
  invested_capital_total * floor_multiple

ceiling_amount =
  invested_capital_total * ceiling_multiple


If HARD_FLOOR:

isa_standard_pre_dyf =
  clamp(isa_pre_floor_cap, floor_amount, ceiling_amount)


If NO_FLOOR:

isa_standard_pre_dyf =
  min(isa_pre_floor_cap, ceiling_amount)

4) Duration Yield Floor (DYF)
LOCKED DECISION:

DYF may override the ceiling cap.

DYF activates if:

duration_yield_floor_enabled
AND exit_year >= duration_yield_floor_start_year


Compute:

dyf_floor_amount =
  invested_capital_total * duration_yield_floor_min_multiple


Final settlement:

isa_settlement =
  max(isa_standard_pre_dyf, dyf_floor_amount)


If DYF not active:

isa_settlement = isa_standard_pre_dyf

DYF Invariants

If dyf_applied = false:

isa_settlement <= ceiling_amount


If dyf_applied = true:

isa_settlement >= dyf_floor_amount


Settlement may exceed ceiling_amount when DYF applies.

5) Investor Economics
investor_profit =
  isa_settlement - invested_capital_total

investor_multiple =
  isa_settlement / invested_capital_total

IRR Calculation (Deterministic)

Cashflows:

Month 0: -upfront_payment
Month 1..payments_made_by_exit: -monthly_payment
Month exit_month: +isa_settlement


Solve monthly IRR (deterministic root method).

Annualize:

investor_irr_annual =
  (1 + irr_monthly)^12 - 1

6) Fee Model (LOCKED UNITS)
Platform Fee
platform_fee = flat USD

Exit Fee
exit_fee_amount =
  projected_fmv * exit_fee_pct

Servicing Fee
servicing_total =
  servicing_fee_monthly * payments_made_by_exit

Fee Policy

Fees must NOT be silently deducted from isa_settlement.

Recommended:

Model fees as additional cashflows.

Present "net to investor" and "net to homeowner" views separately.

Keep canonical isa_settlement independent of fee deductions.

7) Canonical Snapshot Structure

Persist immutably:

{
  "compute_version": "10.1.0",
  "inputs": {
    "deal_terms": { ... },
    "scenario": { ... }
  },
  "outputs": {
    "results": { ... }
  },
  "computed_at": "ISO-8601"
}

8) Required Drift Guards

All repos must enforce:

Snake_case validation.

Finite numeric outputs.

Deterministic golden test fixture.

Invariant tests:

HARD_FLOOR never below floor_amount.

Standard mode never above ceiling_amount.

DYF override behavior.

investor_multiple correctness.

IRR reproducibility.

No legacy compute imports in app/marketing after migration.

9) Explicitly Out of Scope (Not Part of Compute)

Default remedies

Lien mechanics

Breach logic

State machine transitions

Legal enforcement

Dispute resolution

These belong to workflow/legal layer, not compute kernel.

10) Versioning Policy

Any change to:

settlement formula

fee base

DYF behavior

exit rounding

timing factor semantics

Requires:

compute_version bump

updated golden tests

update to this document

This Document Is The Canonical Compute Authority

All agents implementing compute must reference:

docs/contracts/CANONICAL_COMPUTE_CONTRACT_V10_1.md


No chat memory supersedes this file.
