import { describe, it, expect } from "vitest";
import { computeDeal } from "../packages/compute/src/index.js";
import type { DealTerms, ScenarioAssumptions, DealResults } from "../packages/compute/src/index.js";
import {
  resolvePersonaPresentation,
} from "../widget/personaPresentation.js";

function makeDealTerms(overrides: Partial<DealTerms> = {}): DealTerms {
  return {
    property_value: 600_000,
    upfront_payment: 100_000,
    monthly_payment: 500,
    number_of_payments: 24,
    payback_window_start_year: 3,
    payback_window_end_year: 7,
    timing_factor_early: 1,
    timing_factor_late: 1,
    floor_multiple: 1.10,
    ceiling_multiple: 2.00,
    downside_mode: "HARD_FLOOR",
    contract_maturity_years: 30,
    liquidity_trigger_year: 13,
    minimum_hold_years: 2,
    platform_fee: 2500,
    servicing_fee_monthly: 49,
    exit_fee_pct: 0.01,
    realtor_representation_mode: "NONE",
    realtor_commission_pct: 0,
    realtor_commission_payment_mode: "PER_PAYMENT_EVENT",
    ...overrides,
  };
}

function makeAssumptions(overrides: Partial<ScenarioAssumptions> = {}): ScenarioAssumptions {
  return {
    annual_appreciation: 0.03,
    closing_cost_pct: 0,
    exit_year: 10,
    ...overrides,
  };
}

function getOutputs(terms?: DealTerms, assumptions?: ScenarioAssumptions): DealResults {
  return computeDeal(terms ?? makeDealTerms(), assumptions ?? makeAssumptions());
}

describe("persona hero metric selection", () => {
  const terms = makeDealTerms();
  const assumptions = makeAssumptions();
  const outputs = getOutputs(terms, assumptions);

  it("buyer hero uses investor_profit and label 'Projected Net Return'", () => {
    const result = resolvePersonaPresentation("buyer", terms, assumptions, outputs);
    expect(result.hero.label).toBe("Projected Net Return");
    expect(result.hero.value).toBe(outputs.investor_profit);
    expect(result.hero.valueFormat).toBe("currency");
  });

  it("homeowner hero uses invested_capital_total and label 'Lifetime Cash Unlocked'", () => {
    const result = resolvePersonaPresentation("homeowner", terms, assumptions, outputs);
    expect(result.hero.label).toBe("Lifetime Cash Unlocked");
    expect(result.hero.value).toBe(outputs.invested_capital_total);
    expect(result.hero.valueFormat).toBe("currency");
  });

  it("realtor hero uses realtor_fee_total_projected and label 'Projected Commission (Standard)'", () => {
    const realtorTerms = makeDealTerms({
      realtor_representation_mode: "BUYER",
      realtor_commission_pct: 0.03,
    });
    const realtorOutputs = getOutputs(realtorTerms);
    const result = resolvePersonaPresentation("realtor", realtorTerms, assumptions, realtorOutputs);
    expect(result.hero.label).toBe("Projected Commission (Standard)");
    expect(result.hero.value).toBe(realtorOutputs.realtor_fee_total_projected);
  });

  it("realtor hero value is NOT the buyer settlement (isa_settlement) when commission differs", () => {
    const realtorTerms = makeDealTerms({
      realtor_representation_mode: "BUYER",
      realtor_commission_pct: 0.03,
    });
    const realtorOutputs = getOutputs(realtorTerms);
    const result = resolvePersonaPresentation("realtor", realtorTerms, assumptions, realtorOutputs);

    expect(result.hero.value).toBe(realtorOutputs.realtor_fee_total_projected);
    expect(result.hero.value).not.toBe(realtorOutputs.isa_settlement);
  });

  it("investor persona falls back to buyer hero mapping", () => {
    const result = resolvePersonaPresentation("investor", terms, assumptions, outputs);
    expect(result.hero.label).toBe("Projected Net Return");
    expect(result.hero.value).toBe(outputs.investor_profit);
  });

  it("ops persona falls back to buyer hero mapping", () => {
    const result = resolvePersonaPresentation("ops", terms, assumptions, outputs);
    expect(result.hero.label).toBe("Projected Net Return");
    expect(result.hero.value).toBe(outputs.investor_profit);
  });
});

