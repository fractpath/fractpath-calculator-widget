import type { DraftCanonicalInputs, FieldErrors } from "./types.js";

export function validateDraft(draft: DraftCanonicalInputs): FieldErrors {
  const errors: FieldErrors = {};
  const { deal_terms, scenario } = draft;

  if (deal_terms.property_value <= 0) {
    errors["deal_terms.property_value"] = "Property value must be greater than 0";
  }
  if (deal_terms.upfront_payment < 0) {
    errors["deal_terms.upfront_payment"] = "Upfront payment cannot be negative";
  }
  if (deal_terms.monthly_payment < 0) {
    errors["deal_terms.monthly_payment"] = "Monthly payment cannot be negative";
  }
  if (deal_terms.number_of_payments < 0) {
    errors["deal_terms.number_of_payments"] = "Number of payments cannot be negative";
  }
  if (scenario.exit_year <= 0) {
    errors["scenario.exit_year"] = "Exit year must be greater than 0";
  }
  if (scenario.annual_appreciation < -0.5 || scenario.annual_appreciation > 0.5) {
    errors["scenario.annual_appreciation"] = "Annual appreciation must be between -50% and 50%";
  }

  if (
    deal_terms.realtor_commission_pct !== undefined &&
    (deal_terms.realtor_commission_pct < 0 || deal_terms.realtor_commission_pct > 0.06)
  ) {
    errors["deal_terms.realtor_commission_pct"] =
      "Realtor commission must be between 0% and 6%";
  }

  if (
    deal_terms.realtor_representation_mode === "NONE" &&
    deal_terms.realtor_commission_pct !== undefined &&
    deal_terms.realtor_commission_pct !== 0
  ) {
    errors["deal_terms.realtor_commission_pct"] =
      "Commission must be 0% when representation mode is NONE";
  }

  return errors;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
