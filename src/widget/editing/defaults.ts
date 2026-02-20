import type { DraftCanonicalInputs } from "./types.js";
import { FEE_DEFAULTS } from "./feeDefaults.js";

export function getDefaultDraftCanonicalInputs(): DraftCanonicalInputs {
  return {
    deal_terms: {
      property_value: 600_000,
      upfront_payment: 50_000,
      monthly_payment: 0,
      number_of_payments: 0,
      payback_window_start_year: 5,
      payback_window_end_year: 10,
      timing_factor_early: 0.8,
      timing_factor_late: 1.0,
      floor_multiple: 1.0,
      ceiling_multiple: 3.25,
      downside_mode: "HARD_FLOOR",
      contract_maturity_years: 30,
      liquidity_trigger_year: 15,
      minimum_hold_years: 3,
      platform_fee: FEE_DEFAULTS.platform_fee,
      servicing_fee_monthly: FEE_DEFAULTS.servicing_fee_monthly,
      exit_fee_pct: FEE_DEFAULTS.exit_fee_pct,
      realtor_representation_mode: "NONE",
      realtor_commission_pct: 0,
      realtor_commission_payment_mode: "PER_PAYMENT_EVENT",
    },
    scenario: {
      annual_appreciation: 0.03,
      closing_cost_pct: 0.02,
      exit_year: 7,
    },
  };
}
