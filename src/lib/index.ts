export { FractPathCalculatorWidget } from "../widget/FractPathCalculatorWidget.js";

export { computeScenario, normalizeInputs } from "../calc/calc.js";
export { buildChartSeries, buildChartSeriesV1 } from "../calc/chart.js";
export { EquityChart } from "../components/EquityChart.js";

export { buildDraftSnapshot, buildShareSummary, buildSavePayload } from "../widget/snapshot.js";
export { deterministicHash } from "../widget/hash.js";

export {
  buildLiteShareSummaryV1,
  buildFullDealSnapshotV1,
  buildLiteChartSeriesV1,
  buildLiteInputsV1,
  buildLiteBasicResultsV1,
} from "../contracts/builders.js";

export type {
  CalculatorPersona,
  CalculatorMode,
  DraftSnapshot,
  DraftSnapshotInputs,
  DraftSnapshotBasicResults,
  ShareSummary,
  ShareSummaryBasicResults,
  SavePayload,
  WidgetEvent,
  FractPathCalculatorWidgetProps,
} from "../widget/types.js";

export { CONTRACT_VERSION, SCHEMA_VERSION } from "../widget/types.js";

export type {
  LiteShareSummaryV1,
  FullDealSnapshotV1,
  LiteChartSeriesV1,
  LiteExitMarker,
  LiteInputsV1,
  LiteBasicResultsV1,
} from "../contracts/v1.js";

export { CONTRACT_VERSION_V1, SCHEMA_VERSION_V1 } from "../contracts/v1.js";

export type {
  ScenarioInputs,
  ScenarioOutputs,
  SettlementResult,
  SettlementTiming,
  TimePoint,
} from "../calc/types.js";

export type {
  ChartPoint,
  SettlementMarker,
  ChartSeries,
  ChartSeriesV1,
  ExitSummary,
} from "../calc/chart.js";
