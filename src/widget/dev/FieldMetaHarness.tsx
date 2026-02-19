import { FIELD_META } from "../editing/fieldMeta.js";
import { TAB_CONFIG } from "../editing/tabConfig.js";

export function FieldMetaHarness() {
  const allTabKeys = TAB_CONFIG.flatMap((t) =>
    t.sections.flatMap((s) => s.fieldKeys)
  );
  const metaKeys = FIELD_META.map((f) => f.key);
  const missingInTabs = metaKeys.filter((k) => !allTabKeys.includes(k));
  const missingInMeta = allTabKeys.filter((k) => !metaKeys.includes(k));

  return (
    <div
      style={{
        marginTop: 32,
        padding: 16,
        border: "1px dashed #6366f1",
        borderRadius: 8,
        fontFamily: "monospace",
        fontSize: 13,
      }}
    >
      <h3 style={{ margin: "0 0 12px", fontFamily: "system-ui, sans-serif" }}>
        WGT-002 Field Meta Registry
      </h3>

      <div style={{ marginBottom: 8 }}>
        <strong>Fields in registry:</strong> {FIELD_META.length}
      </div>
      <div style={{ marginBottom: 8 }}>
        <strong>Tabs:</strong> {TAB_CONFIG.length} |{" "}
        <strong>Total sections:</strong>{" "}
        {TAB_CONFIG.reduce((sum, t) => sum + t.sections.length, 0)}
      </div>

      {missingInTabs.length > 0 && (
        <div style={{ color: "#f59e0b", marginBottom: 8 }}>
          Fields in meta but not in tabs: {missingInTabs.join(", ")}
        </div>
      )}
      {missingInMeta.length > 0 && (
        <div style={{ color: "#dc2626", marginBottom: 8 }}>
          Fields in tabs but not in meta: {missingInMeta.join(", ")}
        </div>
      )}
      {missingInTabs.length === 0 && missingInMeta.length === 0 && (
        <div style={{ color: "#16a34a", marginBottom: 8 }}>
          All fields covered. No drift detected.
        </div>
      )}

      <details style={{ marginTop: 12 }}>
        <summary style={{ cursor: "pointer", fontFamily: "system-ui" }}>
          Field details ({FIELD_META.length})
        </summary>
        <div style={{ marginTop: 8 }}>
          {FIELD_META.map((f) => (
            <div
              key={f.key}
              style={{
                marginBottom: 12,
                padding: 8,
                background: "#f9fafb",
                borderRadius: 4,
                border: "1px solid #e5e7eb",
              }}
            >
              <div>
                <strong>{f.label}</strong>{" "}
                <span style={{ color: "#6b7280" }}>({f.key})</span>
              </div>
              <div style={{ fontSize: 11, color: "#374151", marginTop: 4 }}>
                <div>
                  <em>Definition:</em> {f.simpleDefinition}
                </div>
                <div>
                  <em>Impact:</em> {f.impact}
                </div>
                <div>
                  <em>Formula:</em>{" "}
                  <code style={{ background: "#e5e7eb", padding: "1px 4px" }}>
                    {f.formula}
                  </code>
                </div>
                <div>
                  <em>Control:</em> {f.control} | <em>Unit:</em> {f.unit}
                  {f.readOnly && " | read-only"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
