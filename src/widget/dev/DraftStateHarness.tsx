import { useDealDraftState } from "../editing/useDealDraftState.js";

export function DraftStateHarness() {
  const { draft, errors, preview, setField, onBlurCompute } = useDealDraftState();

  return (
    <div
      style={{
        marginTop: 32,
        padding: 16,
        border: "1px dashed #9ca3af",
        borderRadius: 8,
        fontFamily: "monospace",
        fontSize: 13,
      }}
    >
      <h3 style={{ margin: "0 0 12px", fontFamily: "system-ui, sans-serif" }}>
        WGT-001 Draft State Harness
      </h3>

      <label style={{ display: "block", marginBottom: 8 }}>
        Upfront Payment:{" "}
        <input
          type="number"
          value={draft.deal_terms.upfront_payment}
          onChange={(e) =>
            setField("deal_terms.upfront_payment", Number(e.target.value))
          }
          onBlur={onBlurCompute}
          style={{ width: 120, padding: 4 }}
        />
      </label>

      <label style={{ display: "block", marginBottom: 8 }}>
        Exit Year:{" "}
        <input
          type="number"
          step="0.5"
          value={draft.scenario.exit_year}
          onChange={(e) =>
            setField("scenario.exit_year", Number(e.target.value))
          }
          onBlur={onBlurCompute}
          style={{ width: 80, padding: 4 }}
        />
      </label>

      <label style={{ display: "block", marginBottom: 8 }}>
        Monthly Payment:{" "}
        <input
          type="number"
          value={draft.deal_terms.monthly_payment}
          onChange={(e) =>
            setField("deal_terms.monthly_payment", Number(e.target.value))
          }
          onBlur={onBlurCompute}
          style={{ width: 120, padding: 4 }}
        />
      </label>

      <label style={{ display: "block", marginBottom: 12 }}>
        Number of Payments:{" "}
        <input
          type="number"
          value={draft.deal_terms.number_of_payments}
          onChange={(e) =>
            setField("deal_terms.number_of_payments", Number(e.target.value))
          }
          onBlur={onBlurCompute}
          style={{ width: 80, padding: 4 }}
        />
      </label>

      <div style={{ marginBottom: 8 }}>
        <strong>Tier 1 Preview:</strong>
        <pre style={{ margin: "4px 0", background: "#f3f4f6", padding: 8, borderRadius: 4 }}>
          {JSON.stringify(preview.tier1, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: 8 }}>
        <strong>Status:</strong> {preview.status}
        {preview.lastComputedAtIso && (
          <span style={{ marginLeft: 8, color: "#6b7280" }}>
            (last: {preview.lastComputedAtIso})
          </span>
        )}
      </div>

      {preview.error && (
        <div style={{ color: "#dc2626", marginBottom: 8 }}>
          Error: {preview.error}
        </div>
      )}

      {Object.keys(errors).length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <strong>Validation Errors:</strong>
          <pre style={{ margin: "4px 0", background: "#fef2f2", padding: 8, borderRadius: 4, color: "#dc2626" }}>
            {JSON.stringify(errors, null, 2)}
          </pre>
        </div>
      )}

      {preview.results && (
        <div>
          <strong>Compute Results:</strong>
          <pre style={{ margin: "4px 0", background: "#f0fdf4", padding: 8, borderRadius: 4, fontSize: 11, maxHeight: 200, overflow: "auto" }}>
            {JSON.stringify(preview.results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
