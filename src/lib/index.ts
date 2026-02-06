export { FractPathCalculatorWidget } from "../widget/FractPathCalculatorWidget.js";

export { computeScenario, normalizeInputs } from "../calc/calc.js";
export { buildChartSeries } from "../calc/chart.js";

export type {
  CalculatorPersona,
  CalculatorMode,
  LeadPayload,
  WidgetEvent,
  FractPathCalculatorWidgetProps,
} from "../widget/types.js";

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
} from "../calc/chart.js";
