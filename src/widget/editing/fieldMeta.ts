export type Unit =
  | "currency"
  | "percent"
  | "years"
  | "months"
  | "number"
  | "enum"
  | "info";

export type Control =
  | "kiosk"
  | "slider"
  | "enum"
  | "readonly"
  | "info";

export type FieldKey =
  | "deal_terms.property_value"
  | "deal_terms.upfront_payment"
  | "deal_terms.monthly_payment"
  | "deal_terms.number_of_payments"
  | "scenario.annual_appreciation"
  | "scenario.exit_year"
  | "scenario.closing_cost_pct"
  | "deal_terms.floor_multiple"
  | "deal_terms.ceiling_multiple"
  | "deal_terms.downside_mode"
  | "deal_terms.payback_window_start_year"
  | "deal_terms.payback_window_end_year"
  | "deal_terms.timing_factor_early"
  | "deal_terms.timing_factor_late"
  | "deal_terms.minimum_hold_years"
  | "deal_terms.contract_maturity_years"
  | "deal_terms.liquidity_trigger_year"
  | "deal_terms.platform_fee"
  | "deal_terms.servicing_fee_monthly"
  | "deal_terms.exit_fee_pct"
  | "deal_terms.realtor_representation_mode"
  | "deal_terms.realtor_commission_pct"
  | "deal_terms.realtor_commission_payment_mode"
  | "deal_terms.duration_yield_floor_enabled"
  | "deal_terms.duration_yield_floor_start_year"
  | "deal_terms.duration_yield_floor_min_multiple"
  | "__disclosure__";

export type Anchor = { label: string; value: number };

export type DynamicPercentAnchors = {
  sourceKey: "deal_terms.property_value";
  percents: [number, number, number, number];
  rounding: "nearest_100";
  min?: number;
  maxPercentOfSource?: number;
  labelPercents?: [string, string, string, string];
};

export type SliderSpec = {
  min: number;
  max: number;
  step: number;
};

export type FieldMeta = {
  key: FieldKey;
  label: string;
  unit: Unit;
  control: Control;

  simpleDefinition: string;
  impact: string;
  formula: string;

  anchors?: [Anchor, Anchor, Anchor, Anchor];
  dynamicPercentAnchors?: DynamicPercentAnchors;
  slider?: SliderSpec;
  recommendedRange?: { min: number; max: number };
  hardRange?: { min: number; max: number };
  options?: Array<{ label: string; value: string }>;
  readOnly?: boolean;
  sectionHint?: string;
};

