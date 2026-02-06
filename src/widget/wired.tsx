import { useEffect, useMemo } from "react";
import type { FractPathCalculatorWidgetProps } from "./types.js";

import { computeScenario } from "../calc/calc.js";
import { buildChartSeries } from "../calc/chart.js";
import { DEFAULT_INPUTS } from "../calc/constants.js";
import { EquityChart } from "../components/EquityChart.js";

export function WiredCalculatorWidget(props: FractPathCalculatorWidgetProps) {
  const { persona, mode = "default", onEvent } = props;

  useEffect(() => {
    onEvent?.({ type: "calculator_used", persona });
  }, [persona, onEvent]);

  const outputs = useMemo(() => computeScenario(DEFAULT_INPUTS), []);
  const chart = useMemo(() => buildChartSeries(outputs), [outputs]);

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
      <h2 style={{ margin: 0, marginBottom: 8 }}>FractPath Calculator</h2>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <div style={{ padding: 8, background: "#f9fafb", borderRadius: 8, border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Persona</div>
          <div style={{ fontWeight: 600 }}>{persona}</div>
        </div>
        <div style={{ padding: 8, background: "#f9fafb", borderRadius: 8, border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Mode</div>
          <div style={{ fontWeight: 600 }}>{mode}</div>
        </div>

        <div style={{ padding: 8, background: "#f9fafb", borderRadius: 8, border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Home value</div>
          <div style={{ fontWeight: 600 }}>${outputs.normalizedInputs.homeValue.toLocaleString()}</div>
        </div>
        <div style={{ padding: 8, background: "#f9fafb", borderRadius: 8, border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Initial buy amount</div>
          <div style={{ fontWeight: 600 }}>${outputs.normalizedInputs.initialBuyAmount.toLocaleString()}</div>
        </div>
      </div>

      <EquityChart series={chart} width={720} height={260} />

      <div style={{ marginTop: 12, color: "#6b7280", fontSize: 12 }}>
        Placeholder widget: inputs + gating UI coming next (WGT-030 / WGT-031).
      </div>
    </div>
  );
}
