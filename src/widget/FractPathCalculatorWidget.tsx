import { useEffect } from "react";
import type { FractPathCalculatorWidgetProps } from "./types";

export function FractPathCalculatorWidget(props: FractPathCalculatorWidgetProps) {
  const { persona, mode = "default", onEvent } = props;

  useEffect(() => {
    onEvent?.({ type: "calculator_used", persona });
  }, [persona, onEvent]);

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: 16,
        fontFamily: "system-ui, sans-serif",
      }}
      data-fractpath-widget
      data-persona={persona}
      data-mode={mode}
    >
      <h2 style={{ margin: 0, marginBottom: 8 }}>FractPath Calculator Widget</h2>

      <p style={{ margin: 0 }}>
        <strong>Persona:</strong> {persona}
      </p>
      <p style={{ margin: 0 }}>
        <strong>Mode:</strong> {mode}
      </p>

      <p style={{ marginTop: 12, color: "#6b7280" }}>
        (Placeholder shell — calculator logic not yet wired)
      </p>
    </div>
  );
}
