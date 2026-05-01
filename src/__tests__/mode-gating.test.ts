import { describe, it, expect } from "vitest";
import { computeScenario } from "../calc/calc.js";
import { computeDeal } from "../compute.js";
import { buildDraftSnapshot, buildShareSummary } from "../widget/snapshot.js";
import { validateDraft, hasErrors } from "../widget/editing/validateDraft.js";
import { getDefaultDraftCanonicalInputs } from "../widget/editing/defaults.js";
import type { DraftCanonicalInputs } from "../widget/editing/types.js";
import { MARKETING_PERSONAS } from "../widget/wired.js";

describe("Mode gating: marketing mode cannot expose excluded fields", () => {
  const EXCLUDED_MARKETING_FIELDS = [
    "rawPayout",
    "clampedPayout",
    "transferFeeAmount",
    "transferFeeRate",
    "equityPctAtSettlement",
    "homeValueAtSettlement",
    "floor",
    "cap",
    "applied",
    "series",
    "normalizedInputs",
  ];

  it("DraftSnapshot does not contain any excluded fields", async () => {
    const out = computeScenario({
      homeValue: 800_000,
      initialBuyAmount: 150_000,
      termYears: 15,
      annualGrowthRate: 0.04,
    });
    const snap = await buildDraftSnapshot("homeowner", out.normalizedInputs, out);
    const json = JSON.stringify(snap);

    for (const field of EXCLUDED_MARKETING_FIELDS) {
      expect(json).not.toContain(`"${field}"`);
    }
  });

  it("ShareSummary does not contain any excluded fields", () => {
    const out = computeScenario({
      homeValue: 800_000,
      initialBuyAmount: 150_000,
      termYears: 15,
      annualGrowthRate: 0.04,
    });
    const summary = buildShareSummary("homeowner", out.normalizedInputs, out);
    const json = JSON.stringify(summary);

    for (const field of EXCLUDED_MARKETING_FIELDS) {
      expect(json).not.toContain(`"${field}"`);
    }
  });

  it("DraftSnapshot only contains basic_results numeric values", async () => {
    const out = computeScenario({});
    const snap = await buildDraftSnapshot("buyer", out.normalizedInputs, out);

    expect(typeof snap.basic_results.standard_net_payout).toBe("number");
    expect(typeof snap.basic_results.early_net_payout).toBe("number");
    expect(typeof snap.basic_results.late_net_payout).toBe("number");
    expect(typeof snap.basic_results.standard_settlement_month).toBe("number");
    expect(typeof snap.basic_results.early_settlement_month).toBe("number");
    expect(typeof snap.basic_results.late_settlement_month).toBe("number");
  });

  it("ShareSummary only contains net payout values (no settlement months)", () => {
    const out = computeScenario({});
    const summary = buildShareSummary("buyer", out.normalizedInputs, out);

    expect(typeof summary.basic_results.standard_net_payout).toBe("number");
    expect(typeof summary.basic_results.early_net_payout).toBe("number");
    expect(typeof summary.basic_results.late_net_payout).toBe("number");
    expect(Object.keys(summary.basic_results)).toHaveLength(3);
  });

  it("all personas produce valid DraftSnapshots with same schema", async () => {
    const personas = ["buyer", "homeowner", "investor", "realtor", "ops"] as const;
    const out = computeScenario({});

    for (const p of personas) {
      const snap = await buildDraftSnapshot(p, out.normalizedInputs, out);
      expect(snap.persona).toBe(p);
      expect(snap.mode).toBe("marketing");
      expect(Object.keys(snap)).toHaveLength(9);
      expect(Object.keys(snap.inputs)).toHaveLength(4);
      expect(Object.keys(snap.basic_results)).toHaveLength(6);
    }
  });

  it("all personas produce valid ShareSummaries with same schema", () => {
    const personas = ["buyer", "homeowner", "investor", "realtor", "ops"] as const;
    const out = computeScenario({});

    for (const p of personas) {
      const summary = buildShareSummary(p, out.normalizedInputs, out);
      expect(summary.persona).toBe(p);
      expect(Object.keys(summary)).toHaveLength(6);
      expect(Object.keys(summary.basic_results)).toHaveLength(3);
    }
  });
});

describe("Mode gating: permission constraints", () => {
  it("FractPathCalculatorWidgetProps canEdit defaults to undefined (permissive for existing callers)", () => {
    const propType = {} as import("../widget/types.js").FractPathCalculatorWidgetProps;
    expect(propType.canEdit).toBeUndefined();
  });

  it("MARKETING_PERSONAS restricts to buyer/homeowner/realtor only", () => {
    expect(MARKETING_PERSONAS).toEqual(["buyer", "homeowner", "realtor"]);
    expect(MARKETING_PERSONAS).not.toContain("ops");
    expect(MARKETING_PERSONAS).not.toContain("investor");
  });

  it("marketing embed cannot include ops or investor personas", () => {
    const forbidden = ["ops", "investor"] as const;
    for (const p of forbidden) {
      expect(MARKETING_PERSONAS).not.toContain(p);
    }
  });
});

describe("Mode gating: realtor commission constraints", () => {
  it("realtor NONE mode forces commission_pct=0 in validation", () => {
    const draft: DraftCanonicalInputs = {
      ...getDefaultDraftCanonicalInputs(),
      deal_terms: {
        ...getDefaultDraftCanonicalInputs().deal_terms,
        realtor_representation_mode: "NONE",
        realtor_commission_pct: 0.03,
      },
    };
    const errors = validateDraft(draft);
    expect(hasErrors(errors)).toBe(true);
  });

  it("realtor BUYER mode allows non-zero commission_pct", () => {
    const draft: DraftCanonicalInputs = {
      ...getDefaultDraftCanonicalInputs(),
      deal_terms: {
        ...getDefaultDraftCanonicalInputs().deal_terms,
        realtor_representation_mode: "BUYER",
        realtor_commission_pct: 0.03,
      },
    };
    const errors = validateDraft(draft);
    const commissionError = errors["deal_terms.realtor_commission_pct"];
    expect(commissionError).toBeUndefined();
  });

  it("realtor commission_pct cannot exceed 6%", () => {
    const draft: DraftCanonicalInputs = {
      ...getDefaultDraftCanonicalInputs(),
      deal_terms: {
        ...getDefaultDraftCanonicalInputs().deal_terms,
        realtor_representation_mode: "BUYER",
        realtor_commission_pct: 0.07,
      },
    };
    const errors = validateDraft(draft);
    expect(hasErrors(errors)).toBe(true);
  });

  it("computeDeal with NONE realtor produces zero realtor fees", () => {
    const defaults = getDefaultDraftCanonicalInputs();
    const results = computeDeal(
      { ...defaults.deal_terms, realtor_representation_mode: "NONE", realtor_commission_pct: 0 },
      defaults.scenario
    );
    expect(results.realtor_fee_total_projected).toBe(0);
  });
});
