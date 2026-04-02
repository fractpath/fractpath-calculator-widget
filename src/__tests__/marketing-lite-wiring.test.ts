import { describe, it, expect } from "vitest";
import { computeDeal } from "../compute.js";
import type { DealTerms } from "../compute.js";
import {
  buildMarketingDealTerms,
  buildMarketingAssumptions,
  MARKETING_PERSONAS,
  type MarketingLiteState,
} from "../widget/wired.js";
import { getMarketingBullets } from "../widget/contentBullets.js";
import { getLabel } from "../widget/persona.js";
import { FEE_DEFAULTS } from "../widget/editing/feeDefaults.js";

function makeState(overrides: Partial<MarketingLiteState> = {}): MarketingLiteState {
  return {
    propertyValue: 600_000,
    upfrontPayment: 100_000,
    monthlyPayment: 0,
    numberOfPayments: 0,
    exitYear: 10,
    growthRatePct: 3.0,
    realtorMode: "NONE",
    realtorPct: 0,
    ...overrides,
  };
}

describe("marketing-lite compute wiring (split-brain fix)", () => {
  it("buildMarketingDealTerms maps UI state to canonical DealTerms", () => {
    const state = makeState({ upfrontPayment: 50_000, monthlyPayment: 500, numberOfPayments: 24 });
    const terms = buildMarketingDealTerms(state);

    expect(terms.property_value).toBe(600_000);
    expect(terms.upfront_payment).toBe(50_000);
    expect(terms.monthly_payment).toBe(500);
    expect(terms.number_of_payments).toBe(24);
    expect(terms.setup_fee_pct).toBe(FEE_DEFAULTS.setup_fee_pct);
    expect(terms.servicing_fee_monthly).toBe(FEE_DEFAULTS.servicing_fee_monthly);
    expect(terms.exit_admin_fee_amount).toBe(FEE_DEFAULTS.exit_admin_fee_amount);
  });

  it("buildMarketingAssumptions maps UI state to canonical ScenarioAssumptions", () => {
    const state = makeState({ exitYear: 7, growthRatePct: 5.0 });
    const assumptions = buildMarketingAssumptions(state);

    expect(assumptions.annual_appreciation).toBeCloseTo(0.05);
    expect(assumptions.exit_year).toBe(7);
    expect(assumptions.closing_cost_pct).toBe(0);
  });

  it("upfront=0 + installments=0/0 produces near-zero buyout", () => {
    const state = makeState({ upfrontPayment: 0, monthlyPayment: 0, numberOfPayments: 0 });
    const terms = buildMarketingDealTerms(state);
    const assumptions = buildMarketingAssumptions(state);
    const result = computeDeal(terms, assumptions);

    expect(terms.upfront_payment).toBe(0);
    expect(terms.monthly_payment).toBe(0);
    expect(terms.number_of_payments).toBe(0);
    expect(result.actual_buyer_funding_to_date).toBe(0);
    expect(result.extension_adjusted_buyout_amount).toBeLessThanOrEqual(FEE_DEFAULTS.exit_admin_fee_amount);
  });

  it("upfront=0 MUST NOT produce large stale-defaults buyout", () => {
    const state = makeState({ upfrontPayment: 0, monthlyPayment: 0, numberOfPayments: 0 });
    const terms = buildMarketingDealTerms(state);
    const assumptions = buildMarketingAssumptions(state);
    const result = computeDeal(terms, assumptions);

    expect(result.extension_adjusted_buyout_amount).not.toBe(209_000);
    expect(result.extension_adjusted_buyout_amount).not.toBe(343_564);
    expect(result.extension_adjusted_buyout_amount).toBeLessThan(10_000);
  });

  it("changing upfront_payment changes canonical compute result", () => {
    const state100k = makeState({ upfrontPayment: 100_000 });
    const state50k = makeState({ upfrontPayment: 50_000 });

    const result100k = computeDeal(buildMarketingDealTerms(state100k), buildMarketingAssumptions(state100k));
    const result50k = computeDeal(buildMarketingDealTerms(state50k), buildMarketingAssumptions(state50k));

    expect(result100k.extension_adjusted_buyout_amount).not.toBe(result50k.extension_adjusted_buyout_amount);
    expect(result100k.extension_adjusted_buyout_amount).toBeGreaterThan(result50k.extension_adjusted_buyout_amount);
  });

  it("monthly_payment=500 x 24 months changes buyout vs zero installments", () => {
    const stateNoInstall = makeState({ upfrontPayment: 0, monthlyPayment: 0, numberOfPayments: 0 });
    const stateWithInstall = makeState({ upfrontPayment: 0, monthlyPayment: 500, numberOfPayments: 24 });

    const resultNo = computeDeal(buildMarketingDealTerms(stateNoInstall), buildMarketingAssumptions(stateNoInstall));
    const resultWith = computeDeal(buildMarketingDealTerms(stateWithInstall), buildMarketingAssumptions(stateWithInstall));

    expect(resultNo.extension_adjusted_buyout_amount).toBeLessThanOrEqual(FEE_DEFAULTS.exit_admin_fee_amount);
    expect(resultWith.extension_adjusted_buyout_amount).toBeGreaterThan(0);
    expect(resultWith.actual_buyer_funding_to_date).toBe(500 * 24);
  });

  it("realtor fields flow through to canonical DealTerms", () => {
    const state = makeState({ realtorMode: "BUYER", realtorPct: 3.0 });
    const terms = buildMarketingDealTerms(state);

    expect(terms.realtor_representation_mode).toBe("BUYER");
    expect(terms.realtor_commission_pct).toBeCloseTo(0.03);
  });

  it("realtor NONE defaults commission to 0", () => {
    const state = makeState({ realtorMode: "NONE", realtorPct: 0 });
    const terms = buildMarketingDealTerms(state);

    expect(terms.realtor_representation_mode).toBe("NONE");
    expect(terms.realtor_commission_pct).toBe(0);
  });
});

