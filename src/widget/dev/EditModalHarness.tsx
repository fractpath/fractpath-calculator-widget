import { useState } from "react";
import { useDealDraftState } from "../editing/useDealDraftState.js";
import { DealEditModal } from "../components/DealEditModal.js";
import type { DraftCanonicalInputs } from "../editing/types.js";
import type { CalculatorPersona } from "../types.js";

export function EditModalHarness() {
  const [open, setOpen] = useState(false);
  const [persona, setPersona] = useState<CalculatorPersona>("buyer");
  const [lastSaved, setLastSaved] = useState<DraftCanonicalInputs | null>(null);
  const { draft, errors, preview, setField, onBlurCompute } = useDealDraftState();

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
        WGT-003 — Deal Edit Modal Harness
      </h3>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: "#6b7280" }}>Test persona:</span>
        {(["buyer", "homeowner", "investor", "realtor", "ops"] as const).map((p) => (
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
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          padding: "8px 20px",
          borderRadius: 8,
          border: "none",
          background: "#111827",
          color: "#fff",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Edit terms
      </button>

      {open && (
        <DealEditModal
          draft={draft}
          errors={errors}
          preview={preview}
          persona={persona}
          setField={setField}
          onBlurCompute={onBlurCompute}
          onSave={(saved) => {
            setLastSaved(saved);
            console.log("[EditModalHarness] Saved draft:", JSON.stringify(saved, null, 2));
          }}
          onClose={() => setOpen(false)}
        />
      )}

      {lastSaved && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Last saved draft:</div>
          <pre
            style={{
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: 6,
              padding: 10,
              fontSize: 11,
              maxHeight: 300,
              overflow: "auto",
              whiteSpace: "pre-wrap",
            }}
          >
            {JSON.stringify(lastSaved, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
