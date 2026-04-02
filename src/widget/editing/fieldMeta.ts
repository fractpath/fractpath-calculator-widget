import { formatCurrency } from "../format.js";export type Unit =
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
  | "deal_terms.minimum_hold_years"
  | "deal_terms.contract_maturity_years"
  | "deal_terms.target_exit_year"
  | "deal_terms.first_extension_premium_pct"
  | "deal_terms.second_extension_premium_pct"
  | "deal_terms.partial_buyout_allowed"
  | "deal_terms.setup_fee_pct"
  | "deal_terms.servicing_fee_monthly"
  | "deal_terms.payment_admin_fee"
  | "deal_terms.exit_admin_fee_amount"
  | "deal_terms.realtor_representation_mode"
  | "deal_terms.realtor_commission_pct"
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
    impact: "It affects how much funding is provided and how future appreciation is shared.",
    formula:
      "total_scheduled_buyer_funding = upfront_payment + monthly_payment * number_of_payments",
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
    impact: "It funds the homeowner at closing and contributes to the total scheduled funding.",
    formula:
      "total_scheduled_buyer_funding = upfront_payment + monthly_payment * number_of_payments",
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
    impact: "Monthly payments add to total scheduled funding and affect the funding completion factor.",
    formula: "total_scheduled_buyer_funding = upfront_payment + monthly_payment * number_of_payments",
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
    impact: "More months means more total funding and a higher funding completion factor.",
    formula: "actual_buyer_funding_to_date = upfront_payment + monthly_payment * payments_made_by_exit",
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
    impact: "It changes the projected home value and the appreciation share at buyout.",
    formula: "projected_fmv = property_value * (1 + annual_appreciation)^exit_year",
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
    simpleDefinition: "When the scenario models buyout (like 5 years).",
    impact: "It determines which contract window applies and whether extension premiums are included.",
    formula:
      "current_window = classify(exit_year vs target_exit_window, extensions, long_stop_year)",
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
    impact: "Closing costs reduce the net proceeds at exit and can reduce the effective buyout amount.",
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
    key: "deal_terms.minimum_hold_years",
    label: "Minimum hold (years)",
    unit: "years",
    control: "kiosk",
    simpleDefinition: "The shortest time the deal must stay active before it can end.",
    impact: "It prevents very early exits and sets the floor on the contract timeline.",
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
      { label: "10", value: 10 },
      { label: "15", value: 15 },
      { label: "30", value: 30 },
    ],
    recommendedRange: { min: 5, max: 30 },
    hardRange: { min: 1, max: 50 },
    sectionHint: "Ownership",
  },
  {
    key: "deal_terms.target_exit_year",
    label: "Target exit year",
    unit: "years",
    control: "kiosk",
    simpleDefinition: "The year FractPath and the homeowner are targeting for a standard buyout.",
    impact: "It defines the target window and determines whether extension premiums apply at buyout.",
    formula: "current_window depends on exit_year vs target_exit_window_start/end and extensions",
    anchors: [
      { label: "5", value: 5 },
      { label: "7", value: 7 },
      { label: "10", value: 10 },
      { label: "15", value: 15 },
    ],
    recommendedRange: { min: 3, max: 15 },
    hardRange: { min: 1, max: 30 },
    sectionHint: "Ownership",
  },
  {
    key: "deal_terms.first_extension_premium_pct",
    label: "First extension premium (%)",
    unit: "percent",
    control: "kiosk",
    simpleDefinition: "Extra percentage added to the buyout if the deal runs into the first extension window.",
    impact: "A higher premium increases the buyout amount for late exits, compensating FractPath for the extended hold.",
    formula: "extension_adjusted_buyout = base_buyout * (1 + premium_pct) if in first extension window",
    anchors: [
      { label: "0%", value: 0.0 },
      { label: "3%", value: 0.03 },
      { label: "5%", value: 0.05 },
      { label: "8%", value: 0.08 },
    ],
    recommendedRange: { min: 0.0, max: 0.1 },
    hardRange: { min: 0.0, max: 0.5 },
    sectionHint: "Exit Terms",
  },
  {
    key: "deal_terms.second_extension_premium_pct",
    label: "Second extension premium (%)",
    unit: "percent",
    control: "kiosk",
    simpleDefinition: "Extra percentage added to the buyout if the deal runs into the second extension window.",
    impact: "A higher premium further increases the buyout for very late exits.",
    formula: "extension_adjusted_buyout = base_buyout * (1 + premium_pct) if in second extension window",
    anchors: [
      { label: "0%", value: 0.0 },
      { label: "5%", value: 0.05 },
      { label: "8%", value: 0.08 },
      { label: "12%", value: 0.12 },
    ],
    recommendedRange: { min: 0.0, max: 0.15 },
    hardRange: { min: 0.0, max: 0.5 },
    sectionHint: "Exit Terms",
  },
  {
    key: "deal_terms.partial_buyout_allowed",
    label: "Partial buyout allowed",
    unit: "enum",
    control: "enum",
    simpleDefinition: "Whether the homeowner can buy out FractPath's stake in portions rather than all at once.",
    impact: "When enabled, partial buyouts at 25%, 50%, or 75% of the total stake become available.",
    formula: "partial_buyout_amount_N = base_buyout * N (fractional, if allowed)",
    options: [
      { label: "Not allowed", value: "false" },
      { label: "Allowed", value: "true" },
    ],
    sectionHint: "Exit Terms",
  },
  {
    key: "deal_terms.setup_fee_pct",
    label: "Setup fee (%)",
    unit: "percent",
    control: "readonly",
    readOnly: true,
    simpleDefinition: "A one-time fee at closing, calculated as a percent of the upfront payment.",
    impact: "This is set by the system and is deducted from the setup fee calculation.",
    formula: "setup_fee = clamp(upfront_payment * setup_fee_pct, setup_fee_floor, setup_fee_cap)",
    recommendedRange: { min: 0.0, max: 0.05 },
    hardRange: { min: 0.0, max: 0.1 },
    sectionHint: "Fees",
  },
  {
    key: "deal_terms.servicing_fee_monthly",
    label: "Servicing fee (monthly)",
    unit: "currency",
    control: "readonly",
    readOnly: true,
    simpleDefinition: "A monthly fee for servicing the deal.",
    impact: "It accumulates over the life of the deal and adds to FractPath's revenue.",
    formula: "fractpath_revenue_to_date = setup_fee + servicing_fee_monthly * months_elapsed + ...",
    recommendedRange: { min: 0, max: 100 },
    hardRange: { min: 0, max: 500 },
    sectionHint: "Fees",
  },
  {
    key: "deal_terms.payment_admin_fee",
    label: "Payment admin fee ($)",
    unit: "currency",
    control: "readonly",
    readOnly: true,
    simpleDefinition: "A flat fee charged per monthly payment event.",
    impact: "This is set by the system and adds to FractPath's total revenue over the deal term.",
    formula: "payment_admin_total = payment_admin_fee * payments_made_by_exit",
    recommendedRange: { min: 0, max: 25 },
    hardRange: { min: 0, max: 100 },
    sectionHint: "Fees",
  },
  {
    key: "deal_terms.exit_admin_fee_amount",
    label: "Exit admin fee ($)",
    unit: "currency",
    control: "readonly",
    readOnly: true,
    simpleDefinition: "A flat administrative fee charged when the deal exits.",
    impact: "This is set by the system and reduces net proceeds at settlement.",
    formula: "fractpath_revenue_to_date includes exit_admin_fee_amount at settlement",
    recommendedRange: { min: 0, max: 1_000 },
    hardRange: { min: 0, max: 5_000 },
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
    formula: "commission_amount = realtor_commission_pct * buyout_value (conceptual, at exit)",
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
    key: "__disclosure__",
    label: "Disclosures & assumptions",
    unit: "info",
    control: "info",
    simpleDefinition: "These numbers are estimates based on the inputs you choose.",
    impact:
      "Projections depend on home prices, timing, fees, and contract window classification\u2014real outcomes can be different.",
    formula:
      "Model uses: FMV + appreciation assumption + buyer funding schedule + window classification + extension premiums. Not financial advice; projections aren\u2019t guarantees.",
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
    const label = formatCurrency(value);
    return { label, value };
  });
}
