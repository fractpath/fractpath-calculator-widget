import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { FractPathCalculatorWidget } from "./widget/FractPathCalculatorWidget.js";
import type { CalculatorPersona } from "./widget/types.js";
import "./index.css";

function DevHarness() {
  const [persona, setPersona] = useState<CalculatorPersona>("buyer");
  const [mode, setMode] = useState<"default" | "share">("default");

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <div style={{ marginBottom: 16, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "#6b7280" }}>Persona:</span>
        {(["buyer", "homeowner", "investor", "realtor", "ops"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPersona(p)}
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              border: persona === p ? "2px solid #111827" : "1px solid #d1d5db",
              background: persona === p ? "#111827" : "#fff",
              color: persona === p ? "#fff" : "#374151",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {p}
          </button>
        ))}
        <span style={{ marginLeft: 12, fontSize: 13, color: "#6b7280" }}>Mode:</span>
        <button
          onClick={() => setMode(mode === "default" ? "share" : "default")}
          style={{
            padding: "4px 10px",
            borderRadius: 6,
            border: "1px solid #d1d5db",
            background: mode === "share" ? "#f59e0b" : "#fff",
            color: mode === "share" ? "#fff" : "#374151",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          {mode}
        </button>
      </div>
      <FractPathCalculatorWidget
        persona={persona}
        mode={mode}
        onEvent={(e) => console.log("[WidgetEvent]", e)}
      />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DevHarness />
  </StrictMode>
);
