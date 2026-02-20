import type { CalculatorPersona } from "./types.js";
import type { ScenarioOutputs } from "../calc/types.js";
import type { FieldKey } from "./editing/fieldMeta.js";

export type PersonaConfig = {
  heroLabel: string;
  heroValue: (outputs: ScenarioOutputs) => number;
  helperText: string;
};

const configs: Record<CalculatorPersona, PersonaConfig> = {
  homeowner: {
    heroLabel: "Your Net Payout",
    heroValue: (o) => o.settlements.standard.netPayout,
    helperText: "Estimated net payout at standard settlement timing.",
  },
  buyer: {
    heroLabel: "Projected Net Return",
    heroValue: (o) => o.settlements.standard.netPayout,
    helperText: "Projected net return at standard settlement timing.",
  },
  investor: {
    heroLabel: "Projected Net Return",
    heroValue: (o) => o.settlements.standard.netPayout,
    helperText: "Projected net return at standard settlement timing.",
  },
  realtor: {
    heroLabel: "Standard Net Payout",
    heroValue: (o) => o.settlements.standard.netPayout,
    helperText: "Standard net payout for commission reference.",
  },
  ops: {
    heroLabel: "Standard Net Payout",
    heroValue: (o) => o.settlements.standard.netPayout,
    helperText: "Standard net payout at projected settlement.",
  },
};

export function getPersonaConfig(persona: CalculatorPersona): PersonaConfig {
  return configs[persona] ?? configs.homeowner;
}

const LABEL_OVERRIDES: Partial<Record<CalculatorPersona, Partial<Record<FieldKey, string>>>> = {
  homeowner: {
    "deal_terms.property_value": "Your Home Value",
    "deal_terms.upfront_payment": "Initial Payment",
    "scenario.exit_year": "When You'd Settle",
  },
  buyer: {
    "deal_terms.property_value": "Property Value",
    "deal_terms.upfront_payment": "Upfront Investment",
    "scenario.exit_year": "Target Exit Year",
  },
  investor: {
    "deal_terms.property_value": "Asset Value",
    "deal_terms.upfront_payment": "Capital Deployed",
    "scenario.exit_year": "Target Exit Year",
    "deal_terms.monthly_payment": "Monthly Tranche",
  },
  realtor: {
    "deal_terms.property_value": "Property Value",
    "deal_terms.upfront_payment": "Upfront Payment",
    "deal_terms.realtor_commission_pct": "Your Commission (%)",
    "deal_terms.realtor_representation_mode": "Your Representation",
  },
  ops: {
    "deal_terms.property_value": "Property Value (FMV)",
    "deal_terms.upfront_payment": "Upfront Payment",
  },
};

export function getLabel(fieldId: FieldKey, persona: CalculatorPersona, fallback: string): string {
  return LABEL_OVERRIDES[persona]?.[fieldId] ?? fallback;
}

type SummaryField = "hero" | "settlement_timing" | "net_payout" | "total_invested" | "fees";

const SUMMARY_ORDER: Record<CalculatorPersona, SummaryField[]> = {
  homeowner: ["hero", "net_payout", "settlement_timing", "total_invested", "fees"],
  buyer: ["hero", "net_payout", "total_invested", "settlement_timing", "fees"],
  investor: ["hero", "net_payout", "total_invested", "fees", "settlement_timing"],
  realtor: ["hero", "fees", "net_payout", "settlement_timing", "total_invested"],
  ops: ["hero", "net_payout", "fees", "total_invested", "settlement_timing"],
};

export function getSummaryOrder(persona: CalculatorPersona): SummaryField[] {
  return SUMMARY_ORDER[persona] ?? SUMMARY_ORDER.homeowner;
}
