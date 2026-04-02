import { DealTerms, ScenarioAssumptions, DealResults, ContractWindow } from "./types.js";
import { roundMoney } from "./rounding.js";
import { COMPUTE_VERSION } from "./version.js";

export function computeDeal(
  terms: DealTerms,
  assumptions: ScenarioAssumptions
): DealResults {
  const exitMonth = Math.floor(assumptions.exit_year * 12);
  const paymentsMade = Math.min(terms.number_of_payments, exitMonth);

  const total_scheduled_buyer_funding = roundMoney(
    terms.upfront_payment + terms.monthly_payment * terms.number_of_payments
  );

  const actual_buyer_funding_to_date = roundMoney(
    terms.upfront_payment + terms.monthly_payment * paymentsMade
  );

  const funding_completion_factor =
    total_scheduled_buyer_funding > 0
      ? actual_buyer_funding_to_date / total_scheduled_buyer_funding
      : 0;

  const scheduled_buyer_appreciation_share =
    terms.property_value > 0
      ? total_scheduled_buyer_funding / terms.property_value
      : 0;

  const effective_buyer_appreciation_share =
    scheduled_buyer_appreciation_share * funding_completion_factor;

  const current_contract_value = roundMoney(
    assumptions.fmv_override !== undefined &&
    assumptions.fmv_override !== null &&
    assumptions.fmv_override > 0
      ? assumptions.fmv_override
      : terms.property_value * Math.pow(1 + assumptions.annual_appreciation, assumptions.exit_year)
  );

  const buyer_base_capital_component = actual_buyer_funding_to_date;

  const appreciation_amount = Math.max(0, current_contract_value - terms.property_value);

  const buyer_appreciation_claim = roundMoney(
    appreciation_amount * effective_buyer_appreciation_share
  );

  const current_participation_value = roundMoney(
    buyer_base_capital_component + buyer_appreciation_claim
  );

  const fractpath_setup_fee_amount = roundMoney(
    Math.min(
      Math.max(
        total_scheduled_buyer_funding * terms.setup_fee_pct,
        terms.setup_fee_floor
      ),
      terms.setup_fee_cap
    )
  );

  const elapsed_months_for_servicing = exitMonth;

  const fractpath_revenue_to_date = roundMoney(
    fractpath_setup_fee_amount +
    terms.servicing_fee_monthly * elapsed_months_for_servicing +
    terms.payment_admin_fee * paymentsMade +
    terms.exit_admin_fee_amount
  );

  const base_buyout_amount = roundMoney(
    current_participation_value + terms.exit_admin_fee_amount
  );

  const current_window = resolveContractWindow(terms, assumptions.exit_year);

  const extension_adjusted_buyout_amount = roundMoney(
    applyExtensionPremium(base_buyout_amount, current_window, terms)
  );

  const partialBuyouts = computePartialBuyouts(
    terms,
    extension_adjusted_buyout_amount
  );

  const discount_purchase_price = terms.buyer_purchase_option_enabled
    ? roundMoney(current_contract_value - current_participation_value)
    : null;

  const realtor_fee_total_projected = computeRealtorFee(terms, paymentsMade);

  return {
    total_scheduled_buyer_funding,
    actual_buyer_funding_to_date,
    funding_completion_factor,
    scheduled_buyer_appreciation_share,
    effective_buyer_appreciation_share,
    buyer_base_capital_component,
    buyer_appreciation_claim,
    current_contract_value,
    current_participation_value,
    base_buyout_amount,
    extension_adjusted_buyout_amount,
    partial_buyout_amount_25: partialBuyouts[25],
    partial_buyout_amount_50: partialBuyouts[50],
    partial_buyout_amount_75: partialBuyouts[75],
    discount_purchase_price,
    current_window,
    fractpath_setup_fee_amount,
    fractpath_revenue_to_date,
    realtor_fee_total_projected,
    compute_version: COMPUTE_VERSION,
  };
}

function resolveContractWindow(terms: DealTerms, exitYear: number): ContractWindow {
  if (exitYear < terms.target_exit_window_start_year) {
    return "pre_target";
  }
  if (exitYear <= terms.target_exit_window_end_year) {
    return "target_exit";
  }
  if (exitYear > terms.long_stop_year) {
    return "post_long_stop";
  }
  if (
    exitYear >= terms.first_extension_start_year &&
    exitYear <= terms.first_extension_end_year
  ) {
    return "first_extension";
  }
  if (
    exitYear >= terms.second_extension_start_year &&
    exitYear <= terms.second_extension_end_year
  ) {
    return "second_extension";
  }
  return "post_long_stop";
}

function applyExtensionPremium(
  baseBuyout: number,
  window: ContractWindow,
  terms: DealTerms
): number {
  switch (window) {
    case "pre_target":
    case "target_exit":
      return baseBuyout;
    case "first_extension":
      return baseBuyout * (1 + terms.first_extension_premium_pct);
    case "second_extension":
      return baseBuyout * (1 + terms.second_extension_premium_pct);
    case "post_long_stop":
      return baseBuyout * (1 + terms.second_extension_premium_pct);
  }
}

function isValidPartialFraction(
  fraction: number,
  minFraction: number,
  incrementFraction: number
): boolean {
  if (fraction < minFraction) return false;
  if (incrementFraction <= 0) return false;
  const ratio = fraction / incrementFraction;
  return Math.abs(ratio - Math.round(ratio)) < 1e-9;
}

function computePartialBuyouts(
  terms: DealTerms,
  adjustedBuyout: number
): Record<25 | 50 | 75, number | null> {
  if (!terms.partial_buyout_allowed) {
    return { 25: null, 50: null, 75: null };
  }
  const fractions: (25 | 50 | 75)[] = [25, 50, 75];
  const result: Record<25 | 50 | 75, number | null> = { 25: null, 50: null, 75: null };
  for (const pct of fractions) {
    const fraction = pct / 100;
    if (
      isValidPartialFraction(
        fraction,
        terms.partial_buyout_min_fraction,
        terms.partial_buyout_increment_fraction
      )
    ) {
      result[pct] = roundMoney(adjustedBuyout * fraction);
    }
  }
  return result;
}

function computeRealtorFee(terms: DealTerms, paymentsMade: number): number {
  if (
    terms.realtor_representation_mode === "NONE" ||
    terms.realtor_commission_pct === 0
  ) {
    return 0;
  }
  return roundMoney(
    (terms.upfront_payment + terms.monthly_payment * paymentsMade) *
      terms.realtor_commission_pct
  );
}
