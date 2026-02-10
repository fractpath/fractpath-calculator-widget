import { describe, it, expect } from "vitest";
import { computeScenario } from "../calc/calc.js";
import {
  buildLiteShareSummaryV1,
  buildFullDealSnapshotV1,
  buildLiteChartSeriesV1,
} from "../contracts/builders.js";
import { buildChartSeriesV1 as buildFullChartSeriesV1 } from "../calc/chart.js";
import { CONTRACT_VERSION_V1, SCHEMA_VERSION_V1 } from "../contracts/v1.js";

const LITE_TOP_KEYS = [
  "contract_version",
  "schema_version",
  "persona",
  "inputs",
  "basic_results",
  "chart_series_v1",
  "created_at",
].sort();

const LITE_INPUTS_KEYS = [
  "homeValue",
  "initialBuyAmount",
  "termYears",
  "annualGrowthRate",
].sort();

const LITE_BASIC_RESULTS_KEYS = [
  "standard_net_payout",
  "early_net_payout",
  "late_net_payout",
  "standard_settlement_month",
  "early_settlement_month",
  "late_settlement_month",
].sort();

const LITE_EXIT_KEYS = [
  "timing",
  "label",
  "month",
  "netPayout",
].sort();

const FULL_TOP_KEYS = [
  "contract_version",
  "schema_version",
  "persona",
  "mode",
  "inputs",
  "outputs",
  "chart_series_v1",
  "input_hash",
  "output_hash",
  "created_at",
].sort();

describe("LiteShareSummaryV1 contract shape", () => {
  it("has exactly the expected top-level keys", () => {
    const out = computeScenario({});
    const lite = buildLiteShareSummaryV1("buyer", out.normalizedInputs, out);
    expect(Object.keys(lite).sort()).toEqual(LITE_TOP_KEYS);
  });

  it("inputs has the core required keys", () => {
    const out = computeScenario({});
    const lite = buildLiteShareSummaryV1("buyer", out.normalizedInputs, out);
    const keys = Object.keys(lite.inputs);
    for (const k of LITE_INPUTS_KEYS) {
      expect(keys).toContain(k);
    }
  });

  it("inputs includes mortgageBalance when non-zero", () => {
    const out = computeScenario({ mortgageBalance: 100_000 });
    const lite = buildLiteShareSummaryV1("homeowner", out.normalizedInputs, out);
    expect(Object.keys(lite.inputs).sort()).toEqual([...LITE_INPUTS_KEYS, "mortgageBalance"].sort());
  });

  it("basic_results has exactly the expected keys", () => {
    const out = computeScenario({});
    const lite = buildLiteShareSummaryV1("buyer", out.normalizedInputs, out);
    expect(Object.keys(lite.basic_results).sort()).toEqual(LITE_BASIC_RESULTS_KEYS);
  });

  it("contract_version and schema_version match V1 constants", () => {
    const out = computeScenario({});
    const lite = buildLiteShareSummaryV1("buyer", out.normalizedInputs, out);
    expect(lite.contract_version).toBe(CONTRACT_VERSION_V1);
    expect(lite.schema_version).toBe(SCHEMA_VERSION_V1);
  });

  it("chart_series_v1 has points and exits arrays", () => {
    const out = computeScenario({});
    const lite = buildLiteShareSummaryV1("buyer", out.normalizedInputs, out);
    expect(Array.isArray(lite.chart_series_v1.points)).toBe(true);
    expect(Array.isArray(lite.chart_series_v1.exits)).toBe(true);
    expect(lite.chart_series_v1.points.length).toBeGreaterThan(0);
    expect(lite.chart_series_v1.exits).toHaveLength(3);
  });

  it("chart exits contain only marketing-safe fields", () => {
    const out = computeScenario({});
    const lite = buildLiteShareSummaryV1("buyer", out.normalizedInputs, out);
    for (const exit of lite.chart_series_v1.exits) {
      expect(Object.keys(exit).sort()).toEqual(LITE_EXIT_KEYS);
    }
  });

  it("does not leak app-only fields in JSON", () => {
    const out = computeScenario({});
    const lite = buildLiteShareSummaryV1("buyer", out.normalizedInputs, out);
    const json = JSON.stringify(lite);
    expect(json).not.toContain("rawPayout");
    expect(json).not.toContain("clampedPayout");
    expect(json).not.toContain("transferFeeAmount");
    expect(json).not.toContain("equityPctAtSettlement");
    expect(json).not.toContain("homeValueAtSettlement");
    expect(json).not.toContain("equityConstrained");
    expect(json).not.toContain("clampApplied");
  });

  it("created_at is a valid ISO-8601 string", () => {
    const out = computeScenario({});
    const lite = buildLiteShareSummaryV1("buyer", out.normalizedInputs, out);
    expect(new Date(lite.created_at).toISOString()).toBe(lite.created_at);
  });

  it("all personas produce valid shapes", () => {
    const personas = ["buyer", "homeowner", "realtor"] as const;
    const out = computeScenario({});
    for (const p of personas) {
      const lite = buildLiteShareSummaryV1(p, out.normalizedInputs, out);
      expect(lite.persona).toBe(p);
      expect(Object.keys(lite).sort()).toEqual(LITE_TOP_KEYS);
    }
  });
});

