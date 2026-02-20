import type { Tier1Preview, PreviewStatus } from "../editing/types.js";

type PreviewPanelProps = {
  tier1: Tier1Preview;
  status: PreviewStatus;
  error?: string;
};

const statusConfig: Record<PreviewStatus, { label: string; color: string; bg: string }> = {
  idle: { label: "Ready", color: "#6b7280", bg: "#f3f4f6" },
  computing: { label: "Computing...", color: "#d97706", bg: "#fffbeb" },
  ok: { label: "Up to date", color: "#059669", bg: "#ecfdf5" },
  error: { label: "Error", color: "#dc2626", bg: "#fef2f2" },
};

export function PreviewPanel({ tier1, status, error }: PreviewPanelProps) {
  const st = statusConfig[status];

  return (
    <div
      style={{
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 13, color: "#374151" }}>
          Preview
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            padding: "2px 8px",
            borderRadius: 10,
            background: st.bg,
            color: st.color,
          }}
        >
          {st.label}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <div style={{ fontSize: 11, color: "#9ca3af" }}>Upfront cash</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>
            ${tier1.upfrontCash.toLocaleString("en-US")}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "#9ca3af" }}>Installments</div>
          <div style={{ fontSize: 13, color: "#374151" }}>
            {tier1.installmentsLabel}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "#9ca3af" }}>Total installments</div>
          <div style={{ fontSize: 13, color: "#374151" }}>
            ${tier1.totalInstallments.toLocaleString("en-US")}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "#9ca3af" }}>Total cash paid</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>
            ${tier1.totalCashPaid.toLocaleString("en-US")}
          </div>
        </div>
      </div>

      {status === "error" && error && (
        <div
          style={{
            marginTop: 8,
            fontSize: 11,
            color: "#dc2626",
            background: "#fef2f2",
            padding: "6px 8px",
            borderRadius: 6,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
