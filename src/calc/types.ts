/**
 * FractPath calculator adapter contract.
 * These types represent the internal adapter layer between the widget's
 * legacy ScenarioInputs API surface and the canonical v11 computeDeal engine.
 * Keep this file stable; snapshot, chart, and UI layers depend on it.
 */

export type SettlementTiming = "standard" | "early" | "late";

export type ScenarioInputs = {
  /** Current home value (FMV today) */
  homeValue: number;

  /** Initial Buy Amount (cash advanced to homeowner / buyer upfront payment) */
  initialBuyAmount: number;

  /** Term in years — used as target_exit_year for computeDeal */
  termYears: number;

  /** Expected annual home appreciation rate, e.g. 0.03 */
  annualGrowthRate: number;

  /** Transfer fee rates — maintained for schema compatibility; set to 0 by the v11 adapter */
  transferFeeRate_standard: number;
  transferFeeRate_early: number;
  transferFeeRate_late: number;

  /** Not used for settlement math in v11; retained for schema compatibility */
  floorMultiple: number;

  /** Not used for settlement math in v11; retained for schema compatibility */
  capMultiple: number;

  /**
   * Vesting schedule inputs — used to derive monthly_payment and number_of_payments
   * for the v11 computeDeal adapter. Not a direct v11 concept.
   */
  vesting: {
    upfrontEquityPct: number;
    monthlyEquityPct: number;
    months: number;
  };

  /**
   * Cost/coverage percent range — not part of settlement math; retained for schema compatibility.
   */
  cpw: {
    startPct: number;
    endPct: number;
  };
};

export type TimePoint = {
  /** month index starting at 0 */
  month: number;
  /** year as float (month / 12) */
  year: number;
  /** projected home value at this point */
  homeValue: number;
  /** vesting-derived equity percentage (0..1) — adapter internal only */
  equityPct: number;
};

/**
 * Settlement result for a given exit scenario.
 * In v11: rawPayout = base_buyout_amount, netPayout = extension_adjusted_buyout_amount.
 * transferFeeAmount, transferFeeRate, clamp.applied are zero/none — no v10 clamp semantics.
 */
export type SettlementResult = {
  timing: SettlementTiming;

  settlementMonth: number;

  homeValueAtSettlement: number;

  /** funding_completion_factor from v11 computeDeal */
  equityPctAtSettlement: number;

  /** base_buyout_amount from v11 computeDeal */
  rawPayout: number;

  /** extension_adjusted_buyout_amount from v11 computeDeal */
  clampedPayout: number;

  /** Always 0 — no transfer fee in v11 */
  transferFeeAmount: number;

  /** extension_adjusted_buyout_amount — the final buyout amount */
  netPayout: number;

  /** No-op in v11 — always { floor: 0, cap: 0, applied: "none" } */
  clamp: {
    floor: number;
    cap: number;
    applied: "none" | "floor" | "cap";
  };

  /** Always 0 in v11 */
  transferFeeRate: number;
};

export type ScenarioOutputs = {
  /** Inputs echoed back after defaults normalization */
  normalizedInputs: ScenarioInputs;

  /** Month-by-month time series (homeValue + vesting-derived equityPct) */
  series: TimePoint[];

  /** Buyout results at three exit scenarios */
  settlements: {
    standard: SettlementResult;
    early: SettlementResult;
    late: SettlementResult;
  };
};
