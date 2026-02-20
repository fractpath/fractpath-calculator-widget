import { useCallback, useEffect, useMemo, useState } from "react";
import type { FractPathCalculatorWidgetProps } from "./types.js";

import { computeScenario } from "../calc/calc.js";
import { buildChartSeries } from "../calc/chart.js";
import { DEFAULT_INPUTS } from "../calc/constants.js";
import { EquityChart } from "../components/EquityChart.js";
import { formatCurrency, formatPct, formatMonth } from "./format.js";
import { getPersonaConfig, getLabel } from "./persona.js";
import {
  buildDraftSnapshot,
  buildShareSummary,
  buildFullDealSnapshotV1,
} from "./snapshot.js";
import { FEE_DEFAULTS } from "./editing/feeDefaults.js";

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

const ctaButtonStyle: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: 8,
  border: "none",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "system-ui, sans-serif",
};

const readonlyFeeStyle: React.CSSProperties = {
  padding: "6px 10px",
  background: "#f3f4f6",
  borderRadius: 6,
  fontSize: 13,
  color: "#6b7280",
  border: "1px solid #e5e7eb",
};

export function WiredCalculatorWidget(props: FractPathCalculatorWidgetProps) {
  const {
    persona,
    mode = "marketing",
    onEvent,
    onDraftSnapshot,
    onShareSummary,
    onSave,
  } = props;

  const isApp = mode === "app";
  const isMarketing = mode === "marketing";

  const [homeValue, setHomeValue] = useState(DEFAULT_INPUTS.homeValue);
  const [initialBuyAmount, setInitialBuyAmount] = useState(
    DEFAULT_INPUTS.initialBuyAmount,
  );
  const [termYears, setTermYears] = useState(DEFAULT_INPUTS.termYears);
  const [growthRatePct, setGrowthRatePct] = useState(
    DEFAULT_INPUTS.annualGrowthRate * 100,
  );

  const [realtorMode, setRealtorMode] = useState<string>("NONE");
  const [realtorPct, setRealtorPct] = useState(0);

  useEffect(() => {
    onEvent?.({ type: "calculator_used", persona });
  }, [persona, onEvent]);

  const outputs = useMemo(
    () =>
      computeScenario({
        homeValue,
        initialBuyAmount,
        termYears,
        annualGrowthRate: growthRatePct / 100,
      }),
    [homeValue, initialBuyAmount, termYears, growthRatePct],
  );

  const chart = useMemo(() => buildChartSeries(outputs), [outputs]);

  const personaCfg = getPersonaConfig(persona);
  const heroValue = personaCfg.heroValue(outputs);

  const parseNumber = (raw: string, fallback: number): number => {
    const n = Number(raw.replace(/,/g, ""));
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const handleSaveContinue = useCallback(async () => {
    onEvent?.({ type: "save_continue_clicked", persona });
    if (onDraftSnapshot) {
      const snapshot = await buildDraftSnapshot(
        persona,
        outputs.normalizedInputs,
        outputs,
      );
      onDraftSnapshot(snapshot);
    }
  }, [persona, outputs, onDraftSnapshot, onEvent]);

  const handleShare = useCallback(() => {
    onEvent?.({ type: "share_clicked", persona });
    if (onShareSummary) {
      const summary = buildShareSummary(
        persona,
        outputs.normalizedInputs,
        outputs,
      );
      onShareSummary(summary);
    }
  }, [persona, outputs, onShareSummary, onEvent]);

  const handleSave = useCallback(() => {
    onEvent?.({ type: "save_clicked", persona });
    if (onSave) {
      const snapshot = buildFullDealSnapshotV1(outputs.normalizedInputs);
      onSave(snapshot);
    }
  }, [outputs, onSave, onEvent, persona]);

  const standardSettlement = outputs.settlements.standard;

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
      <h2 style={{ margin: 0, marginBottom: 4, fontSize: 20 }}>
        FractPath Calculator
      </h2>
      <div
        style={{
          fontSize: 11,
          color: "#9ca3af",
          marginBottom: 12,
          fontStyle: "italic",
        }}
      >
        {isMarketing
          ? "Basic Results — upgrade for full analysis"
          : "Full Analysis"}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(220px, 1fr) minmax(320px, 2fr)",
          gap: 20,
        }}
      >
        {/* Inputs Panel */}
        <div>
          <h3 style={{ margin: "0 0 12px 0", fontSize: 14, color: "#374151" }}>
            Inputs
          </h3>

          <div style={inputGroupStyle}>
            <label style={inputLabelStyle}>
              {getLabel("deal_terms.property_value", persona, "Home Value ($)")}
            </label>
            <input
              type="text"
              inputMode="numeric"
              style={inputStyle}
              value={homeValue.toLocaleString()}
              onChange={(e) => {
                setHomeValue(parseNumber(e.target.value, homeValue));
              }}
            />
          </div>

          <div style={inputGroupStyle}>
            <label style={inputLabelStyle}>
              {getLabel("deal_terms.upfront_payment", persona, "Initial Buy Amount ($)")}
            </label>
            <input
              type="text"
              inputMode="numeric"
              style={inputStyle}
              value={initialBuyAmount.toLocaleString()}
              onChange={(e) => {
                setInitialBuyAmount(
                  parseNumber(e.target.value, initialBuyAmount),
                );
              }}
            />
          </div>

          <div style={inputGroupStyle}>
            <label style={inputLabelStyle}>
              {getLabel("scenario.exit_year", persona, "Term (years)")}
            </label>
            <input
              type="number"
              min={1}
              max={30}
              step={1}
              style={inputStyle}
              value={termYears}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (Number.isFinite(v) && v >= 1 && v <= 30) {
                  setTermYears(v);
                }
              }}
            />
          </div>

          {/* Growth rate: editable in app, read-only assumption in marketing */}
          {isApp && (
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
                  if (Number.isFinite(v) && v >= 0 && v <= 20) {
                    setGrowthRatePct(v);
                  }
                }}
              />
            </div>
          )}

          {/* Realtor inputs */}
          <div style={inputGroupStyle}>
            <label style={inputLabelStyle}>
              {getLabel("deal_terms.realtor_representation_mode", persona, "Realtor Representation")}
            </label>
            <select
              value={realtorMode}
              onChange={(e) => {
                setRealtorMode(e.target.value);
                if (e.target.value === "NONE") setRealtorPct(0);
              }}
              style={{
                ...inputStyle,
                padding: "7px 10px",
              }}
            >
              <option value="NONE">None</option>
              <option value="BUYER">Buyer</option>
              <option value="SELLER">Seller</option>
              <option value="DUAL">Dual</option>
            </select>
          </div>

          {realtorMode !== "NONE" && (
            <div style={inputGroupStyle}>
              <label style={inputLabelStyle}>
                {getLabel("deal_terms.realtor_commission_pct", persona, "Commission (%)")}
              </label>
              <input
                type="number"
                min={0}
                max={6}
                step={0.5}
                style={inputStyle}
                value={realtorPct}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  if (Number.isFinite(v) && v >= 0 && v <= 6) {
                    setRealtorPct(v);
                  }
                }}
              />
            </div>
          )}

          {/* Fee defaults — read-only display */}
          {isMarketing && (
            <div style={{ marginTop: 12 }}>
              <h4 style={{ margin: "0 0 8px 0", fontSize: 12, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Fees
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={readonlyFeeStyle}>
                  Platform fee: {formatCurrency(FEE_DEFAULTS.platform_fee)}
                </div>
                <div style={readonlyFeeStyle}>
                  Monthly servicing: {formatCurrency(FEE_DEFAULTS.servicing_fee_monthly)}
                </div>
                <div style={readonlyFeeStyle}>
                  Exit fee: {formatPct(FEE_DEFAULTS.exit_fee_pct)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Outputs Panel */}
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

          {/* Marketing: assumption disclosure */}
          {isMarketing && (
            <div
              style={{
                padding: "10px 12px",
                background: "#fffbeb",
                border: "1px solid #fde68a",
                borderRadius: 8,
                fontSize: 12,
                lineHeight: 1.6,
                color: "#92400e",
                marginBottom: 16,
              }}
            >
              <div>Projections assume {formatPct(growthRatePct / 100)} annual appreciation.</div>
              <div style={{ marginTop: 4 }}>
                Register free to model different growth scenarios, protections (floor/cap), and early/late settlement timing.
              </div>
            </div>
          )}

          {/* Settlement rows */}
          <h3 style={{ margin: "0 0 8px 0", fontSize: 14, color: "#374151" }}>
            {isMarketing ? "Settlement Projection" : "Settlement Scenarios"}
          </h3>

          {isMarketing ? (
            /* Marketing: standard scenario only */
            <div
              style={{
                ...cardStyle,
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 8,
                alignItems: "center",
                padding: "10px 12px",
                marginBottom: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>Timing</div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>Standard</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>When</div>
                <div style={{ fontSize: 13 }}>
                  {formatMonth(standardSettlement.settlementMonth)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>Net Payout</div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>
                  {formatCurrency(standardSettlement.netPayout)}
                </div>
              </div>
            </div>
          ) : (
            /* App: all settlement scenarios */
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                marginBottom: 16,
              }}
            >
              {([
                { label: "Early", data: outputs.settlements.early },
                { label: "Standard", data: outputs.settlements.standard },
                { label: "Late", data: outputs.settlements.late },
              ] as const).map((s) => (
                <div
                  key={s.label}
                  style={{
                    ...cardStyle,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
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
                    <div style={{ fontSize: 13 }}>
                      {formatMonth(s.data.settlementMonth)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>Net Payout</div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                      {formatCurrency(s.data.netPayout)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>Raw Payout</div>
                    <div style={{ fontSize: 13 }}>
                      {formatCurrency(s.data.rawPayout)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>Transfer Fee</div>
                    <div style={{ fontSize: 13 }}>
                      {formatCurrency(s.data.transferFeeAmount)} (
                      {formatPct(s.data.transferFeeRate)})
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
          )}

          {/* Chart — app mode only */}
          {!isMarketing && (
            <EquityChart series={chart} width={520} height={240} />
          )}

          {/* CTAs */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 16,
              flexWrap: "wrap",
            }}
          >
            {isMarketing && (
              <>
                <button
                  type="button"
                  onClick={handleSaveContinue}
                  style={{
                    ...ctaButtonStyle,
                    background: "#111827",
                    color: "#fff",
                  }}
                  data-cta="save-continue"
                >
                  Save &amp; Continue
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  style={{
                    ...ctaButtonStyle,
                    background: "#fff",
                    color: "#111827",
                    border: "1px solid #d1d5db",
                  }}
                  data-cta="share"
                >
                  Share
                </button>
              </>
            )}
            {!isMarketing && (
              <button
                type="button"
                onClick={handleSave}
                style={{
                  ...ctaButtonStyle,
                  background: "#111827",
                  color: "#fff",
                }}
                data-cta="save"
              >
                Save
              </button>
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 12,
          color: "#9ca3af",
          fontSize: 11,
          textAlign: "center",
        }}
      >
        Viewing as <strong>{persona}</strong>
        {" · "}
        Mode: <strong>{mode}</strong>
        {" · "}
        {formatCurrency(homeValue)} home · {formatCurrency(initialBuyAmount)}{" "}
        buy · {termYears}yr · {formatPct(growthRatePct / 100)} growth
      </div>
    </div>
  );
}
