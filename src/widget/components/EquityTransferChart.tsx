import type { DealResults } from "../../compute.js";

export type EquityTransferChartProps = {
  results: DealResults;
};

export function EquityTransferChart({ results }: EquityTransferChartProps) {
  void results;

  return (
    <div
      style={{
        border: "1px dashed #d1d5db",
        borderRadius: 8,
        padding: "32px 20px",
        textAlign: "center",
        background: "#f9fafb",
        minHeight: 180,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect x="4" y="28" width="8" height="16" rx="2" fill="#d1d5db" />
        <rect x="16" y="18" width="8" height="26" rx="2" fill="#9ca3af" />
        <rect x="28" y="10" width="8" height="34" rx="2" fill="#6b7280" />
        <rect x="40" y="4" width="4" height="40" rx="2" fill="#374151" />
      </svg>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
        Equity Transfer Chart
      </div>
      <div style={{ fontSize: 11, color: "#9ca3af", maxWidth: 320, lineHeight: 1.5 }}>
        Will render when schedule series is exposed in canonical compute outputs.
        Currently, compute v{results.compute_version} returns summary results only.
      </div>
    </div>
  );
}
