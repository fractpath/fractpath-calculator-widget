import { describe, it, expect } from "vitest";
import { deriveTier1Preview } from "../deriveTier1Preview.js";
import { getDefaultDraftCanonicalInputs } from "../defaults.js";
import type { DraftCanonicalInputs } from "../types.js";

function makeDraft(
  overrides: {
    upfront_payment?: number;
    monthly_payment?: number;
    number_of_payments?: number;
    exit_year?: number;
  } = {}
): DraftCanonicalInputs {
  const d = getDefaultDraftCanonicalInputs();
  if (overrides.upfront_payment !== undefined)
    d.deal_terms.upfront_payment = overrides.upfront_payment;
  if (overrides.monthly_payment !== undefined)
    d.deal_terms.monthly_payment = overrides.monthly_payment;
  if (overrides.number_of_payments !== undefined)
    d.deal_terms.number_of_payments = overrides.number_of_payments;
  if (overrides.exit_year !== undefined)
    d.scenario.exit_year = overrides.exit_year;
  return d;
}

describe("deriveTier1Preview", () => {
  it("exit_year=1.5 → exitMonth=18, caps payments at 18", () => {
    const draft = makeDraft({
      monthly_payment: 1000,
      number_of_payments: 36,
      exit_year: 1.5,
    });
    const t1 = deriveTier1Preview(draft);
    expect(t1.totalInstallments).toBe(18_000);
  });

  it("payments_made_by_exit = min(number_of_payments, exitMonth)", () => {
    const draft = makeDraft({
      monthly_payment: 500,
      number_of_payments: 12,
      exit_year: 3,
    });
    const t1 = deriveTier1Preview(draft);
    expect(t1.totalInstallments).toBe(6_000);
  });

  it("totalCashPaid = upfront + totalInstallments", () => {
    const draft = makeDraft({
      upfront_payment: 50_000,
      monthly_payment: 1000,
      number_of_payments: 36,
      exit_year: 1.5,
    });
    const t1 = deriveTier1Preview(draft);
    expect(t1.totalCashPaid).toBe(68_000);
  });

  it("zero monthly payment → no installments", () => {
    const draft = makeDraft({
      upfront_payment: 50_000,
      monthly_payment: 0,
      number_of_payments: 0,
    });
    const t1 = deriveTier1Preview(draft);
    expect(t1.totalInstallments).toBe(0);
    expect(t1.installmentsLabel).toBe("No installments");
    expect(t1.totalCashPaid).toBe(50_000);
  });

  it("upfrontCash matches deal_terms.upfront_payment", () => {
    const draft = makeDraft({ upfront_payment: 75_000 });
    const t1 = deriveTier1Preview(draft);
    expect(t1.upfrontCash).toBe(75_000);
  });

  it("installmentsLabel shows payment count and amount", () => {
    const draft = makeDraft({
      monthly_payment: 500,
      number_of_payments: 24,
      exit_year: 10,
    });
    const t1 = deriveTier1Preview(draft);
    expect(t1.installmentsLabel).toBe("24 payments of $500");
  });

  it("exit_year floors fractional months correctly", () => {
    const draft = makeDraft({
      monthly_payment: 100,
      number_of_payments: 100,
      exit_year: 2.9,
    });
    const t1 = deriveTier1Preview(draft);
    const expectedMonths = Math.floor(2.9 * 12);
    expect(t1.totalInstallments).toBe(100 * expectedMonths);
  });

  it("number_of_payments < exit_month → capped at number_of_payments", () => {
    const draft = makeDraft({
      monthly_payment: 200,
      number_of_payments: 6,
      exit_year: 5,
    });
    const t1 = deriveTier1Preview(draft);
    expect(t1.totalInstallments).toBe(1_200);
  });
});
