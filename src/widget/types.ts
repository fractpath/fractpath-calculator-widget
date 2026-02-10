import type { ScenarioInputs, ScenarioOutputs } from "../calc/types.js";

/**
 * Public, host-visible persona options.
 * NOTE: Sprint 5 Day-1 scope = homeowner | buyer | realtor
 * Investor/Ops are intentionally excluded from the public surface for now.
 */
export type CalculatorPersona = "homeowner" | "buyer" | "realtor";

export type CalculatorMode = "marketing" | "app";

/**
 * Contract / schema versions (governed by WGT-050).
 * These must not change without coordinated release steps.
 */
export const CONTRACT_VERSION = "1.0.0" as const;
export const SCHEMA_VERSION = "1.0.0" as const;

/**
 * Minimal draft inputs used for marketing → resume.
 * Keep this aligned with the *applied* modal inputs (not raw typing state).
 *
 * NOTE: Mortgage balance belongs in the full calculator contract (WGT-040 / InputsV1),
 * but if you're still using this simplified draft type in code, include it here
 * so equity-availability constraint can be replayed deterministically.
 */
export type DraftSnapshotInputs = {
  homeValue: number;
  mortgageBalance?: number; // optional for backward compatibility
  initialBuyAmount: number;
  termYears: number;
  annualGrowthRate: number;
};

export type DraftSnapshotBasicResults = {
  standard_net_payout: number;
  early_net_payout: number;
  late_net_payout: number;
  standard_settlement_month: number;
  early_settlement_month: number;
  late_settlement_month: number;
};

export type DraftSnapshot = {
  contract_version: typeof CONTRACT_VERSION;
  schema_version: typeof SCHEMA_VERSION;
  persona: CalculatorPersona;
  mode: "marketing";
  inputs: DraftSnapshotInputs;
  basic_results: DraftSnapshotBasicResults;
  input_hash: string;
  output_hash: string;
  created_at: string; // ISO-8601 UTC
};

export type ShareSummaryBasicResults = {
  standard_net_payout: number;
  early_net_payout: number;
  late_net_payout: number;
};

export type ShareSummary = {
  contract_version: typeof CONTRACT_VERSION;
  schema_version: typeof SCHEMA_VERSION;
  persona: CalculatorPersona;
  inputs: DraftSnapshotInputs;
  basic_results: ShareSummaryBasicResults;
  created_at: string; // ISO-8601 UTC
};

export type SavePayload = {
  contract_version: typeof CONTRACT_VERSION;
  schema_version: typeof SCHEMA_VERSION;
  persona: CalculatorPersona;
  mode: "app";
  inputs: ScenarioInputs;
  outputs: ScenarioOutputs;
  input_hash: string;
  output_hash: string;
  created_at: string; // ISO-8601 UTC
};

export type WidgetEvent =
  | { type: "calculator_used"; persona: CalculatorPersona }
  | { type: "share_clicked"; persona: CalculatorPersona }
  | { type: "save_continue_clicked"; persona: CalculatorPersona }
  | { type: "save_clicked"; persona: CalculatorPersona }
  | { type: "modal_opened"; persona: CalculatorPersona }
  | { type: "modal_closed"; persona: CalculatorPersona }
  | { type: "apply_clicked"; persona: CalculatorPersona }
  | { type: "persona_switched"; persona: CalculatorPersona; previousPersona: CalculatorPersona }
  | { type: "inputs_reset"; persona: CalculatorPersona };

export type FractPathCalculatorWidgetProps = {
  persona: CalculatorPersona;

  mode?: CalculatorMode;

  onDraftSnapshot?: (snapshot: DraftSnapshot) => void;

  onShareSummary?: (summary: ShareSummary) => void;

  onSave?: (payload: SavePayload) => void;

  onLiteSnapshot?: (payload: import("../contracts/v1.js").LiteShareSummaryV1) => void;

  onFullSnapshot?: (payload: import("../contracts/v1.js").FullDealSnapshotV1) => void;

  onEvent?: (event: WidgetEvent) => void;
};
