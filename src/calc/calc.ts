import type {
  ScenarioInputs,
  ScenarioOutputs,
  SettlementResult,
  SettlementTiming,
  TimePoint
} from "./types.js";

import { DEFAULT_INPUTS } from "./constants.js";

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
  // continuous-ish monthly compounding via fractional exponent
  return homeValue0 * Math.pow(1 + annualGrowthRate, years);
}

function equityPctAtMonth(upfront: number, monthly: number, month: number): number {
  // linear vesting; clamp to [0, 1]
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

  // Placeholder per MVP (replace with frozen spec when available)
  if (timing === "early") return Math.min(36, termMonths); // 3 years or earlier if shorter term

  // "late": term + 24 months (2 years) — requires extending the series
  if (timing === "late") return termMonths + 24;

  return termMonths;
}

function transferFeeRateForTiming(inputs: ScenarioInputs, timing: SettlementTiming): number {
  if (timing === "early") return inputs.transferFeeRate_early;
  if (timing === "late") return inputs.transferFeeRate_late;
  return inputs.transferFeeRate_standard;
}

function computeSettlement(inputs: ScenarioInputs, timing: SettlementTiming): SettlementResult {
  const month = settlementMonthForTiming(inputs, timing);
  const homeValueAtSettlement = projectHomeValue(inputs.homeValue, inputs.annualGrowthRate, month);
  const equityPct = equityPctAtMonth(inputs.vesting.upfrontEquityPct, inputs.vesting.monthlyEquityPct, month);

  const rawPayout = homeValueAtSettlement * equityPct;

  const floor = inputs.initialBuyAmount * inputs.floorMultiple;
  const cap = inputs.initialBuyAmount * inputs.capMultiple;

  const clampedPayout = clamp(rawPayout, floor, cap);

  const applied: "none" | "floor" | "cap" =
    clampedPayout === rawPayout ? "none" : clampedPayout === floor ? "floor" : "cap";

  const tfRate = transferFeeRateForTiming(inputs, timing);
  const transferFeeAmount = clampedPayout * tfRate;
  const netPayout = clampedPayout - transferFeeAmount;

  return {
    timing,
    settlementMonth: month,
    homeValueAtSettlement,
    equityPctAtSettlement: equityPct,
    rawPayout,
    clampedPayout,
    transferFeeAmount,
    netPayout,
    clamp: { floor, cap, applied },
    transferFeeRate: tfRate
  };
}

/**
 * Main deterministic engine.
 */
export function computeScenario(partialInputs: Partial<ScenarioInputs> = {}): ScenarioOutputs {
  const inputs = normalizeInputs(partialInputs);

  // Ensure series covers the furthest settlement month
  const maxMonth = Math.max(
    settlementMonthForTiming(inputs, "standard"),
    settlementMonthForTiming(inputs, "early"),
    settlementMonthForTiming(inputs, "late")
  );

  const series = buildSeries(inputs, maxMonth);

  const standard = computeSettlement(inputs, "standard");
  const early = computeSettlement(inputs, "early");
  const late = computeSettlement(inputs, "late");

  return {
    normalizedInputs: inputs,
    series,
    settlements: { standard, early, late }
  };
}
