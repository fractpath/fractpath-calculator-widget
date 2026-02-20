import type { ScenarioInputs, ScenarioOutputs } from "../calc/types.js";
import type { DealTerms, ScenarioAssumptions } from "@fractpath/compute";
import { computeDeal } from "@fractpath/compute";
import { FEE_DEFAULTS } from "./editing/feeDefaults.js";
import {
  CONTRACT_VERSION,
  SCHEMA_VERSION,
  type CalculatorPersona,
  type FullDealSnapshotV1,
  type DraftSnapshot,
  type DraftSnapshotInputs,
  type DraftSnapshotBasicResults,
  type ShareSummary,
  type ShareSummaryBasicResults,
  type SavePayload,
} from "./types.js";
import { deterministicHash } from "./hash.js";

function extractDraftInputs(inputs: ScenarioInputs): DraftSnapshotInputs {
  return {
    homeValue: inputs.homeValue,
    initialBuyAmount: inputs.initialBuyAmount,
    termYears: inputs.termYears,
    annualGrowthRate: inputs.annualGrowthRate,
  };
}

function extractDraftBasicResults(
  outputs: ScenarioOutputs,
): DraftSnapshotBasicResults {
  return {
    standard_net_payout: outputs.settlements.standard.netPayout,
    early_net_payout: outputs.settlements.early.netPayout,
    late_net_payout: outputs.settlements.late.netPayout,
    standard_settlement_month: outputs.settlements.standard.settlementMonth,
    early_settlement_month: outputs.settlements.early.settlementMonth,
    late_settlement_month: outputs.settlements.late.settlementMonth,
  };
}

function extractShareBasicResults(
  outputs: ScenarioOutputs,
): ShareSummaryBasicResults {
  return {
    standard_net_payout: outputs.settlements.standard.netPayout,
    early_net_payout: outputs.settlements.early.netPayout,
    late_net_payout: outputs.settlements.late.netPayout,
  };
}

export async function buildDraftSnapshot(
  persona: CalculatorPersona,
  normalizedInputs: ScenarioInputs,
  outputs: ScenarioOutputs,
): Promise<DraftSnapshot> {
  const inputs = extractDraftInputs(normalizedInputs);
  const basic_results = extractDraftBasicResults(outputs);

  const [input_hash, output_hash] = await Promise.all([
    deterministicHash(inputs as unknown as Record<string, unknown>),
    deterministicHash(basic_results as unknown as Record<string, unknown>),
  ]);

  return {
    contract_version: CONTRACT_VERSION,
    schema_version: SCHEMA_VERSION,
    persona,
    mode: "marketing",
    inputs,
    basic_results,
    input_hash,
    output_hash,
    created_at: new Date().toISOString(),
  };
}

export function buildShareSummary(
  persona: CalculatorPersona,
  normalizedInputs: ScenarioInputs,
  outputs: ScenarioOutputs,
): ShareSummary {
  return {
    contract_version: CONTRACT_VERSION,
    schema_version: SCHEMA_VERSION,
    persona,
    inputs: extractDraftInputs(normalizedInputs),
    basic_results: extractShareBasicResults(outputs),
    created_at: new Date().toISOString(),
  };
}

export async function buildSavePayload(
  persona: CalculatorPersona,
  normalizedInputs: ScenarioInputs,
  outputs: ScenarioOutputs,
): Promise<SavePayload> {
  const [input_hash, output_hash] = await Promise.all([
    deterministicHash(normalizedInputs as unknown as Record<string, unknown>),
    deterministicHash({
      standard: outputs.settlements.standard,
      early: outputs.settlements.early,
      late: outputs.settlements.late,
    } as unknown as Record<string, unknown>),
  ]);

  return {
    contract_version: CONTRACT_VERSION,
    schema_version: SCHEMA_VERSION,
    persona,
    mode: "app",
    inputs: normalizedInputs,
    outputs,
    input_hash,
    output_hash,
    created_at: new Date().toISOString(),
  };
}

/**
 * Maps widget-level ScenarioInputs to canonical DealTerms.
 * Missing canonical fields use deterministic defaults documented inline.
 */
export function mapWidgetInputsToDealTerms(inputs: ScenarioInputs): DealTerms {
  return {
    property_value: inputs.homeValue,
    upfront_payment: inputs.initialBuyAmount,
    // Default: monthly_payment derived from vesting schedule; 0 if absent
    monthly_payment: inputs.vesting?.monthlyEquityPct
      ? inputs.vesting.monthlyEquityPct * inputs.homeValue
      : 0,
    number_of_payments: inputs.vesting?.months ?? inputs.termYears * 12,

    // Default payback windows: start at year 3, end at contract maturity
    payback_window_start_year: 3,
    payback_window_end_year: inputs.termYears,

    // Default timing factors: 0.85 early penalty, 1.10 late bonus
    timing_factor_early: 0.85,
    timing_factor_late: 1.10,

    floor_multiple: inputs.floorMultiple,
    ceiling_multiple: inputs.capMultiple,
    downside_mode: "HARD_FLOOR",

    contract_maturity_years: inputs.termYears,
    // Default: liquidity trigger at 70% of term
    liquidity_trigger_year: Math.floor(inputs.termYears * 0.7),
    // Default: minimum 1-year hold
    minimum_hold_years: 1,

    platform_fee: FEE_DEFAULTS.platform_fee,
    servicing_fee_monthly: FEE_DEFAULTS.servicing_fee_monthly,
    exit_fee_pct: FEE_DEFAULTS.exit_fee_pct,

    // Default realtor: NONE with 0 commission, PER_PAYMENT_EVENT locked
    realtor_representation_mode: "NONE",
    realtor_commission_pct: 0,
    realtor_commission_payment_mode: "PER_PAYMENT_EVENT",
  };
}

/**
 * Maps widget-level ScenarioInputs to canonical ScenarioAssumptions.
 */
export function mapWidgetInputsToAssumptions(
  inputs: ScenarioInputs,
): ScenarioAssumptions {
  return {
    annual_appreciation: inputs.annualGrowthRate,
    // Default: 2% closing costs
    closing_cost_pct: 0.02,
    exit_year: inputs.termYears,
  };
}

/**
 * Builds canonical FullDealSnapshotV1 from widget inputs.
 * Uses @fractpath/compute for deterministic outputs.
 */
export function buildFullDealSnapshotV1(
  inputs: ScenarioInputs,
): FullDealSnapshotV1 {
  const deal_terms = mapWidgetInputsToDealTerms(inputs);
  const assumptions = mapWidgetInputsToAssumptions(inputs);
  const outputs = computeDeal(deal_terms, assumptions);
  const now = new Date().toISOString();

  return {
    contract_version: CONTRACT_VERSION,
    schema_version: SCHEMA_VERSION,
    deal_terms,
    assumptions,
    outputs,
    now_iso: now,
    created_at: now,
  };
}
