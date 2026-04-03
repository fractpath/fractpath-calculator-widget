import type { DraftCanonicalInputs } from "./types.js";
import { FEE_DEFAULTS } from "./feeDefaults.js";

export function getDefaultDraftCanonicalInputs(): DraftCanonicalInputs {
  return {
    deal_terms: {
      property_value: 600_000,
      upfront_payment: 50_000,
      monthly_payment: 0,
      number_of_payments: 0,
      minimum_hold_years: 3,
      contract_maturity_years: 30,

      target_exit_year: 7,
      target_exit_window_start_year: 6,
      target_exit_window_end_year: 8,
      long_stop_year: 15,

      first_extension_start_year: 8,
      first_extension_end_year: 11,
      first_extension_premium_pct: FEE_DEFAULTS.first_extension_premium_pct,

      second_extension_start_year: 11,
      second_extension_end_year: 15,
      second_extension_premium_pct: FEE_DEFAULTS.second_extension_premium_pct,

      partial_buyout_allowed: false,
      partial_buyout_min_fraction: 0.25,
      partial_buyout_increment_fraction: 0.25,

      buyer_purchase_option_enabled: false,
      buyer_purchase_notice_days: 90,
      buyer_purchase_closing_days: 60,

      setup_fee_pct: FEE_DEFAULTS.setup_fee_pct,
      setup_fee_floor: FEE_DEFAULTS.setup_fee_floor,
      setup_fee_cap: FEE_DEFAULTS.setup_fee_cap,
      servicing_fee_monthly: FEE_DEFAULTS.servicing_fee_monthly,
      payment_admin_fee: FEE_DEFAULTS.payment_admin_fee,
      exit_admin_fee_amount: FEE_DEFAULTS.exit_admin_fee_amount,

      realtor_representation_mode: "NONE",
      realtor_commission_pct: 0,
    },
    scenario: {
      annual_appreciation: 0.04,
      closing_cost_pct: 0.02,
      exit_year: 7,
    },
  };
}
