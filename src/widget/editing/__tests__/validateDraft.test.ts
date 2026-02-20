import { describe, it, expect } from "vitest";
import { validateDraft, hasErrors } from "../validateDraft.js";
import { getDefaultDraftCanonicalInputs } from "../defaults.js";
import type { DraftCanonicalInputs } from "../types.js";

function makeDraft(
  overrides: Partial<{
    property_value: number;
    upfront_payment: number;
    monthly_payment: number;
    number_of_payments: number;
    exit_year: number;
    annual_appreciation: number;
  }> = {}
): DraftCanonicalInputs {
  const d = getDefaultDraftCanonicalInputs();
  if (overrides.property_value !== undefined)
    d.deal_terms.property_value = overrides.property_value;
  if (overrides.upfront_payment !== undefined)
    d.deal_terms.upfront_payment = overrides.upfront_payment;
  if (overrides.monthly_payment !== undefined)
    d.deal_terms.monthly_payment = overrides.monthly_payment;
  if (overrides.number_of_payments !== undefined)
    d.deal_terms.number_of_payments = overrides.number_of_payments;
  if (overrides.exit_year !== undefined)
    d.scenario.exit_year = overrides.exit_year;
  if (overrides.annual_appreciation !== undefined)
    d.scenario.annual_appreciation = overrides.annual_appreciation;
  return d;
}

describe("validateDraft", () => {
  it("default draft has no errors", () => {
    const errors = validateDraft(getDefaultDraftCanonicalInputs());
    expect(hasErrors(errors)).toBe(false);
  });

  it("property_value <= 0 is invalid", () => {
    const errors = validateDraft(makeDraft({ property_value: 0 }));
    expect(errors["deal_terms.property_value"]).toBeDefined();
    expect(hasErrors(errors)).toBe(true);
  });

  it("negative property_value is invalid", () => {
    const errors = validateDraft(makeDraft({ property_value: -100 }));
    expect(errors["deal_terms.property_value"]).toBeDefined();
  });

  it("negative upfront_payment is invalid", () => {
    const errors = validateDraft(makeDraft({ upfront_payment: -1 }));
    expect(errors["deal_terms.upfront_payment"]).toBeDefined();
  });

  it("zero upfront_payment is valid", () => {
    const errors = validateDraft(makeDraft({ upfront_payment: 0 }));
    expect(errors["deal_terms.upfront_payment"]).toBeUndefined();
  });

  it("negative monthly_payment is invalid", () => {
    const errors = validateDraft(makeDraft({ monthly_payment: -50 }));
    expect(errors["deal_terms.monthly_payment"]).toBeDefined();
  });

  it("negative number_of_payments is invalid", () => {
    const errors = validateDraft(makeDraft({ number_of_payments: -1 }));
    expect(errors["deal_terms.number_of_payments"]).toBeDefined();
  });

  it("exit_year <= 0 is invalid", () => {
    const errors = validateDraft(makeDraft({ exit_year: 0 }));
    expect(errors["scenario.exit_year"]).toBeDefined();
  });

  it("annual_appreciation 0.8 is invalid (exceeds 0.5)", () => {
    const errors = validateDraft(makeDraft({ annual_appreciation: 0.8 }));
    expect(errors["scenario.annual_appreciation"]).toBeDefined();
  });

  it("annual_appreciation -0.6 is invalid (below -0.5)", () => {
    const errors = validateDraft(makeDraft({ annual_appreciation: -0.6 }));
    expect(errors["scenario.annual_appreciation"]).toBeDefined();
  });

  it("annual_appreciation 0.5 is valid (boundary)", () => {
    const errors = validateDraft(makeDraft({ annual_appreciation: 0.5 }));
    expect(errors["scenario.annual_appreciation"]).toBeUndefined();
  });

  it("annual_appreciation -0.5 is valid (boundary)", () => {
    const errors = validateDraft(makeDraft({ annual_appreciation: -0.5 }));
    expect(errors["scenario.annual_appreciation"]).toBeUndefined();
  });

  it("multiple errors accumulate", () => {
    const errors = validateDraft(
      makeDraft({ property_value: -1, exit_year: 0, annual_appreciation: 1.0 })
    );
    expect(Object.keys(errors).length).toBe(3);
  });

  it("realtor_commission_pct > 0.06 is invalid", () => {
    const d = getDefaultDraftCanonicalInputs();
    d.deal_terms.realtor_representation_mode = "BUYER";
    d.deal_terms.realtor_commission_pct = 0.07;
    const errors = validateDraft(d);
    expect(errors["deal_terms.realtor_commission_pct"]).toBeDefined();
  });

  it("realtor_commission_pct = 0.06 is valid", () => {
    const d = getDefaultDraftCanonicalInputs();
    d.deal_terms.realtor_representation_mode = "BUYER";
    d.deal_terms.realtor_commission_pct = 0.06;
    const errors = validateDraft(d);
    expect(errors["deal_terms.realtor_commission_pct"]).toBeUndefined();
  });

  it("realtor_commission_pct > 0 when mode=NONE is invalid", () => {
    const d = getDefaultDraftCanonicalInputs();
    d.deal_terms.realtor_representation_mode = "NONE";
    d.deal_terms.realtor_commission_pct = 0.03;
    const errors = validateDraft(d);
    expect(errors["deal_terms.realtor_commission_pct"]).toBeDefined();
  });

  it("realtor_commission_pct = 0 when mode=NONE is valid", () => {
    const d = getDefaultDraftCanonicalInputs();
    d.deal_terms.realtor_representation_mode = "NONE";
    d.deal_terms.realtor_commission_pct = 0;
    const errors = validateDraft(d);
    expect(errors["deal_terms.realtor_commission_pct"]).toBeUndefined();
  });
});
