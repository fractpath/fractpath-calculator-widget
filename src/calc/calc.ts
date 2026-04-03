import type {
  ScenarioInputs,
  ScenarioOutputs,
  SettlementResult,
  SettlementTiming,
  TimePoint
} from "./types.js";

import { DEFAULT_INPUTS } from "./constants.js";
import { computeDeal } from "../compute.js";
import { FEE_DEFAULTS } from "../widget/editing/feeDefaults.js";

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/**
 * Normalize inputs:
 * - fills missing fields from DEFAULT_INPUTS
 * - ensures vesting.months = termYears * 12
 */
export function normalizeInputs(partial: Partial<ScenarioInputs>): ScenarioInputs {
  const merged: ScenarioInputs = {
    ...DEFAULT_INPUTS,
    ...partial,
    vesting: {
      ...DEFAULT_INPUTS.vesting,
      ...(partial.vesting ?? {}),
    },
    cpw: {
      ...DEFAULT_INPUTS.cpw,
      ...(partial.cpw ?? {}),
    }
  };

  const months = Math.max(0, Math.round(merged.termYears * 12));
  merged.vesting.months = months;

  return merged;
}

function projectHomeValue(homeValue0: number, annualGrowthRate: number, month: number): number {
  const years = month / 12;
  return homeValue0 * Math.pow(1 + annualGrowthRate, years);
}

function equityPctAtMonth(upfront: number, monthly: number, month: number): number {
  return clamp(upfront + monthly * month, 0, 1);
}

function buildSeries(inputs: ScenarioInputs, maxMonth: number): TimePoint[] {
  const series: TimePoint[] = [];
  for (let m = 0; m <= maxMonth; m++) {
    const hv = projectHomeValue(inputs.homeValue, inputs.annualGrowthRate, m);
    const eq = equityPctAtMonth(
      inputs.vesting.upfrontEquityPct,
      inputs.vesting.monthlyEquityPct,
      m
    );

    series.push({
      month: m,
      year: m / 12,
      homeValue: hv,
      equityPct: eq
    });
  }
  return series;
}

function settlementMonthForTiming(inputs: ScenarioInputs, timing: SettlementTiming): number {
  const termMonths = inputs.vesting.months;

  if (timing === "standard") return termMonths;

  if (timing === "early") return Math.min(36, termMonths);

  if (timing === "late") return termMonths + 24;

  return termMonths;
}

/**
 * Adapter: map current widget inputs (ScenarioInputs) into canonical v11 DealTerms.
 */
function toDealTerms(inputs: ScenarioInputs): import("../compute.js").DealTerms {
  const termYears = inputs.termYears;

  return {
    property_value: inputs.homeValue,
    upfront_payment: inputs.initialBuyAmount,
    monthly_payment: inputs.vesting.monthlyEquityPct * inputs.homeValue,
    number_of_payments: inputs.vesting.months,
    minimum_hold_years: 2,
    contract_maturity_years: Math.max(termYears + 5, 15),

    target_exit_year: termYears,
    target_exit_window_start_year: Math.max(1, termYears - 1),
    target_exit_window_end_year: termYears + 1,
    long_stop_year: termYears + 5,

    first_extension_start_year: termYears + 1,
    first_extension_end_year: termYears + 4,
    first_extension_premium_pct: FEE_DEFAULTS.first_extension_premium_pct,

    second_extension_start_year: termYears + 4,
    second_extension_end_year: termYears + 5,
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
  };
}

function toSettlementResult(
  inputs: ScenarioInputs,
  timing: SettlementTiming
): SettlementResult {
  const month = settlementMonthForTiming(inputs, timing);
  const exitYear = month / 12;

  const terms = toDealTerms(inputs);
  const results = computeDeal(terms, {
    annual_appreciation: inputs.annualGrowthRate,
    closing_cost_pct: 0,
    exit_year: exitYear,
  });

  const homeValueAtSettlement = terms.property_value * Math.pow(1 + inputs.annualGrowthRate, exitYear);
  const basePayout = results.base_buyout_amount;
  const netPayout = results.extension_adjusted_buyout_amount;

  return {
    timing,
    settlementMonth: month,
    homeValueAtSettlement,
    equityPctAtSettlement: results.funding_completion_factor,
    rawPayout: basePayout,
    clampedPayout: netPayout,
    transferFeeAmount: 0,
    netPayout,
    clamp: { floor: 0, cap: 0, applied: "none" },
    transferFeeRate: 0,
  };
}

/**
 * Main deterministic engine.
 * Delegates settlement math to ../compute.js (single source of truth).
 */
export function computeScenario(partialInputs: Partial<ScenarioInputs> = {}): ScenarioOutputs {
  const inputs = normalizeInputs(partialInputs);

  const maxMonth = Math.max(
    settlementMonthForTiming(inputs, "standard"),
    settlementMonthForTiming(inputs, "early"),
    settlementMonthForTiming(inputs, "late")
  );

  const series = buildSeries(inputs, maxMonth);

  const standard = toSettlementResult(inputs, "standard");
  const early = toSettlementResult(inputs, "early");
  const late = toSettlementResult(inputs, "late");

  return {
    normalizedInputs: inputs,
    series,
    settlements: { standard, early, late }
  };
}
