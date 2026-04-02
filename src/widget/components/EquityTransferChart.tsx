import type { DealResults } from "../../compute.js";
import { formatCurrency } from "../format.js";

export type EquityTransferChartProps = {
  results: DealResults;
};

type BarItem = {
  label: string;
  value: number;
  color: string;
  sublabel?: string;
};

function pctOfMax(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(1, Math.max(0, value / max));
}

export function EquityTransferChart({ results }: EquityTransferChartProps) {
  const bars: BarItem[] = [
    {
      label: "Total Funded",
      value: results.actual_buyer_funding_to_date,
      color: "#9ca3af",
      sublabel: "Buyer funding to date",
    },
    {
      label: "Participation Value",
      value: results.current_participation_value,
      color: "#0891b2",
      sublabel: "Appreciation share × funding completion",
    },
    {
      label: "Base Buyout",
      value: results.base_buyout_amount,
      color: "#6366f1",
      sublabel: "Participation value + exit admin fee",
    },
    {
      label: "Adj. Buyout",
      value: results.extension_adjusted_buyout_amount,
      color: "#374151",
      sublabel: `Window: ${results.current_window}`,
    },
  ];

  if (results.discount_purchase_price != null && results.discount_purchase_price > 0) {
    bars.push({
      label: "Discount Price",
      value: results.discount_purchase_price,
      color: "#ca8a04",
      sublabel: "Buyer purchase option price",
    });
  }

  const maxValue = Math.max(...bars.map((b) => b.value), 1);

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: "16px",
        background: "#fafafa",
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#374151",
          marginBottom: 12,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Contract Value Overview
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {bars.map((bar) => (
          <div key={bar.label} style={{ fontFamily: "system-ui, sans-serif" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 3,
              }}
            >
              <span style={{ fontSize: 11, color: "#6b7280" }}>{bar.label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>
                {formatCurrency(bar.value)}
              </span>
            </div>
            <div
              style={{
                height: 6,
                background: "#f3f4f6",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${(pctOfMax(bar.value, maxValue) * 100).toFixed(1)}%`,
                  background: bar.color,
                  borderRadius: 3,
                  transition: "width 0.5s ease",
                }}
              />
            </div>
            {bar.sublabel && (
              <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>
                {bar.sublabel}
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 12,
          paddingTop: 10,
          borderTop: "1px solid #f3f4f6",
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontFamily: "system-ui, sans-serif" }}>
          <div style={{ fontSize: 10, color: "#9ca3af" }}>Funding completion</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>
            {(results.funding_completion_factor * 100).toFixed(1)}%
          </div>
        </div>
        <div style={{ fontFamily: "system-ui, sans-serif" }}>
          <div style={{ fontSize: 10, color: "#9ca3af" }}>Appreciation share</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>
            {(results.effective_buyer_appreciation_share * 100).toFixed(2)}%
          </div>
        </div>
        <div style={{ fontFamily: "system-ui, sans-serif" }}>
          <div style={{ fontSize: 10, color: "#9ca3af" }}>Current window</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>
            {results.current_window}
          </div>
        </div>
      </div>
    </div>
  );
}
