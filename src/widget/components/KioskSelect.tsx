import type { Anchor } from "../editing/fieldMeta.js";

export type KioskSelectProps = {
  value: number;
  anchors: [Anchor, Anchor, Anchor, Anchor];
  unit: "currency" | "percent" | "number" | "months" | "years";
  onSelectAnchor: (value: number) => void;
  customValue: string;
  onChangeCustom: (value: string) => void;
  onBlurCustom: () => void;
  disabled?: boolean;
  error?: string;
};

const anchorBtnBase: React.CSSProperties = {
  padding: "5px 10px",
  borderRadius: 6,
  border: "1px solid #d1d5db",
  background: "#fff",
  color: "#374151",
  fontSize: 12,
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "system-ui, sans-serif",
  transition: "all 0.15s",
};

const anchorBtnActive: React.CSSProperties = {
  ...anchorBtnBase,
  border: "2px solid #111827",
  background: "#111827",
  color: "#fff",
};

export function KioskSelect({
  value,
  anchors,
  unit,
  onSelectAnchor,
  customValue,
  onChangeCustom,
  onBlurCustom,
  disabled,
  error,
}: KioskSelectProps) {
  const isAnchorMatch = anchors.some((a) => a.value === value);

  const inputMode: React.HTMLAttributes<HTMLInputElement>["inputMode"] =
    unit === "currency" || unit === "number" || unit === "months" || unit === "years"
      ? "numeric"
      : "decimal";

  const prefix =
    unit === "currency" ? "$" : unit === "percent" ? "" : "";
  const suffix = unit === "percent" ? "%" : unit === "years" ? " yr" : unit === "months" ? " mo" : "";

  return (
    <div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
        {anchors.map((a) => (
          <button
            key={a.label}
            type="button"
            disabled={disabled}
            onClick={() => onSelectAnchor(a.value)}
            style={{
              ...(a.value === value ? anchorBtnActive : anchorBtnBase),
              opacity: disabled ? 0.5 : 1,
              cursor: disabled ? "not-allowed" : "pointer",
            }}
          >
            {a.label}
          </button>
        ))}
      </div>
      <div style={{ position: "relative" }}>
        {prefix && (
          <span
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 13,
              color: "#9ca3af",
              pointerEvents: "none",
            }}
          >
            {prefix}
          </span>
        )}
        <input
          type="text"
          inputMode={inputMode}
          disabled={disabled}
          value={isAnchorMatch ? "" : customValue}
          placeholder={isAnchorMatch ? "Custom" : ""}
          onChange={(e) => onChangeCustom(e.target.value)}
          onBlur={onBlurCustom}
          style={{
            width: "100%",
            padding: prefix ? "7px 10px 7px 22px" : "7px 10px",
            border: error ? "1px solid #ef4444" : "1px solid #d1d5db",
            borderRadius: 6,
            fontSize: 13,
            fontFamily: "system-ui, sans-serif",
            boxSizing: "border-box",
            background: disabled ? "#f3f4f6" : "#fff",
            color: disabled ? "#9ca3af" : "#111827",
          }}
        />
        {suffix && (
          <span
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 12,
              color: "#9ca3af",
              pointerEvents: "none",
            }}
          >
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <div style={{ color: "#ef4444", fontSize: 11, marginTop: 3 }}>{error}</div>
      )}
    </div>
  );
}