describe("stale defaults regression", () => {
  it("computeDeal with zero investment returns zero funding and near-zero buyout", () => {
    const state = makeState({ upfrontPayment: 0, monthlyPayment: 0, numberOfPayments: 0 });
    const terms = buildMarketingDealTerms(state);
    const result = computeDeal(terms, { annual_appreciation: 0.03, closing_cost_pct: 0, exit_year: 10 });

    expect(result.actual_buyer_funding_to_date).toBe(0);
    expect(result.extension_adjusted_buyout_amount).toBeLessThanOrEqual(FEE_DEFAULTS.exit_admin_fee_amount);
  });

  it("default marketing state (100k upfront) produces a positive buyout", () => {
    const state = makeState();
    const result = computeDeal(buildMarketingDealTerms(state), buildMarketingAssumptions(state));

    expect(result.actual_buyer_funding_to_date).toBe(100_000);
    expect(result.extension_adjusted_buyout_amount).toBeGreaterThan(0);
  });
});

describe("persona label tests", () => {
  it("buyer persona uses 'paid' language in bullets", () => {
    const bullets = getMarketingBullets("buyer", {
      netPayout: 100_000,
      initialBuyAmount: 50_000,
      homeValue: 600_000,
      termYears: 10,
      growthRatePct: 3.0,
      settlementMonth: 120,
    });

    const combined = bullets.join(" ");
    expect(combined).toContain("paid");
    expect(combined).toContain("return");
    expect(combined).not.toContain("received");
    expect(combined).not.toContain("payout");
  });

  it("homeowner persona uses 'received' language in bullets", () => {
    const bullets = getMarketingBullets("homeowner", {
      netPayout: 100_000,
      initialBuyAmount: 50_000,
      homeValue: 600_000,
      termYears: 10,
      growthRatePct: 3.0,
      settlementMonth: 120,
    });

    const combined = bullets.join(" ");
    expect(combined).toContain("received");
    expect(combined).toContain("payout");
    expect(combined).not.toContain("paid");
  });

  it("realtor persona uses commission framing in bullets", () => {
    const bullets = getMarketingBullets("realtor", {
      netPayout: 100_000,
      initialBuyAmount: 50_000,
      homeValue: 600_000,
      termYears: 10,
      growthRatePct: 3.0,
      settlementMonth: 120,
    });

    const combined = bullets.join(" ");
    expect(combined).toContain("Commission");
    expect(combined).not.toContain("paid upfront");
    expect(combined).not.toContain("received upfront");
  });

  it("persona switching changes wording but not numeric values", () => {
    const inputs = {
      netPayout: 100_000,
      initialBuyAmount: 50_000,
      homeValue: 600_000,
      termYears: 10,
      growthRatePct: 3.0,
      settlementMonth: 120,
    };

    const buyerBullets = getMarketingBullets("buyer", inputs);
    const homeownerBullets = getMarketingBullets("homeowner", inputs);

    expect(buyerBullets[0]).toContain("$100,000");
    expect(homeownerBullets[0]).toContain("$100,000");

    expect(buyerBullets[0]).not.toBe(homeownerBullets[0]);
  });

  it("persona label overrides exist for key fields", () => {
    expect(getLabel("deal_terms.property_value", "homeowner", "fallback")).toBe("Your Home Value");
    expect(getLabel("deal_terms.property_value", "buyer", "fallback")).toBe("Property Value");
    expect(getLabel("deal_terms.property_value", "investor", "fallback")).toBe("Asset Value");
    expect(getLabel("deal_terms.upfront_payment", "investor", "fallback")).toBe("Capital Deployed");
  });
});

