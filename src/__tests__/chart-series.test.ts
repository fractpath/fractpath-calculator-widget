import { describe, it, expect } from "vitest";
import { computeScenario } from "../calc/calc.js";
import { buildChartSeriesV1, buildChartSeries } from "../calc/chart.js";

const outputs = computeScenario({});

describe("WGT-011: buildChartSeriesV1 — shape + invariants", () => {
  const series = buildChartSeriesV1(outputs);

  describe("points", () => {
    it("returns an array with length matching engine series", () => {
      expect(series.points).toHaveLength(outputs.series.length);
    });

    it("each point has required fields", () => {
      for (const p of series.points) {
        expect(typeof p.month).toBe("number");
        expect(typeof p.year).toBe("number");
        expect(typeof p.homeValue).toBe("number");
        expect(typeof p.equityPct).toBe("number");
        expect(typeof p.equityDollarValue).toBe("number");
      }
    });

    it("equityDollarValue = homeValue * equityPct for every point", () => {
      for (const p of series.points) {
        expect(p.equityDollarValue).toBeCloseTo(p.homeValue * p.equityPct, 6);
      }
    });

    it("month 0 matches initial inputs", () => {
      expect(series.points[0].month).toBe(0);
      expect(series.points[0].homeValue).toBe(outputs.normalizedInputs.homeValue);
    });

    it("months are monotonically increasing", () => {
      for (let i = 1; i < series.points.length; i++) {
        expect(series.points[i].month).toBeGreaterThan(series.points[i - 1].month);
      }
    });

    it("year equals month / 12 for every point", () => {
      for (const p of series.points) {
        expect(p.year).toBeCloseTo(p.month / 12, 10);
      }
    });
  });

  describe("exits", () => {
    it("returns exactly 3 exits in order: early, standard, late", () => {
      expect(series.exits).toHaveLength(3);
      expect(series.exits[0].timing).toBe("early");
      expect(series.exits[1].timing).toBe("standard");
      expect(series.exits[2].timing).toBe("late");
    });

    it("each exit has a human-readable label", () => {
      expect(series.exits[0].label).toBe("Early Exit");
      expect(series.exits[1].label).toBe("Standard Exit");
      expect(series.exits[2].label).toBe("Late Exit");
    });

    it("each exit carries required tooltip fields", () => {
      for (const e of series.exits) {
        expect(typeof e.month).toBe("number");
        expect(typeof e.year).toBe("number");
        expect(typeof e.homeValueAtSettlement).toBe("number");
        expect(typeof e.equityPctAtSettlement).toBe("number");
        expect(typeof e.rawPayout).toBe("number");
        expect(typeof e.clampedPayout).toBe("number");
        expect(typeof e.netPayout).toBe("number");
        expect(typeof e.transferFeeAmount).toBe("number");
        expect(typeof e.transferFeeRate).toBe("number");
        expect(["none", "floor", "cap"]).toContain(e.clampApplied);
        expect(typeof e.equityConstrained).toBe("boolean");
      }
    });

    it("exit values match engine settlements exactly (no recompute)", () => {
      for (const e of series.exits) {
        const s = outputs.settlements[e.timing];
        expect(e.month).toBe(s.settlementMonth);
        expect(e.homeValueAtSettlement).toBe(s.homeValueAtSettlement);
        expect(e.equityPctAtSettlement).toBe(s.equityPctAtSettlement);
        expect(e.rawPayout).toBe(s.rawPayout);
        expect(e.clampedPayout).toBe(s.clampedPayout);
        expect(e.netPayout).toBe(s.netPayout);
        expect(e.transferFeeAmount).toBe(s.transferFeeAmount);
        expect(e.transferFeeRate).toBe(s.transferFeeRate);
        expect(e.clampApplied).toBe(s.clamp.applied);
        expect(e.equityConstrained).toBe(s.equityAvailability.constrained);
      }
    });

    it("early.month < standard.month < late.month", () => {
      expect(series.exits[0].month).toBeLessThan(series.exits[1].month);
      expect(series.exits[1].month).toBeLessThan(series.exits[2].month);
    });
  });
});

describe("WGT-011: buildChartSeries backward compatibility", () => {
  const legacy = buildChartSeries(outputs);

  it("returns points with equityDollarValue (V1 field present)", () => {
    expect(legacy.points[0]).toHaveProperty("equityDollarValue");
  });

  it("returns markers array with 3 entries", () => {
    expect(legacy.markers).toHaveLength(3);
    expect(legacy.markers.map((m) => m.timing)).toEqual(["early", "standard", "late"]);
  });

  it("markers match engine settlement values", () => {
    for (const m of legacy.markers) {
      const s = outputs.settlements[m.timing];
      expect(m.netPayout).toBe(s.netPayout);
      expect(m.month).toBe(s.settlementMonth);
    }
  });
});

describe("WGT-011: equity-constrained scenario exits", () => {
  const constrainedOutputs = computeScenario({ mortgageBalance: 750_000 });
  const series = buildChartSeriesV1(constrainedOutputs);

  it("exit summary reflects equity constraint from engine", () => {
    const earlyExit = series.exits[0];
    expect(earlyExit.equityConstrained).toBe(true);
    expect(earlyExit.netPayout).toBe(0);
  });
});

describe("WGT-011: no new math — pure field selection", () => {
  it("V1 points count equals engine series count", () => {
    const customOutputs = computeScenario({ termYears: 5, annualGrowthRate: 0.05 });
    const series = buildChartSeriesV1(customOutputs);
    expect(series.points.length).toBe(customOutputs.series.length);
  });

  it("exits count is always 3 regardless of inputs", () => {
    const series1 = buildChartSeriesV1(computeScenario({ termYears: 3 }));
    const series2 = buildChartSeriesV1(computeScenario({ termYears: 15 }));
    expect(series1.exits).toHaveLength(3);
    expect(series2.exits).toHaveLength(3);
  });
});
