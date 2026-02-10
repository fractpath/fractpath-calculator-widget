import type { ScenarioInputs, ScenarioOutputs } from "../calc/types.js";
import type { CalculatorPersona } from "../widget/types.js";
import type {
  LiteShareSummaryV1,
  LiteChartSeriesV1,
  LiteInputsV1,
  LiteBasicResultsV1,
  FullDealSnapshotV1,
} from "./v1.js";
import { CONTRACT_VERSION_V1, SCHEMA_VERSION_V1 } from "./v1.js";
import { buildChartSeriesV1 } from "../calc/chart.js";
import { deterministicHash } from "../widget/hash.js";

const EXIT_LABELS = {
  early: "Early Exit",
  standard: "Standard Exit",
  late: "Late Exit",
} as const;

export function buildLiteInputsV1(normalizedInputs: ScenarioInputs): LiteInputsV1 {
  const lite: LiteInputsV1 = {
    homeValue: normalizedInputs.homeValue,
    initialBuyAmount: normalizedInputs.initialBuyAmount,
    termYears: normalizedInputs.termYears,
    annualGrowthRate: normalizedInputs.annualGrowthRate,
  };

  if (
    typeof normalizedInputs.mortgageBalance === "number" &&
    Number.isFinite(normalizedInputs.mortgageBalance)
  ) {
    lite.mortgageBalance = normalizedInputs.mortgageBalance;
  }

  return lite;
}

export function buildLiteBasicResultsV1(outputs: ScenarioOutputs): LiteBasicResultsV1 {
  return {
    standard_net_payout: outputs.settlements.standard.netPayout,
    early_net_payout: outputs.settlements.early.netPayout,
    late_net_payout: outputs.settlements.late.netPayout,
    standard_settlement_month: outputs.settlements.standard.settlementMonth,
    early_settlement_month: outputs.settlements.early.settlementMonth,
    late_settlement_month: outputs.settlements.late.settlementMonth,
  };
}

export function buildLiteChartSeriesV1(outputs: ScenarioOutputs): LiteChartSeriesV1 {
  const full = buildChartSeriesV1(outputs);

  return {
    points: full.points,
    exits: full.exits.map((e) => ({
      timing: e.timing,
      label: EXIT_LABELS[e.timing],
      month: e.month,
      netPayout: e.netPayout,
    })),
  };
}

export function buildLiteShareSummaryV1(
  persona: CalculatorPersona,
  normalizedInputs: ScenarioInputs,
  outputs: ScenarioOutputs,
): LiteShareSummaryV1 {
  return {
    contract_version: CONTRACT_VERSION_V1,
    schema_version: SCHEMA_VERSION_V1,
    persona,
    inputs: buildLiteInputsV1(normalizedInputs),
    basic_results: buildLiteBasicResultsV1(outputs),
    chart_series_v1: buildLiteChartSeriesV1(outputs),
    created_at: new Date().toISOString(),
  };
}

export async function buildFullDealSnapshotV1(
  persona: CalculatorPersona,
  normalizedInputs: ScenarioInputs,
  outputs: ScenarioOutputs,
): Promise<FullDealSnapshotV1> {
  const [input_hash, output_hash] = await Promise.all([
    deterministicHash(normalizedInputs as unknown as Record<string, unknown>),
    deterministicHash(
      {
        standard: outputs.settlements.standard,
        early: outputs.settlements.early,
        late: outputs.settlements.late,
      } as unknown as Record<string, unknown>,
    ),
  ]);

  return {
    contract_version: CONTRACT_VERSION_V1,
    schema_version: SCHEMA_VERSION_V1,
    persona,
    mode: "app",
    inputs: normalizedInputs,
    outputs,
    chart_series_v1: buildChartSeriesV1(outputs),
    input_hash,
    output_hash,
    created_at: new Date().toISOString(),
  };
}