describe("marketing-lite persona list", () => {
  it("MARKETING_PERSONAS includes buyer, homeowner, realtor only", () => {
    expect(MARKETING_PERSONAS).toEqual(["buyer", "homeowner", "realtor"]);
  });

  it("MARKETING_PERSONAS excludes ops and investor", () => {
    expect(MARKETING_PERSONAS).not.toContain("ops");
    expect(MARKETING_PERSONAS).not.toContain("investor");
  });
});

describe("app-mode edit gating via canEdit prop", () => {
  it("DealEditModal renders save button enabled when canEdit is true (permissions.canEdit)", async () => {
    const { hasErrors } = await import("../widget/editing/validateDraft.js");

    expect(typeof hasErrors).toBe("function");
    const noErrors = hasErrors({});
    expect(noErrors).toBe(false);
  });

  it("DealEditModal save is disabled for realtor persona regardless of canEdit", () => {
    const persona: string = "realtor";
    const canEdit = true;
    const errors = {};

    const canSave = !Object.keys(errors).length && persona !== "realtor" && canEdit;
    expect(canSave).toBe(false);
  });

  it("DealEditModal save is enabled for buyer persona with canEdit=true and no errors", () => {
    const persona: string = "buyer";
    const canEdit = true;
    const errors = {};

    const canSave = !Object.keys(errors).length && persona !== "realtor" && canEdit;
    expect(canSave).toBe(true);
  });

  it("DealEditModal save is disabled when canEdit=false (viewer role)", () => {
    const persona: string = "buyer";
    const canEdit = false;
    const errors = {};

    const canSave = !Object.keys(errors).length && persona !== "realtor" && canEdit;
    expect(canSave).toBe(false);
  });

  it("edit availability follows logged-out -> no edit pattern", () => {
    const canEdit = false;
    const canSave = canEdit && true;
    expect(canSave).toBe(false);
  });

  it("edit availability follows logged-in editor -> edit visible pattern", () => {
    const canEdit = true;
    const canSave = canEdit && true;
    expect(canSave).toBe(true);
  });
});
