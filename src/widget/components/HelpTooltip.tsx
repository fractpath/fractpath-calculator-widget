import { useState, useRef, useEffect } from "react";

type HelpTooltipProps = {
  simpleDefinition: string;
  impact: string;
};

export function HelpTooltip({ simpleDefinition, impact }: HelpTooltipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <span style={{ position: "relative", display: "inline-block", marginLeft: 4 }} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Help"
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          border: "1px solid #9ca3af",
          background: open ? "#111827" : "#fff",
          color: open ? "#fff" : "#6b7280",
          fontSize: 10,
          fontWeight: 700,
          cursor: "pointer",
          padding: 0,
          lineHeight: "14px",
          textAlign: "center",
          verticalAlign: "middle",
        }}
      >
        ?
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 6px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#1f2937",
            color: "#f9fafb",
            borderRadius: 8,
            padding: "10px 12px",
            fontSize: 12,
            lineHeight: 1.5,
            width: 240,
            zIndex: 100,
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{simpleDefinition}</div>
          <div style={{ color: "#d1d5db" }}>{impact}</div>
        </div>
      )}
    </span>
  );
}
