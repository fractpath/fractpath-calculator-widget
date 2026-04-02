import { describe, it, expect } from "vitest";
import { CONTRACT_VERSION, SCHEMA_VERSION } from "../widget/types.js";
import { COMPUTE_VERSION } from "../compute.js";
import { buildFullDealSnapshotV1 } from "../widget/snapshot.js";
import { computeScenario } from "../calc/calc.js";
import { previewCompute } from "../widget/editing/previewCompute.js";
import { FIXTURE_DRAFT } from "./fixtures/canonicalInputs.fixture.js";

describe("Version Pin Drift Guard", () => {
  it("CONTRACT_VERSION matches expected value", () => {
    expect(CONTRACT_VERSION).toBe("11.0.0");
  });

  it("SCHEMA_VERSION matches expected value", () => {
    expect(SCHEMA_VERSION).toBe("1");
  });

  it("COMPUTE_VERSION matches expected value", () => {
    expect(COMPUTE_VERSION).toBe("11.0.0");
  });

  it("CONTRACT_VERSION and COMPUTE_VERSION are aligned", () => {
    expect(CONTRACT_VERSION).toBe(COMPUTE_VERSION);
  });

  it("buildFullDealSnapshotV1 embeds correct version constants", () => {
    const snap = buildFullDealSnapshotV1(computeScenario({}).normalizedInputs);
    expect(snap.contract_version).toBe(CONTRACT_VERSION);
    expect(snap.schema_version).toBe(SCHEMA_VERSION);
  });

  it("previewCompute output includes COMPUTE_VERSION", () => {
    const results = previewCompute(FIXTURE_DRAFT);
    expect(results.compute_version).toBe(COMPUTE_VERSION);
  });

  it("buildFullDealSnapshotV1 outputs.compute_version matches COMPUTE_VERSION", () => {
    const snap = buildFullDealSnapshotV1(computeScenario({}).normalizedInputs);
    expect(snap.outputs.compute_version).toBe(COMPUTE_VERSION);
  });
});
