import type { ScenarioInputs, ScenarioOutputs } from "../calc/types.js";
import type { DealTerms, ScenarioAssumptions } from "../compute.js";
import { computeDeal } from "../compute.js";
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
 * Maps widget-level ScenarioInputs to canonical v11 DealTerms.
 * Missing canonical fields use deterministic defaults documented inline.
 */
export function mapWidgetInputsToDealTerms(inputs: ScenarioInputs): DealTerms {
  const termYears = inputs.termYears;
  return {
    property_value: inputs.homeValue,
    upfront_payment: inputs.initialBuyAmount,
    monthly_payment: inputs.vesting?.monthlyEquityPct
      ? inputs.vesting.monthlyEquityPct * inputs.homeValue
      : 0,
    number_of_payments: inputs.vesting?.months ?? termYears * 12,
    minimum_hold_years: 2,
    contract_maturity_years: Math.max(termYears + 5, 15),

    target_exit_year: termYears,
    target_exit_window_start_year: Math.max(1, termYears - 1),
    target_exit_window_end_year: termYears + 1,
    long_stop_year: termYears + 5,

    first_extension_start_year: termYears + 1,
    first_extension_end_year: termYears + 4,
    first_extension_premium_pct: 0.05,

    second_extension_start_year: termYears + 4,
    second_extension_end_year: termYears + 5,
    second_extension_premium_pct: 0.08,

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

/**
 * Maps widget-level ScenarioInputs to canonical ScenarioAssumptions.
 */
export function mapWidgetInputsToAssumptions(
  inputs: ScenarioInputs,
): ScenarioAssumptions {
  return {
    annual_appreciation: inputs.annualGrowthRate,
    closing_cost_pct: 0.02,
    exit_year: inputs.termYears,
  };
}

/**
 * Builds canonical FullDealSnapshotV1 from widget inputs.
 * Uses ../compute.js for deterministic outputs.
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
