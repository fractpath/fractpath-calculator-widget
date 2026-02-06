export type CalculatorPersona =
  | "homeowner"
  | "buyer"
  | "realtor"
  | "investor"
  | "ops";

export type CalculatorMode = "default" | "share";

export type LeadPayload = {
  email: string;
  persona: CalculatorPersona;
  source: "marketing" | "share" | "unknown";
  scenario_inputs: Record<string, unknown>;
  scenario_outputs: Record<string, unknown>;
  deal_summary_text: string;
};

export type WidgetEvent =
  | { type: "calculator_used"; persona: CalculatorPersona }
  | { type: "reveal_clicked"; persona: CalculatorPersona }
  | { type: "share_mode_viewed"; persona: CalculatorPersona }
  | { type: "lead_submit_attempted"; persona: CalculatorPersona }
  | { type: "lead_submit_succeeded"; persona: CalculatorPersona }
  | { type: "lead_submit_failed"; persona: CalculatorPersona; message?: string };

export type FractPathCalculatorWidgetProps = {
  persona: CalculatorPersona;
  mode?: CalculatorMode;
  onLeadSubmit?: (payload: LeadPayload) => Promise<{ ok: boolean }>;
  onEvent?: (event: WidgetEvent) => void;
};
