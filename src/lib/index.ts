// --- Existing public widget wrapper (keep stable) ---
export { FractPathCalculatorWidget } from "../widget/FractPathCalculatorWidget.js";

// --- NEW: Shared UI primitives for App + Marketing (Sprint 11) ---
export { DealSnapshotView } from "../widget/components/DealSnapshotView.js";
export { DealEditModal } from "../widget/components/DealEditModal.js";

// Optional: expose subcomponents (OK to export, not required by embeds)
export { DealKpiStrip } from "../widget/components/DealKpiStrip.js";
export { EquityTransferChart } from "../widget/components/EquityTransferChart.js";

// --- Canonical draft type (useful for hosts that persist drafts) ---
export type { DraftCanonicalInputs } from "../widget/editing/types.js";

// --- Existing legacy calc/chart exports (leave for backward compatibility) ---
export { computeScenario, normalizeInputs } from "../calc/calc.js";
export { buildChartSeries } from "../calc/chart.js";
export { EquityChart } from "../components/EquityChart.js";

// --- Existing snapshot utilities (leave; used by marketing/app flows today) ---
export {
  buildDraftSnapshot,
  buildShareSummary,
  buildSavePayload,
  buildFullDealSnapshotV1,
} from "../widget/snapshot.js";
export { deterministicHash } from "../widget/hash.js";

// --- Persona presentation resolver (Sprint 11 WGT-UX-012) ---
export { resolvePersonaPresentation } from "../widget/personaPresentation.js";
export type {
  HeroSpec,
  ChipSpec,
  BarSpec,
  ChartSpec,
  PersonaPresentationResult,
  ValueFormat,
} from "../widget/personaPresentation.js";

// --- Marketing persona list (Sprint 11 WGT-005) ---
export { MARKETING_PERSONAS } from "../widget/wired.js";

// --- Persona translation layer (Sprint 11 WGT-UX-011) ---
export { getLabel, getSummaryOrder, getPersonaConfig } from "../widget/persona.js";

// --- Fee defaults (Sprint 11 WGT-UX-011) ---
export { FEE_DEFAULTS } from "../widget/editing/feeDefaults.js";

// --- Kiosk input hook (Sprint 11 WGT-UX-011) ---
export { useKioskInput } from "../widget/hooks/useKioskInput.js";

// --- Existing public types (keep stable) ---
export type {
  CalculatorPersona,
  CalculatorMode,
  DevAuthRole,
  FullDealSnapshotV1,
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

// --- Existing calc types (keep stable) ---
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