describe("FullDealSnapshotV1 contract shape", () => {
  it("has exactly the expected top-level keys", async () => {
    const out = computeScenario({});
    const full = await buildFullDealSnapshotV1("buyer", out.normalizedInputs, out);
    expect(Object.keys(full).sort()).toEqual(FULL_TOP_KEYS);
  });

  it("contract_version and schema_version match V1 constants", async () => {
    const out = computeScenario({});
    const full = await buildFullDealSnapshotV1("buyer", out.normalizedInputs, out);
    expect(full.contract_version).toBe(CONTRACT_VERSION_V1);
    expect(full.schema_version).toBe(SCHEMA_VERSION_V1);
  });

  it("mode is always 'app'", async () => {
    const out = computeScenario({});
    const full = await buildFullDealSnapshotV1("homeowner", out.normalizedInputs, out);
    expect(full.mode).toBe("app");
  });

  it("contains full ScenarioInputs and ScenarioOutputs", async () => {
    const out = computeScenario({});
    const full = await buildFullDealSnapshotV1("buyer", out.normalizedInputs, out);
    expect(full.inputs).toHaveProperty("vesting");
    expect(full.inputs).toHaveProperty("cpw");
    expect(full.inputs).toHaveProperty("mortgageBalance");
    expect(full.outputs).toHaveProperty("settlements");
    expect(full.outputs).toHaveProperty("series");
    expect(full.outputs.settlements).toHaveProperty("standard");
    expect(full.outputs.settlements).toHaveProperty("early");
    expect(full.outputs.settlements).toHaveProperty("late");
  });

  it("chart_series_v1 has full exit data", async () => {
    const out = computeScenario({});
    const full = await buildFullDealSnapshotV1("buyer", out.normalizedInputs, out);
    expect(full.chart_series_v1.exits).toHaveLength(3);
    const exit = full.chart_series_v1.exits[0];
    expect(exit).toHaveProperty("rawPayout");
    expect(exit).toHaveProperty("clampedPayout");
    expect(exit).toHaveProperty("transferFeeAmount");
    expect(exit).toHaveProperty("clampApplied");
  });

  it("has deterministic hashes", async () => {
    const out = computeScenario({});
    const f1 = await buildFullDealSnapshotV1("buyer", out.normalizedInputs, out);
    const f2 = await buildFullDealSnapshotV1("buyer", out.normalizedInputs, out);
    expect(f1.input_hash).toBe(f2.input_hash);
    expect(f1.output_hash).toBe(f2.output_hash);
    expect(f1.input_hash).not.toBe("");
    expect(f1.output_hash).not.toBe("");
  });

  it("hashes differ for different inputs", async () => {
    const out1 = computeScenario({ homeValue: 500_000 });
    const out2 = computeScenario({ homeValue: 600_000 });
    const f1 = await buildFullDealSnapshotV1("buyer", out1.normalizedInputs, out1);
    const f2 = await buildFullDealSnapshotV1("buyer", out2.normalizedInputs, out2);
    expect(f1.input_hash).not.toBe(f2.input_hash);
  });
});

describe("LiteChartSeriesV1 isolation", () => {
  it("produces points and lite exits", () => {
    const out = computeScenario({});
    const chart = buildLiteChartSeriesV1(out);
    expect(chart.points.length).toBeGreaterThan(0);
    expect(chart.exits).toHaveLength(3);
  });

  it("lite exits have only timing, label, month, netPayout", () => {
    const out = computeScenario({});
    const chart = buildLiteChartSeriesV1(out);
    for (const exit of chart.exits) {
      expect(Object.keys(exit).sort()).toEqual(LITE_EXIT_KEYS);
    }
  });

  it("does not contain rawPayout or clampApplied in exits", () => {
    const out = computeScenario({});
    const chart = buildLiteChartSeriesV1(out);
    const json = JSON.stringify(chart.exits);
    expect(json).not.toContain("rawPayout");
    expect(json).not.toContain("clampApplied");
    expect(json).not.toContain("transferFeeAmount");
  });

  it("points match the full chart series points", () => {
    const out = computeScenario({});
    const fullChart = buildFullChartSeriesV1(out);
    const liteChart = buildLiteChartSeriesV1(out);
    expect(liteChart.points).toEqual(fullChart.points);
  });
});