describe("persona strip chips", () => {
  const terms = makeDealTerms();
  const assumptions = makeAssumptions();
  const outputs = getOutputs(terms, assumptions);

  it("buyer strip has 5 chips with correct labels", () => {
    const result = resolvePersonaPresentation("buyer", terms, assumptions, outputs);
    expect(result.strip).toHaveLength(5);
    expect(result.strip.map(c => c.label)).toEqual([
      "Net payout at settlement",
      "Total cash paid",
      "Projected home value",
      "Implied equity share",
      "Return multiple",
    ]);
  });

  it("buyer strip values come from canonical outputs", () => {
    const result = resolvePersonaPresentation("buyer", terms, assumptions, outputs);
    expect(result.strip[0].value).toBe(outputs.isa_settlement);
    expect(result.strip[1].value).toBe(outputs.invested_capital_total);
    expect(result.strip[2].value).toBe(outputs.projected_fmv);
  });

  it("homeowner strip has 5 chips", () => {
    const result = resolvePersonaPresentation("homeowner", terms, assumptions, outputs);
    expect(result.strip).toHaveLength(5);
    expect(result.strip[0].label).toBe("Upfront cash received");
    expect(result.strip[0].value).toBe(terms.upfront_payment);
  });

  it("realtor strip has 4 chips", () => {
    const realtorTerms = makeDealTerms({
      realtor_representation_mode: "BUYER",
      realtor_commission_pct: 0.03,
    });
    const realtorOutputs = getOutputs(realtorTerms);
    const result = resolvePersonaPresentation("realtor", realtorTerms, assumptions, realtorOutputs);
    expect(result.strip).toHaveLength(4);
    expect(result.strip[2].label).toBe("Commission from this deal");
    expect(result.strip[2].value).toBe(realtorOutputs.realtor_fee_total_projected);
  });
});

describe("token integrity (derived values)", () => {
  const terms = makeDealTerms();
  const assumptions = makeAssumptions();
  const outputs = getOutputs(terms, assumptions);

  it("implied_equity_share_pct == isa_settlement / projected_fmv", () => {
    const result = resolvePersonaPresentation("buyer", terms, assumptions, outputs);
    const equityChip = result.strip.find(c => c.label === "Implied equity share");
    expect(equityChip).toBeDefined();
    const expected = outputs.isa_settlement / outputs.projected_fmv;
    expect(equityChip!.value).toBeCloseTo(expected, 6);
  });

  it("remaining_opportunity_value == projected_fmv - isa_settlement", () => {
    const realtorTerms = makeDealTerms({
      realtor_representation_mode: "BUYER",
      realtor_commission_pct: 0.03,
    });
    const realtorOutputs = getOutputs(realtorTerms);
    const result = resolvePersonaPresentation("realtor", realtorTerms, assumptions, realtorOutputs);
    const remainingChip = result.strip.find(c => c.label === "Remaining opportunity");
    expect(remainingChip).toBeDefined();
    const expected = realtorOutputs.projected_fmv - realtorOutputs.isa_settlement;
    expect(remainingChip!.value).toBeCloseTo(expected, 2);
  });

  it("implied_equity_share_pct handles zero projected_fmv gracefully", () => {
    const zeroTerms = makeDealTerms({ property_value: 0, upfront_payment: 0, monthly_payment: 0, number_of_payments: 0 });
    const zeroOutputs = getOutputs(zeroTerms);
    const result = resolvePersonaPresentation("buyer", zeroTerms, assumptions, zeroOutputs);
    const equityChip = result.strip.find(c => c.label === "Implied equity share");
    expect(equityChip).toBeDefined();
    expect(Number.isFinite(equityChip!.value)).toBe(true);
  });
});

describe("no-compute import in personaPresentation module", () => {
  it("personaPresentation.ts does not import compute engine", async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = await (import("fs") as Promise<typeof import("fs")>);
    const content = fs.readFileSync("src/widget/personaPresentation.ts", "utf-8");
    expect(content).not.toContain("computeDeal(");
    expect(content).not.toContain("computeScenario(");
  });

  it("personaPresentation.ts only imports types from compute", async () => {
    const fs = await (import("fs") as Promise<typeof import("fs")>);
    const content = fs.readFileSync("src/widget/personaPresentation.ts", "utf-8");
    const importLines = content.split("\n").filter((l: string) => l.includes("../packages/compute/src/index.js"));
    for (const line of importLines) {
      expect(line).toMatch(/import\s+type/);
    }
  });
});

describe("persona chart spec", () => {
  const terms = makeDealTerms();
  const assumptions = makeAssumptions();
  const outputs = getOutputs(terms, assumptions);

  it("buyer chart has 3 bars", () => {
    const result = resolvePersonaPresentation("buyer", terms, assumptions, outputs);
    expect(result.chartSpec.type).toBe("bar");
    expect(result.chartSpec.bars).toHaveLength(3);
    expect(result.chartSpec.bars[0].label).toBe("Total cash paid");
    expect(result.chartSpec.bars[1].label).toBe("Settlement payout");
    expect(result.chartSpec.bars[2].label).toBe("Projected home value");
  });

  it("homeowner chart has 2 bars", () => {
    const result = resolvePersonaPresentation("homeowner", terms, assumptions, outputs);
    expect(result.chartSpec.bars).toHaveLength(2);
    expect(result.chartSpec.bars[0].label).toBe("Cash unlocked");
    expect(result.chartSpec.bars[1].label).toBe("Projected home value");
  });

  it("realtor chart has 2 bars", () => {
    const realtorTerms = makeDealTerms({ realtor_representation_mode: "BUYER", realtor_commission_pct: 0.03 });
    const realtorOutputs = getOutputs(realtorTerms);
    const result = resolvePersonaPresentation("realtor", realtorTerms, assumptions, realtorOutputs);
    expect(result.chartSpec.bars).toHaveLength(2);
    expect(result.chartSpec.bars[0].label).toBe("Commission on this deal");
  });
});

