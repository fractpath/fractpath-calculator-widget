import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

type HelpTooltipProps = {
  simpleDefinition: string;
  impact: string;
};

export function HelpTooltip({ simpleDefinition, impact }: HelpTooltipProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        btnRef.current && !btnRef.current.contains(e.target as Node) &&
        tooltipRef.current && !tooltipRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({
      top: rect.top + window.scrollY - 8,
      left: rect.left + rect.width / 2 + window.scrollX,
    });
  }, [open]);

  return (
    <span style={{ display: "inline-block", marginLeft: 4 }}>
      <button
        ref={btnRef}
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
      {open &&
        createPortal(
          <div
            ref={tooltipRef}
            style={{
              position: "absolute",
              top: pos.top,
              left: pos.left,
              transform: "translate(-50%, -100%)",
              background: "#1f2937",
              color: "#f9fafb",
              borderRadius: 8,
              padding: "10px 12px",
              fontSize: 12,
              lineHeight: 1.5,
              width: 240,
              zIndex: 99999,
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              pointerEvents: "auto",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{simpleDefinition}</div>
            <div style={{ color: "#d1d5db" }}>{impact}</div>
          </div>,
          document.body,
        )}
    </span>
  );
}
