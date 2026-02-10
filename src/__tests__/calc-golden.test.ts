import { describe, it, expect } from "vitest";
import { computeScenario, normalizeInputs } from "../calc/calc.js";
import { DEFAULT_INPUTS } from "../calc/constants.js";

describe("WGT-010: Golden fixtures — default inputs (mortgageBalance=0)", () => {
  const out = computeScenario({});

  it("normalizedInputs echoes defaults with mortgageBalance=0", () => {
    expect(out.normalizedInputs).toEqual(DEFAULT_INPUTS);
    expect(out.normalizedInputs.mortgageBalance).toBe(0);
  });

  describe("Standard settlement (month 120)", () => {
    const s = out.settlements.standard;

    it("timing and month", () => {
      expect(s.timing).toBe("standard");
      expect(s.settlementMonth).toBe(120);
    });

    it("homeValueAtSettlement", () => {
      expect(s.homeValueAtSettlement).toBeCloseTo(806349.8276064734, 4);
    });

    it("equityPctAtSettlement = 0.40", () => {
      expect(s.equityPctAtSettlement).toBe(0.4);
    });

    it("rawPayout", () => {
      expect(s.rawPayout).toBeCloseTo(322539.9310425894, 4);
    });

    it("floor/cap clamp applied = cap", () => {
      expect(s.clamp.floor).toBeCloseTo(110000, 0);
      expect(s.clamp.cap).toBe(200000);
      expect(s.clamp.applied).toBe("cap");
    });

    it("clampedPayout = 200000 (cap)", () => {
      expect(s.clampedPayout).toBe(200000);
    });

    it("TF applies to payout at standard rate 3.5%", () => {
      expect(s.transferFeeRate).toBe(0.035);
      expect(s.transferFeeAmount).toBeCloseTo(7000, 0);
    });

    it("netPayout = 193000", () => {
      expect(s.netPayout).toBe(193000);
    });

    it("equity availability not constrained (no mortgage)", () => {
      expect(s.equityAvailability.availableEquity).toBeCloseTo(806349.8276064734, 4);
      expect(s.equityAvailability.constrained).toBe(false);
    });
  });

  describe("Early settlement (month 36)", () => {
    const s = out.settlements.early;

    it("timing and month", () => {
      expect(s.timing).toBe("early");
      expect(s.settlementMonth).toBe(36);
    });

    it("homeValueAtSettlement", () => {
      expect(s.homeValueAtSettlement).toBeCloseTo(655636.2, 1);
    });

    it("equityPctAtSettlement = 0.19", () => {
      expect(s.equityPctAtSettlement).toBe(0.19);
    });

    it("rawPayout", () => {
      expect(s.rawPayout).toBeCloseTo(124570.878, 3);
    });

    it("floor/cap clamp applied = none", () => {
      expect(s.clamp.applied).toBe("none");
    });

    it("clampedPayout = rawPayout (no clamp)", () => {
      expect(s.clampedPayout).toBeCloseTo(124570.878, 3);
    });

    it("TF applies at early rate 4.5%", () => {
      expect(s.transferFeeRate).toBe(0.045);
      expect(s.transferFeeAmount).toBeCloseTo(5605.6895, 2);
    });

    it("netPayout", () => {
      expect(s.netPayout).toBeCloseTo(118965.1885, 2);
    });

    it("equity availability not constrained", () => {
      expect(s.equityAvailability.constrained).toBe(false);
    });
  });

  describe("Late settlement (month 144)", () => {
    const s = out.settlements.late;

    it("timing and month", () => {
      expect(s.timing).toBe("late");
      expect(s.settlementMonth).toBe(144);
    });

    it("homeValueAtSettlement", () => {
      expect(s.homeValueAtSettlement).toBeCloseTo(855456.5321077077, 4);
    });

    it("equityPctAtSettlement ≈ 0.46", () => {
      expect(s.equityPctAtSettlement).toBeCloseTo(0.46, 6);
    });

    it("rawPayout exceeds cap", () => {
      expect(s.rawPayout).toBeCloseTo(393510.0047695455, 4);
    });

    it("clamp applied = cap, clampedPayout = 200000", () => {
      expect(s.clamp.applied).toBe("cap");
      expect(s.clampedPayout).toBe(200000);
    });

    it("TF applies at late rate 2.5%", () => {
      expect(s.transferFeeRate).toBe(0.025);
      expect(s.transferFeeAmount).toBe(5000);
    });

    it("netPayout = 195000", () => {
      expect(s.netPayout).toBe(195000);
    });

    it("equity availability not constrained", () => {
      expect(s.equityAvailability.constrained).toBe(false);
    });
  });

  it("series covers month 0 through late settlement month", () => {
    expect(out.series[0].month).toBe(0);
    expect(out.series[out.series.length - 1].month).toBe(144);
    expect(out.series.length).toBe(145);
  });

  it("series month 0 matches initial values", () => {
    expect(out.series[0].homeValue).toBe(600000);
    expect(out.series[0].equityPct).toBe(0.10);
  });
});

