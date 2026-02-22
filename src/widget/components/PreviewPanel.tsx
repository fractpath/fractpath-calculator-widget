import type { Tier1Preview, PreviewStatus } from "../editing/types.js";
import { formatCurrency } from "../format.js";

type PreviewPanelProps = {
  tier1: Tier1Preview;
  status: PreviewStatus;
  error?: string;
};

const shimmerKeyframes = `
@keyframes fpShimmer {
  0% { background-position: -200px 0; }
  100% { background-position: 200px 0; }
}
`;

const shimmerStyle: React.CSSProperties = {
  display: "inline-block",
  width: 60,
  height: 12,
  borderRadius: 4,
  background: "linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)",
  backgroundSize: "200px 100%",
  animation: "fpShimmer 1.5s infinite",
};

export function PreviewPanel({ tier1, status, error }: PreviewPanelProps) {
  const isComputing = status === "computing";

  return (
    <div
      style={{
        background: "#f9fafb",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: 14,
      }}
    >
      <style>{shimmerKeyframes}</style>

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
        {isComputing && <span style={shimmerStyle} />}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <div style={{ fontSize: 11, color: "#9ca3af" }}>Upfront cash</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>
            {formatCurrency(tier1.upfrontCash)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: "#9ca3af" }}>Installments</div>
          <div style={{ fontSize: 13, color: "#374151" }}>
            {tier1.installmentsLabel}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: "#9ca3af" }}>
            Total installments
          </div>
          <div style={{ fontSize: 13, color: "#374151" }}>
            {formatCurrency(tier1.totalInstallments)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: "#9ca3af" }}>Total cash paid</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>
            {formatCurrency(tier1.totalCashPaid)}
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