export const FIELD_META: FieldMeta[] = [
  {
    key: "deal_terms.property_value",
    label: "Property value (FMV)",
    unit: "currency",
    control: "slider",
    simpleDefinition: "How much the home is worth right now.",
    impact: "It affects how much equity your payments buy and how the deal grows over time.",
    formula:
      "equity_upfront = upfront_payment / property_value; property_value_m starts from property_value",
    slider: { min: 100_000, max: 3_000_000, step: 10_000 },
    recommendedRange: { min: 200_000, max: 1_500_000 },
    hardRange: { min: 100_000, max: 3_000_000 },
    sectionHint: "Payments",
  },
  {
    key: "deal_terms.upfront_payment",
    label: "Upfront payment",
    unit: "currency",
    control: "kiosk",
    simpleDefinition: "Money paid at the start of the deal.",
    impact:
      "It buys equity right away. For MVP, upfront payment is capped so total equity transfer can't exceed a safe share of the home value.",
    formula:
      "invested_capital_total = upfront_payment + monthly_payment * payments_made_by_exit; equity_upfront = upfront_payment / property_value",
    dynamicPercentAnchors: {
      sourceKey: "deal_terms.property_value",
      percents: [0.05, 0.10, 0.15, 0.20],
      rounding: "nearest_100",
      min: 0,
      maxPercentOfSource: 0.50,
      labelPercents: ["5%", "10%", "15%", "20%"],
    },
    recommendedRange: { min: 0, max: 300_000 },
    hardRange: { min: 0, max: 1_500_000 },
    sectionHint: "Payments",
  },
  {
    key: "deal_terms.monthly_payment",
    label: "Monthly payment",
    unit: "currency",
    control: "kiosk",
    simpleDefinition: "Money paid each month during the deal.",
    impact: "Monthly payments buy equity over time, based on the home value each month.",
    formula: "equity_m = monthly_payment / property_value_m",
    dynamicPercentAnchors: {
      sourceKey: "deal_terms.property_value",
      percents: [0.0, 0.001, 0.002, 0.003],
      rounding: "nearest_100",
      min: 0,
      labelPercents: ["0%", "0.1%", "0.2%", "0.3%"],
    },
    recommendedRange: { min: 0, max: 3_000 },
    hardRange: { min: 0, max: 25_000 },
    sectionHint: "Payments",
  },
  {
    key: "deal_terms.number_of_payments",
    label: "Number of monthly payments",
    unit: "months",
    control: "slider",
    simpleDefinition: "How many monthly payments you plan to make.",
    impact: "More months means more total payments and more equity purchased over time.",
    formula: "payments_made_by_exit = min(number_of_payments, exit_month)",
    slider: { min: 0, max: 120, step: 1 },
    recommendedRange: { min: 0, max: 120 },
    hardRange: { min: 0, max: 120 },
    sectionHint: "Payments",
  },
  {
    key: "scenario.annual_appreciation",
    label: "Annual appreciation",
    unit: "percent",
    control: "kiosk",
    simpleDefinition: "How fast the home value grows (or drops) each year.",
    impact: "It changes the future home value, which changes how much equity each monthly payment buys.",
    formula: "property_value_m = property_value * (1 + annual_appreciation)^(m/12)",
    anchors: [
      { label: "0%", value: 0.0 },
      { label: "2%", value: 0.02 },
      { label: "4%", value: 0.04 },
      { label: "6%", value: 0.06 },
    ],
    recommendedRange: { min: -0.05, max: 0.08 },
    hardRange: { min: -0.5, max: 0.5 },
    sectionHint: "Assumptions",
  },
  {
    key: "scenario.exit_year",
    label: "Exit year",
    unit: "years",
    control: "kiosk",
    simpleDefinition: "When the deal ends (like 5 years).",
    impact: "It sets how long the equity has to grow and how many payments count before exit.",
    formula:
      "exit_month = floor(exit_year * 12); projected_fmv = property_value * (1 + annual_appreciation)^exit_year",
    anchors: [
      { label: "3", value: 3 },
      { label: "5", value: 5 },
      { label: "7", value: 7 },
      { label: "10", value: 10 },
    ],
    recommendedRange: { min: 3, max: 10 },
    hardRange: { min: 0.5, max: 30 },
    sectionHint: "Assumptions",
  },
  {
    key: "scenario.closing_cost_pct",
    label: "Closing costs (%)",
    unit: "percent",
    control: "kiosk",
    simpleDefinition: "Extra costs paid when the deal closes (as a percent).",
    impact: "Closing costs reduce the net proceeds at exit and can change the settlement amount.",
    formula: "net_at_exit = gross_at_exit - (closing_cost_pct * projected_fmv) (conceptual)",
    anchors: [
      { label: "0%", value: 0.0 },
      { label: "1%", value: 0.01 },
      { label: "2%", value: 0.02 },
      { label: "3%", value: 0.03 },
    ],
    recommendedRange: { min: 0.0, max: 0.04 },
    hardRange: { min: 0.0, max: 0.1 },
    sectionHint: "Assumptions",
  },
  {
    key: "deal_terms.floor_multiple",
    label: "Floor multiple",
    unit: "number",
    control: "kiosk",
    simpleDefinition: "The minimum return multiple allowed at settlement.",
    impact: "It protects one side from getting too little back if the home performs poorly.",
    formula: "settlement_multiple = max(floor_multiple, raw_multiple) (then capped by ceiling)",
    anchors: [
      { label: "1.00\u00d7", value: 1.0 },
      { label: "1.05\u00d7", value: 1.05 },
      { label: "1.10\u00d7", value: 1.1 },
      { label: "1.20\u00d7", value: 1.2 },
    ],
    recommendedRange: { min: 1.0, max: 1.2 },
    hardRange: { min: 0.5, max: 2.0 },
    sectionHint: "Protections",
  },
  {
    key: "deal_terms.ceiling_multiple",
    label: "Ceiling multiple",
    unit: "number",
    control: "kiosk",
    simpleDefinition: "The maximum return multiple allowed at settlement.",
    impact: "It caps outcomes so the settlement can't grow beyond the agreed maximum.",
    formula: "settlement_multiple = min(ceiling_multiple, settlement_multiple_after_floor)",
    anchors: [
      { label: "1.30\u00d7", value: 1.3 },
      { label: "1.50\u00d7", value: 1.5 },
      { label: "1.75\u00d7", value: 1.75 },
      { label: "2.00\u00d7", value: 2.0 },
    ],
    recommendedRange: { min: 1.3, max: 2.0 },
    hardRange: { min: 1.0, max: 3.0 },
    sectionHint: "Protections",
  },
  {
    key: "deal_terms.downside_mode",
    label: "Downside protection",
    unit: "enum",
    control: "enum",
    simpleDefinition: "A rule for what happens if the home value goes down.",
    impact: "It changes how the floor is enforced and how downside risk is shared.",
    formula: "downside_mode adjusts settlement floor rules in negative scenarios (conceptual)",
    options: [
      { label: "Hard floor", value: "HARD_FLOOR" },
      { label: "No floor", value: "NO_FLOOR" },
    ],
    sectionHint: "Protections",
  },
  {
    key: "deal_terms.payback_window_start_year",
    label: "Payback window start",
    unit: "years",
    control: "kiosk",
    simpleDefinition: "When the 'timing window' starts.",
    impact: "Timing rules can change equity earned depending on when payments happen in this window.",
    formula: "window_start_month = floor(payback_window_start_year * 12)",
    anchors: [
      { label: "0", value: 0 },
      { label: "1", value: 1 },
      { label: "2", value: 2 },
      { label: "3", value: 3 },
    ],
    recommendedRange: { min: 0, max: 3 },
    hardRange: { min: 0, max: 30 },
    sectionHint: "Protections",
  },
  {
    key: "deal_terms.payback_window_end_year",
    label: "Payback window end",
    unit: "years",
    control: "kiosk",
    simpleDefinition: "When the 'timing window' ends.",
    impact: "It defines how long timing adjustments can apply to equity earned.",
    formula: "window_end_month = floor(payback_window_end_year * 12)",
    anchors: [
      { label: "3", value: 3 },
      { label: "5", value: 5 },
      { label: "7", value: 7 },
      { label: "10", value: 10 },
    ],
    recommendedRange: { min: 3, max: 10 },
    hardRange: { min: 0, max: 30 },
    sectionHint: "Protections",
  },
  {
    key: "deal_terms.timing_factor_early",
    label: "Timing factor (early)",
    unit: "number",
    control: "kiosk",
    simpleDefinition: "A multiplier that can reward earlier payments (inside the timing window).",
    impact: "It can increase or decrease equity earned for payments made earlier in the window.",
    formula: "equity_adjusted_m = equity_m * timing_factor_early (when 'early' in window)",
    anchors: [
      { label: "0.90\u00d7", value: 0.9 },
      { label: "1.00\u00d7", value: 1.0 },
      { label: "1.10\u00d7", value: 1.1 },
      { label: "1.20\u00d7", value: 1.2 },
    ],
    recommendedRange: { min: 0.9, max: 1.2 },
    hardRange: { min: 0.5, max: 2.0 },
    sectionHint: "Protections",
  },
  {
    key: "deal_terms.timing_factor_late",
    label: "Timing factor (late)",
    unit: "number",
    control: "kiosk",
    simpleDefinition: "A multiplier that can reward or penalize later payments (inside the timing window).",
    impact: "It can increase or decrease equity earned for payments made later in the window.",
    formula: "equity_adjusted_m = equity_m * timing_factor_late (when 'late' in window)",
    anchors: [
      { label: "0.80\u00d7", value: 0.8 },
      { label: "0.90\u00d7", value: 0.9 },
      { label: "1.00\u00d7", value: 1.0 },
      { label: "1.10\u00d7", value: 1.1 },
    ],
    recommendedRange: { min: 0.8, max: 1.1 },
    hardRange: { min: 0.5, max: 2.0 },
    sectionHint: "Protections",
  },
  {
    key: "deal_terms.minimum_hold_years",
    label: "Minimum hold (years)",
    unit: "years",
    control: "kiosk",
    simpleDefinition: "The shortest time the deal must stay active before it can end.",
    impact: "It prevents very early exits and can change settlement timing and outcomes.",
    formula: "minimum_hold_month = floor(minimum_hold_years * 12) (conceptual constraint)",
    anchors: [
      { label: "1", value: 1 },
      { label: "2", value: 2 },
      { label: "3", value: 3 },
      { label: "5", value: 5 },
    ],
    recommendedRange: { min: 0, max: 3 },
    hardRange: { min: 0, max: 10 },
    sectionHint: "Ownership",
  },
  {
    key: "deal_terms.contract_maturity_years",
    label: "Contract maturity (years)",
    unit: "years",
    control: "kiosk",
    simpleDefinition: "The maximum time the agreement can run before it must settle or convert.",
    impact: "It defines a hard endpoint so deals can't run forever.",
    formula: "maturity_month = floor(contract_maturity_years * 12) (conceptual limit)",
    anchors: [
      { label: "5", value: 5 },
      { label: "7", value: 7 },
      { label: "10", value: 10 },
      { label: "15", value: 15 },
    ],
    recommendedRange: { min: 5, max: 15 },
    hardRange: { min: 1, max: 30 },
    sectionHint: "Ownership",
  },
  {
    key: "deal_terms.liquidity_trigger_year",
    label: "Liquidity trigger year",
    unit: "years",
    control: "kiosk",
    simpleDefinition: "The year when a liquidity event can be triggered.",
    impact: "It sets when the deal may allow early buyout or conversion options.",
    formula: "liquidity_trigger_month = floor(liquidity_trigger_year * 12) (conceptual threshold)",
    anchors: [
      { label: "5", value: 5 },
      { label: "10", value: 10 },
      { label: "15", value: 15 },
      { label: "20", value: 20 },
    ],
    recommendedRange: { min: 5, max: 20 },
    hardRange: { min: 1, max: 30 },
    sectionHint: "Ownership",
  },
  {
    key: "deal_terms.platform_fee",
    label: "Platform fee (system)",
    unit: "currency",
    control: "readonly",
    readOnly: true,
    simpleDefinition: "A fee paid to FractPath for running the deal.",
    impact: "This is set by the system and reduces the net proceeds at settlement.",
    formula: "net_settlement = gross_settlement - platform_fee (conceptual)",
    recommendedRange: { min: 0, max: 5_000 },
    hardRange: { min: 0, max: 50_000 },
    sectionHint: "Fees",
  },
  {
    key: "deal_terms.servicing_fee_monthly",
    label: "Servicing fee (monthly)",
    unit: "currency",
    control: "readonly",
    readOnly: true,
    simpleDefinition: "A monthly fee for servicing the deal.",
    impact: "It accumulates over the life of the deal and reduces net investor returns.",
    formula: "servicing_total = servicing_fee_monthly * payments_made_by_exit",
    recommendedRange: { min: 0, max: 100 },
    hardRange: { min: 0, max: 500 },
    sectionHint: "Fees",
  },
  {
    key: "deal_terms.exit_fee_pct",
    label: "Exit fee (%) (system)",
    unit: "percent",
    control: "readonly",
    readOnly: true,
    simpleDefinition: "A fee charged when the deal ends (as a percent).",
    impact: "This is set by the system and reduces the net settlement at exit.",
    formula: "exit_fee = exit_fee_pct * gross_settlement; net_settlement = gross_settlement - exit_fee",
    recommendedRange: { min: 0.0, max: 0.02 },
    hardRange: { min: 0.0, max: 0.1 },
    sectionHint: "Fees",
  },
  {
    key: "deal_terms.realtor_representation_mode",
    label: "Realtor representation",
    unit: "enum",
    control: "enum",
    simpleDefinition: "Whether a realtor is involved and which side they represent.",
    impact: "It determines if a realtor commission applies and how it is allocated.",
    formula: "if mode = NONE then realtor_commission_pct is treated as 0 in compute",
    options: [
      { label: "None", value: "NONE" },
      { label: "Buyer", value: "BUYER" },
      { label: "Seller", value: "SELLER" },
      { label: "Dual", value: "DUAL" },
    ],
    sectionHint: "Fees",
  },
  {
    key: "deal_terms.realtor_commission_pct",
    label: "Realtor commission (%)",
    unit: "percent",
    control: "kiosk",
    simpleDefinition: "The percentage paid to the realtor for their services.",
    impact: "It reduces net proceeds. Capped at 6%. Must be 0 when representation is NONE.",
    formula: "commission_amount = realtor_commission_pct * settlement_value (conceptual, per payment event)",
    anchors: [
      { label: "0%", value: 0 },
      { label: "2%", value: 0.02 },
      { label: "3%", value: 0.03 },
      { label: "6%", value: 0.06 },
    ],
    recommendedRange: { min: 0, max: 0.06 },
    hardRange: { min: 0, max: 0.06 },
    sectionHint: "Fees",
  },
  {
    key: "deal_terms.realtor_commission_payment_mode",
    label: "Commission payment mode",
    unit: "enum",
    control: "readonly",
    readOnly: true,
    simpleDefinition: "How and when the realtor commission is paid.",
    impact: "Locked to per-payment-event: commission is deducted at each payment event.",
    formula: "realtor_commission_payment_mode = PER_PAYMENT_EVENT (locked in v10.2)",
    options: [
      { label: "Per payment event", value: "PER_PAYMENT_EVENT" },
    ],
    sectionHint: "Fees",
  },
  {
    key: "deal_terms.duration_yield_floor_enabled",
    label: "Duration Yield Floor (enabled)",
    unit: "enum",
    control: "enum",
    simpleDefinition: "Whether the Duration Yield Floor protection is active.",
    impact: "When enabled, it can raise settlement above the ceiling for long-duration deals.",
    formula: "if enabled AND exit_year >= start_year, DYF may override standard ceiling",
    options: [
      { label: "Disabled", value: "false" },
      { label: "Enabled", value: "true" },
    ],
    sectionHint: "Protections",
  },
  {
    key: "deal_terms.duration_yield_floor_start_year",
    label: "DYF start year",
    unit: "years",
    control: "kiosk",
    simpleDefinition: "The year when Duration Yield Floor protection kicks in.",
    impact: "After this year, the DYF minimum return guarantee becomes active.",
    formula: "DYF activates if exit_year >= duration_yield_floor_start_year",
    anchors: [
      { label: "5", value: 5 },
      { label: "7", value: 7 },
      { label: "10", value: 10 },
      { label: "15", value: 15 },
    ],
    recommendedRange: { min: 5, max: 15 },
    hardRange: { min: 1, max: 30 },
    sectionHint: "Protections",
  },
  {
    key: "deal_terms.duration_yield_floor_min_multiple",
    label: "DYF minimum multiple",
    unit: "number",
    control: "kiosk",
    simpleDefinition: "The minimum return multiple guaranteed by the Duration Yield Floor.",
    impact: "If DYF activates, settlement cannot be below invested_capital * this multiple.",
    formula: "dyf_floor_amount = invested_capital_total * duration_yield_floor_min_multiple",
    anchors: [
      { label: "1.50\u00d7", value: 1.5 },
      { label: "1.75\u00d7", value: 1.75 },
      { label: "2.00\u00d7", value: 2.0 },
      { label: "2.50\u00d7", value: 2.5 },
    ],
    recommendedRange: { min: 1.2, max: 3.0 },
    hardRange: { min: 1.0, max: 5.0 },
    sectionHint: "Protections",
  },
  {
    key: "__disclosure__",
    label: "Disclosures & assumptions",
    unit: "info",
    control: "info",
    simpleDefinition: "These numbers are estimates based on the inputs you choose.",
    impact:
      "Projections depend on home prices, timing, fees, and rules like floors/ceilings\u2014real outcomes can be different.",
    formula:
      "Model uses: FMV + appreciation assumption + monthly equity purchase + settlement rules (floors/ceilings/fees). Not financial advice; projections aren't guarantees.",
    sectionHint: "Assumptions",
  },
];

export function getFieldMeta(key: FieldKey): FieldMeta | undefined {
  return FIELD_META.find((f) => f.key === key);
}

export function computeDynamicAnchors(
  meta: FieldMeta,
  propertyValue: number
): Anchor[] {
  const dpa = meta.dynamicPercentAnchors;
  if (!dpa) return meta.anchors ?? [];

  return dpa.percents.map((pct) => {
    let raw = pct * propertyValue;
    if (dpa.maxPercentOfSource != null) {
      raw = Math.min(raw, dpa.maxPercentOfSource * propertyValue);
    }
    const rounded = Math.round(raw / 100) * 100;
    const value = dpa.min != null ? Math.max(dpa.min, rounded) : rounded;
    const label = `$${value.toLocaleString("en-US")}`;
    return { label, value };
  });
}
