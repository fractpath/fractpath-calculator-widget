import type { DealTerms, ScenarioAssumptions } from "../compute.js";
import type { DraftCanonicalInputs } from "../../widget/editing/types.js";

export const FIXTURE_DEAL_TERMS: DealTerms = {
  property_value: 750_000,
  upfront_payment: 80_000,
  monthly_payment: 500,
  number_of_payments: 36,
  payback_window_start_year: 3,
  payback_window_end_year: 8,
  timing_factor_early: 0.95,
  timing_factor_late: 1.05,
  floor_multiple: 1.0,
  ceiling_multiple: 2.5,
  downside_mode: "HARD_FLOOR",
  contract_maturity_years: 20,
  liquidity_trigger_year: 10,
  minimum_hold_years: 2,
  platform_fee: 2500,
  servicing_fee_monthly: 49,
  exit_fee_pct: 0.01,
  duration_yield_floor_enabled: false,
  duration_yield_floor_start_year: null,
  duration_yield_floor_min_multiple: null,
  realtor_representation_mode: "NONE",
  realtor_commission_pct: 0,
  realtor_commission_payment_mode: "PER_PAYMENT_EVENT",
};

export const FIXTURE_ASSUMPTIONS: ScenarioAssumptions = {
  annual_appreciation: 0.04,
  closing_cost_pct: 0.02,
  exit_year: 7,
};

export const FIXTURE_DRAFT: DraftCanonicalInputs = {
  deal_terms: FIXTURE_DEAL_TERMS,
  scenario: FIXTURE_ASSUMPTIONS,
};
