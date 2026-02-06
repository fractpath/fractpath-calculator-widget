import { useEffect, useMemo, useState } from "react";
import type { FractPathCalculatorWidgetProps } from "./types.js";

import { computeScenario } from "../calc/calc.js";
import { buildChartSeries } from "../calc/chart.js";
import { DEFAULT_INPUTS } from "../calc/constants.js";
import { EquityChart } from "../components/EquityChart.js";
import { formatCurrency, formatPct, formatMonth } from "./format.js";
import { getPersonaConfig } from "./persona.js";

const inputLabelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  color: "#6b7280",
  marginBottom: 4,
  fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  fontSize: 14,
  fontFamily: "system-ui, sans-serif",
  boxSizing: "border-box",
};

const inputGroupStyle: React.CSSProperties = {
  marginBottom: 14,
};

const cardStyle: React.CSSProperties = {
  padding: 12,
  background: "#f9fafb",
  borderRadius: 8,
  border: "1px solid #e5e7eb",
};

export function WiredCalculatorWidget(props: FractPathCalculatorWidgetProps) {
  const { persona, mode = "default", onEvent } = props;

  const [homeValue, setHomeValue] = useState(DEFAULT_INPUTS.homeValue);
  const [initialBuyAmount, setInitialBuyAmount] = useState(DEFAULT_INPUTS.initialBuyAmount);
  const [termYears, setTermYears] = useState(DEFAULT_INPUTS.termYears);
  const [growthRatePct, setGrowthRatePct] = useState(DEFAULT_INPUTS.annualGrowthRate * 100);

  useEffect(() => {
    onEvent?.({ type: "calculator_used", persona });
  }, [persona, onEvent]);

  useEffect(() => {
    if (mode === "share") {
      onEvent?.({ type: "share_mode_viewed", persona });
    }
  }, [mode, persona, onEvent]);

  const outputs = useMemo(
    () =>
      computeScenario({
        homeValue,
        initialBuyAmount,
        termYears,
        annualGrowthRate: growthRatePct / 100,
      }),
    [homeValue, initialBuyAmount, termYears, growthRatePct]
  );

  const chart = useMemo(() => buildChartSeries(outputs), [outputs]);

  const personaCfg = getPersonaConfig(persona);
  const heroValue = personaCfg.heroValue(outputs);

  const settlements = [
    { label: "Early", data: outputs.settlements.early },
    { label: "Standard", data: outputs.settlements.standard },
    { label: "Late", data: outputs.settlements.late },
  ] as const;

  const parseNumber = (raw: string, fallback: number): number => {
    const n = Number(raw.replace(/,/g, ""));
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: 16,
        fontFamily: "system-ui, sans-serif",
        maxWidth: 900,
      }}
      data-fractpath-widget
      data-persona={persona}
      data-mode={mode}
    >
      <h2 style={{ margin: 0, marginBottom: 4, fontSize: 20 }}>FractPath Calculator</h2>
      <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 12, fontStyle: "italic" }}>
        Demo / Placeholder — real logic will be wired in future WGT tickets
      </div>

      {mode === "share" && (
        <div
          style={{
            marginBottom: 12,
            padding: 10,
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            background: "#f9fafb",
            color: "#374151",
            fontSize: 13,
          }}
        >
          <strong>Share mode:</strong> results are fully visible. Lead capture is disabled.
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(220px, 1fr) minmax(320px, 2fr)",
          gap: 20,
        }}
      >
        {/* ── Inputs Panel ── */}
        <div>
          <h3 style={{ margin: "0 0 12px 0", fontSize: 14, color: "#374151" }}>Inputs</h3>

          <div style={inputGroupStyle}>
            <label style={inputLabelStyle}>Home Value ($)</label>
            <input
              type="text"
              inputMode="numeric"
              style={inputStyle}
              value={homeValue.toLocaleString()}
              onChange={(e) => setHomeValue(parseNumber(e.target.value, homeValue))}
            />
          </div>

          <div style={inputGroupStyle}>
            <label style={inputLabelStyle}>Initial Buy Amount ($)</label>
            <input
              type="text"
              inputMode="numeric"
              style={inputStyle}
              value={initialBuyAmount.toLocaleString()}
              onChange={(e) => setInitialBuyAmount(parseNumber(e.target.value, initialBuyAmount))}
            />
          </div>

          <div style={inputGroupStyle}>
            <label style={inputLabelStyle}>Term (years)</label>
            <input
              type="number"
              min={1}
              max={30}
              step={1}
              style={inputStyle}
              value={termYears}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (Number.isFinite(v) && v >= 1 && v <= 30) setTermYears(v);
              }}
            />
          </div>

          <div style={inputGroupStyle}>
            <label style={inputLabelStyle}>Annual Growth Rate (%)</label>
            <input
              type="number"
              min={0}
              max={20}
              step={0.1}
              style={inputStyle}
              value={growthRatePct}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (Number.isFinite(v) && v >= 0 && v <= 20) setGrowthRatePct(v);
              }}
            />
          </div>
        </div>

        {/* ── Outputs Panel ── */}
        <div>
          {/* Hero metric */}
          <div
            style={{
              ...cardStyle,
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
              {personaCfg.heroLabel}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#111827" }}>
              {formatCurrency(heroValue)}
            </div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
              {personaCfg.helperText}
            </div>
          </div>

          {/* Settlement rows */}
          <h3 style={{ margin: "0 0 8px 0", fontSize: 14, color: "#374151" }}>
            Settlement Scenarios
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
            {settlements.map((s) => (
              <div
                key={s.label}
                style={{
                  ...cardStyle,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr 1fr",
                  gap: 8,
                  alignItems: "center",
                  padding: "10px 12px",
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>Timing</div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{s.label}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>When</div>
                  <div style={{ fontSize: 13 }}>{formatMonth(s.data.settlementMonth)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>Net Payout</div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>
                    {formatCurrency(s.data.netPayout)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>Clamp</div>
                  <div style={{ fontSize: 13 }}>
                    {s.data.clamp.applied === "none"
                      ? "—"
                      : s.data.clamp.applied === "floor"
                        ? "Floor"
                        : "Cap"}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <EquityChart series={chart} width={520} height={240} />
        </div>
      </div>

      <div style={{ marginTop: 12, color: "#9ca3af", fontSize: 11, textAlign: "center" }}>
        Viewing as <strong>{persona}</strong>
        {" · "}
        Inputs: {formatCurrency(homeValue)} home · {formatCurrency(initialBuyAmount)} buy ·{" "}
        {termYears}yr · {formatPct(growthRatePct / 100)} growth
      </div>
    </div>
  );
}
