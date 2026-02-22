import { useMemo, useState } from "react";
import { computeDeal } from "../packages/compute/src/index.js";
import { getDefaultDraftCanonicalInputs } from "../editing/defaults.js";
import { DealSnapshotView } from "../components/DealSnapshotView.js";
import type { CalculatorPersona } from "../types.js";

export function SnapshotViewHarness() {
  const [persona, setPersona] = useState<CalculatorPersona>("buyer");
  const [status, setStatus] = useState("Draft");

  const defaults = useMemo(() => getDefaultDraftCanonicalInputs(), []);

  const results = useMemo(
    () => computeDeal(defaults.deal_terms, defaults.scenario),
    [defaults],
  );

  return (
    <div
      style={{
        marginTop: 32,
        padding: 16,
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h3 style={{ margin: "0 0 12px", fontSize: 15, color: "#111827" }}>
        WGT-004 — Deal Snapshot View Harness
      </h3>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: "#6b7280" }}>Persona:</span>
        {(["buyer", "homeowner", "investor", "realtor"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPersona(p)}
            style={{
              padding: "3px 8px",
              borderRadius: 4,
              border: persona === p ? "2px solid #111827" : "1px solid #d1d5db",
              background: persona === p ? "#111827" : "#fff",
              color: persona === p ? "#fff" : "#374151",
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            {p}
          </button>
        ))}
        <span style={{ marginLeft: 8, fontSize: 12, color: "#6b7280" }}>Status:</span>
        {["Draft", "Proposed", "Active", ""].map((s) => (
          <button
            key={s || "__none__"}
            type="button"
            onClick={() => setStatus(s)}
            style={{
              padding: "3px 8px",
              borderRadius: 4,
              border: status === s ? "2px solid #111827" : "1px solid #d1d5db",
              background: status === s ? "#111827" : "#fff",
              color: status === s ? "#fff" : "#374151",
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            {s || "(none)"}
          </button>
        ))}
      </div>

      <DealSnapshotView
        persona={persona}
        status={status || undefined}
        inputs={{ deal_terms: defaults.deal_terms, scenario: defaults.scenario }}
        results={results}
      />
    </div>
  );
}