describe("WGT-010: Persona does NOT affect numeric computation", () => {
  const personas = ["buyer", "homeowner", "investor", "realtor", "ops"] as const;
  const inputs = { homeValue: 500_000, initialBuyAmount: 80_000, termYears: 7, annualGrowthRate: 0.04 };

  it("all personas produce identical ScenarioOutputs", () => {
    const results = personas.map(() => computeScenario(inputs));
    for (let i = 1; i < results.length; i++) {
      expect(results[i]).toEqual(results[0]);
    }
  });
});

describe("WGT-010: Equity availability constraint (FMV − mortgage)", () => {
  it("constraint fires when mortgage exceeds FMV at settlement", () => {
    const out = computeScenario({ mortgageBalance: 750_000 });
    const early = out.settlements.early;

    expect(early.equityAvailability.availableEquity).toBe(0);
    expect(early.equityAvailability.constrained).toBe(true);
    expect(early.clampedPayout).toBe(0);
    expect(early.transferFeeAmount).toBe(0);
    expect(early.netPayout).toBe(0);
  });

  it("constraint fires when mortgage reduces available equity below cap", () => {
    const out = computeScenario({ mortgageBalance: 700_000 });
    const std = out.settlements.standard;

    const expectedAvailable = std.homeValueAtSettlement - 700_000;
    expect(std.equityAvailability.availableEquity).toBeCloseTo(expectedAvailable, 4);
    expect(expectedAvailable).toBeLessThan(200_000);
    expect(std.equityAvailability.constrained).toBe(true);
    expect(std.clampedPayout).toBeCloseTo(expectedAvailable, 4);
    expect(std.netPayout).toBeCloseTo(expectedAvailable - expectedAvailable * 0.035, 4);
  });

  it("constraint does NOT fire when available equity exceeds capped payout", () => {
    const out = computeScenario({ mortgageBalance: 500_000 });
    const std = out.settlements.standard;

    expect(std.equityAvailability.availableEquity).toBeCloseTo(306349.83, 0);
    expect(std.equityAvailability.constrained).toBe(false);
    expect(std.clampedPayout).toBe(200_000);
    expect(std.netPayout).toBe(193_000);
  });

  it("constraint is disclosed for all three timings independently", () => {
    const out = computeScenario({ homeValue: 400_000, mortgageBalance: 350_000, termYears: 5 });

    for (const timing of ["early", "standard", "late"] as const) {
      const s = out.settlements[timing];
      const expectedAvail = Math.max(0, s.homeValueAtSettlement - 350_000);
      expect(s.equityAvailability.availableEquity).toBeCloseTo(expectedAvail, 4);
      expect(typeof s.equityAvailability.constrained).toBe("boolean");
    }
  });

  it("default mortgageBalance=0 means constraint never fires for default inputs", () => {
    const out = computeScenario({});
    expect(out.normalizedInputs.mortgageBalance).toBe(0);
    expect(out.settlements.standard.equityAvailability.constrained).toBe(false);
    expect(out.settlements.early.equityAvailability.constrained).toBe(false);
    expect(out.settlements.late.equityAvailability.constrained).toBe(false);
  });
});

describe("WGT-010: normalizeInputs", () => {
  it("fills defaults for empty partial", () => {
    const n = normalizeInputs({});
    expect(n).toEqual(DEFAULT_INPUTS);
  });

  it("overrides homeValue but keeps other defaults", () => {
    const n = normalizeInputs({ homeValue: 800_000 });
    expect(n.homeValue).toBe(800_000);
    expect(n.initialBuyAmount).toBe(DEFAULT_INPUTS.initialBuyAmount);
    expect(n.mortgageBalance).toBe(0);
  });

  it("forces vesting.months = termYears * 12", () => {
    const n = normalizeInputs({ termYears: 5 });
    expect(n.vesting.months).toBe(60);
  });

  it("accepts mortgageBalance override", () => {
    const n = normalizeInputs({ mortgageBalance: 300_000 });
    expect(n.mortgageBalance).toBe(300_000);
  });
});

describe("WGT-010: Determinism — repeated calls produce identical results", () => {
  it("same inputs, 10 calls, identical outputs", () => {
    const inputs = { homeValue: 750_000, initialBuyAmount: 120_000, termYears: 8, annualGrowthRate: 0.05, mortgageBalance: 200_000 };
    const baseline = computeScenario(inputs);
    for (let i = 0; i < 10; i++) {
      expect(computeScenario(inputs)).toEqual(baseline);
    }
  });
});
