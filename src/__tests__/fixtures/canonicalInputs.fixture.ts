import type { DealTerms, ScenarioAssumptions } from "../compute.js";
import type { DraftCanonicalInputs } from "../../widget/editing/types.js";

export const FIXTURE_DEAL_TERMS: DealTerms = {
  property_value: 750_000,
  upfront_payment: 80_000,
  monthly_payment: 500,
  number_of_payments: 36,
  minimum_hold_years: 2,
  contract_maturity_years: 20,

  target_exit_year: 7,
  target_exit_window_start_year: 6,
  target_exit_window_end_year: 8,
  long_stop_year: 15,

  first_extension_start_year: 8,
  first_extension_end_year: 11,
  first_extension_premium_pct: 0.05,

  second_extension_start_year: 11,
  second_extension_end_year: 15,
  second_extension_premium_pct: 0.08,

  partial_buyout_allowed: false,
  partial_buyout_min_fraction: 0.25,
  partial_buyout_increment_fraction: 0.25,

  buyer_purchase_option_enabled: false,
  buyer_purchase_notice_days: 90,
  buyer_purchase_closing_days: 60,

  setup_fee_pct: 0.02,
  setup_fee_floor: 1_000,
  setup_fee_cap: 5_000,
  servicing_fee_monthly: 49,
  payment_admin_fee: 5,
  exit_admin_fee_amount: 500,

  realtor_representation_mode: "NONE",
  realtor_commission_pct: 0,
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
