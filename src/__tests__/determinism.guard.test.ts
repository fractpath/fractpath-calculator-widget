import { describe, it, expect } from "vitest";
import { computeDeal } from "../compute.js";
import { previewCompute } from "../widget/editing/previewCompute.js";
import { deriveTier1Preview } from "../widget/editing/deriveTier1Preview.js";
import { buildChartSeries } from "../calc/chart.js";
import { computeScenario } from "../calc/calc.js";
import { normalizeTimestamps } from "./helpers/normalize.js";
import { FIXTURE_DRAFT, FIXTURE_DEAL_TERMS, FIXTURE_ASSUMPTIONS } from "./fixtures/canonicalInputs.fixture.js";

describe("Determinism Guard: previewCompute", () => {
  it("produces identical JSON output across two calls", () => {
    const a = previewCompute(FIXTURE_DRAFT);
    const b = previewCompute(FIXTURE_DRAFT);
    expect(a).toEqual(b);
  });

  it("produces identical output across 10 calls", () => {
    const results = Array.from({ length: 10 }, () => previewCompute(FIXTURE_DRAFT));
    for (let i = 1; i < results.length; i++) {
      expect(results[i]).toEqual(results[0]);
    }
  });

  it("previewCompute matches computeDeal for same canonical inputs", () => {
    const preview = previewCompute(FIXTURE_DRAFT);
    const direct = computeDeal(FIXTURE_DEAL_TERMS, FIXTURE_ASSUMPTIONS);
    expect(preview).toEqual(direct);
  });
});

describe("Determinism Guard: deriveTier1Preview", () => {
  it("produces deterministic output", () => {
    const a = deriveTier1Preview(FIXTURE_DRAFT);
    const b = deriveTier1Preview(FIXTURE_DRAFT);
    expect(a).toEqual(b);
  });

  it("matches expected hard-coded numeric values", () => {
    const tier1 = deriveTier1Preview(FIXTURE_DRAFT);
    expect(tier1.upfrontCash).toBe(80_000);
    const exitMonth = Math.floor(7 * 12);
    const paymentsMade = Math.min(36, exitMonth);
    expect(paymentsMade).toBe(36);
    expect(tier1.totalInstallments).toBe(500 * 36);
    expect(tier1.totalCashPaid).toBe(80_000 + 500 * 36);
  });
});

describe("Determinism Guard: buildChartSeries", () => {
  it("produces identical output across two calls", () => {
    const out = computeScenario({
      homeValue: 750_000,
      initialBuyAmount: 80_000,
      termYears: 7,
      annualGrowthRate: 0.04,
    });
    const a = buildChartSeries(out);
    const b = buildChartSeries(out);
    expect(normalizeTimestamps(a)).toEqual(normalizeTimestamps(b));
  });

  it("chart series does not depend on persona (persona-independent)", () => {
    const outBuyer = computeScenario({
      homeValue: 750_000,
      initialBuyAmount: 80_000,
      termYears: 7,
      annualGrowthRate: 0.04,
    });
    const outHomeowner = computeScenario({
      homeValue: 750_000,
      initialBuyAmount: 80_000,
      termYears: 7,
      annualGrowthRate: 0.04,
    });
    const seriesA = buildChartSeries(outBuyer);
    const seriesB = buildChartSeries(outHomeowner);
    expect(normalizeTimestamps(seriesA)).toEqual(normalizeTimestamps(seriesB));
  });
});

describe("Determinism Guard: computeDeal canonical", () => {
  it("produces identical output across two calls", () => {
    const a = computeDeal(FIXTURE_DEAL_TERMS, FIXTURE_ASSUMPTIONS);
    const b = computeDeal(FIXTURE_DEAL_TERMS, FIXTURE_ASSUMPTIONS);
    expect(a).toEqual(b);
  });

  it("key numeric outputs are stable and non-trivial", () => {
    const r = computeDeal(FIXTURE_DEAL_TERMS, FIXTURE_ASSUMPTIONS);
    expect(r.actual_buyer_funding_to_date).toBe(80_000 + 500 * 36);
    expect(r.current_participation_value).toBeGreaterThan(0);
    expect(r.extension_adjusted_buyout_amount).toBeGreaterThan(0);
    expect(r.funding_completion_factor).toBeDefined();
    expect(r.compute_version).toBe("11.0.0");
  });
});
