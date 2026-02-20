export type DownsideMode = "HARD_FLOOR" | "NO_FLOOR";
export type RealtorRepresentationMode = "BUYER" | "SELLER" | "DUAL" | "NONE";
export type RealtorCommissionPaymentMode = "PER_PAYMENT_EVENT";

export interface DealTerms {
  property_value: number;
  upfront_payment: number;
  monthly_payment: number;
  number_of_payments: number;

  payback_window_start_year: number;
  payback_window_end_year: number;

  timing_factor_early: number;
  timing_factor_late: number;

  floor_multiple: number;
  ceiling_multiple: number;

  downside_mode: DownsideMode;

  contract_maturity_years: number;
  liquidity_trigger_year: number;
  minimum_hold_years: number;

  platform_fee: number;
  servicing_fee_monthly: number;
  exit_fee_pct: number;

  duration_yield_floor_enabled?: boolean;
  duration_yield_floor_start_year?: number | null;
  duration_yield_floor_min_multiple?: number | null;

  realtor_representation_mode: RealtorRepresentationMode;
  realtor_commission_pct: number;
  realtor_commission_payment_mode: RealtorCommissionPaymentMode;
}

export interface ScenarioAssumptions {
  annual_appreciation: number;
  closing_cost_pct: number;
  exit_year: number;
  fmv_override?: number;
}

export interface DealResults {
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

  investor_profit: number;
  investor_multiple: number;
  investor_irr_annual: number;

  realtor_fee_total_projected: number;
  realtor_fee_upfront_projected: number;
  realtor_fee_installments_projected: number;

  buyer_realtor_fee_total_projected: number;
  seller_realtor_fee_total_projected: number;

  investor_irr_annual_net: number | null;

  compute_version: string;
}
