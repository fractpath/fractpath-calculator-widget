import type { SettlementTiming, ScenarioInputs, ScenarioOutputs } from "../calc/types.js";
import type { ChartPoint, ChartSeriesV1 } from "../calc/chart.js";
import type { CalculatorPersona } from "../widget/types.js";

export const CONTRACT_VERSION_V1 = "1.0.0" as const;
export const SCHEMA_VERSION_V1 = "1.0.0" as const;

export type LiteInputsV1 = {
  homeValue: number;
  initialBuyAmount: number;
  termYears: number;
  annualGrowthRate: number;
  mortgageBalance?: number;
};

export type LiteBasicResultsV1 = {
  standard_net_payout: number;
  early_net_payout: number;
  late_net_payout: number;
  standard_settlement_month: number;
  early_settlement_month: number;
  late_settlement_month: number;
};

export type LiteExitMarker = {
  timing: SettlementTiming;
  label: string;
  month: number;
  netPayout: number;
};

export type LiteChartSeriesV1 = {
  points: ChartPoint[];
  exits: LiteExitMarker[];
};

export type LiteShareSummaryV1 = {
  contract_version: typeof CONTRACT_VERSION_V1;
  schema_version: typeof SCHEMA_VERSION_V1;
  persona: CalculatorPersona;
  inputs: LiteInputsV1;
  basic_results: LiteBasicResultsV1;
  chart_series_v1: LiteChartSeriesV1;
  created_at: string;
};

export type FullDealSnapshotV1 = {
  contract_version: typeof CONTRACT_VERSION_V1;
  schema_version: typeof SCHEMA_VERSION_V1;
  persona: CalculatorPersona;
  mode: "app";
  inputs: ScenarioInputs;
  outputs: ScenarioOutputs;
  chart_series_v1: ChartSeriesV1;
  input_hash: string;
  output_hash: string;
  created_at: string;
};

export type {
  ChartPoint,
  ChartSeriesV1,
  ExitSummary,
} from "../calc/chart.js";
