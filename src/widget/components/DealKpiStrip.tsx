export type KpiItem = {
  label: string;
  value: string;
  sublabel?: string;
};

export type DealKpiStripProps = {
  items: KpiItem[];
};

export function DealKpiStrip({ items }: DealKpiStripProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: 1,
        background: "#e5e7eb",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            background: "#fff",
            padding: "12px 14px",
            minWidth: 0,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {item.label}
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", whiteSpace: "nowrap" }}>
            {item.value}
          </div>
          {item.sublabel && (
            <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>
              {item.sublabel}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