describe("persona marketing bullets", () => {
  const terms = makeDealTerms();
  const assumptions = makeAssumptions();
  const outputs = getOutputs(terms, assumptions);

  it("buyer bullets mention equity, no financing, and growth assumption", () => {
    const result = resolvePersonaPresentation("buyer", terms, assumptions, outputs);
    expect(result.marketingBullets).toHaveLength(4);
    expect(result.marketingBullets[0]).toContain("equity built over");
    expect(result.marketingBullets[0]).toContain("no financing or interest");
    expect(result.marketingBullets[3]).toContain("annual appreciation");
  });

  it("homeowner bullets mention 'own your home' and monthly payments", () => {
    const result = resolvePersonaPresentation("homeowner", terms, assumptions, outputs);
    expect(result.marketingBullets).toHaveLength(4);
    expect(result.marketingBullets[0]).toContain("own your home");
    expect(result.marketingBullets[1]).toContain("Upfront:");
    expect(result.marketingBullets[1]).toContain("Monthly:");
  });

  it("realtor bullets mention commission and representation", () => {
    const realtorTerms = makeDealTerms({ realtor_representation_mode: "BUYER", realtor_commission_pct: 0.03 });
    const realtorOutputs = getOutputs(realtorTerms);
    const result = resolvePersonaPresentation("realtor", realtorTerms, assumptions, realtorOutputs);
    expect(result.marketingBullets).toHaveLength(4);
    expect(result.marketingBullets[0]).toContain("commission on this deal");
    expect(result.marketingBullets[1]).toContain("BUYER representation");
  });
});

describe("persona switching changes hero, not compute", () => {
  const terms = makeDealTerms();
  const assumptions = makeAssumptions();
  const outputs = getOutputs(terms, assumptions);

  it("switching from buyer to homeowner changes hero label and value", () => {
    const buyer = resolvePersonaPresentation("buyer", terms, assumptions, outputs);
    const homeowner = resolvePersonaPresentation("homeowner", terms, assumptions, outputs);
    expect(buyer.hero.label).not.toBe(homeowner.hero.label);
  });

  it("all personas use the same compute outputs object (no recompute)", () => {
    const buyer = resolvePersonaPresentation("buyer", terms, assumptions, outputs);
    const homeowner = resolvePersonaPresentation("homeowner", terms, assumptions, outputs);
    expect(buyer.strip.find(c => c.label === "Projected home value")!.value)
      .toBe(homeowner.strip.find(c => c.label === "Projected home value")!.value);
  });
});

describe("DEV_AUTH edit gating logic", () => {
  it("canEdit=true => edit should be available (pure logic)", () => {
    const devAuth = "editor";
    const canEdit = devAuth === "editor";
    expect(canEdit).toBe(true);
  });

  it("canEdit=false for viewer role", () => {
    const devAuth: string = "viewer";
    const canEdit = devAuth === "editor";
    expect(canEdit).toBe(false);
  });

  it("canEdit=false for loggedOut role", () => {
    const devAuth: string = "loggedOut";
    const canEdit = devAuth === "editor";
    expect(canEdit).toBe(false);
  });

  it("canEdit from prop when devAuth is null", () => {
    const devAuth: string | null = null;
    const canEditProp = true;
    const canEdit = devAuth === "editor" ? true : devAuth === "viewer" || devAuth === "loggedOut" ? false : (canEditProp ?? false);
    expect(canEdit).toBe(true);
  });

  it("devAuth=editor overrides canEditProp=false", () => {
    const devAuth: string | null = "editor";
    const canEditProp = false;
    const canEdit = devAuth === "editor" ? true : devAuth === "viewer" || devAuth === "loggedOut" ? false : (canEditProp ?? false);
    expect(canEdit).toBe(true);
  });

  it("devAuth=viewer overrides canEditProp=true", () => {
    const devAuth: string | null = "viewer";
    const canEditProp = true;
    const canEdit = devAuth === "editor" ? true : devAuth === "viewer" || devAuth === "loggedOut" ? false : (canEditProp ?? false);
    expect(canEdit).toBe(false);
  });
});
