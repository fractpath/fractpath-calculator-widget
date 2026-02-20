import { useCallback, useEffect, useMemo, useState } from "react";
import type { FractPathCalculatorWidgetProps } from "./types.js";
import type { CalculatorPersona } from "./types.js";
import type { DealTerms, ScenarioAssumptions, RealtorRepresentationMode } from "@fractpath/compute";
import { computeDeal } from "@fractpath/compute";

import { computeScenario } from "../calc/calc.js";
import { buildChartSeries } from "../calc/chart.js";
import { EquityChart } from "../components/EquityChart.js";
import { formatCurrency, formatPct, formatMonth } from "./format.js";
import { getLabel } from "./persona.js";
import {
  buildFullDealSnapshotV1,
} from "./snapshot.js";
import { deterministicHash } from "./hash.js";
import { CONTRACT_VERSION, SCHEMA_VERSION } from "./types.js";
import { FEE_DEFAULTS } from "./editing/feeDefaults.js";
import { resolvePersonaPresentation } from "./personaPresentation.js";
import { SimpleBarChart } from "./components/SimpleBarChart.js";

export type MarketingLiteState = {
  propertyValue: number;
  upfrontPayment: number;
  monthlyPayment: number;
  numberOfPayments: number;
  exitYear: number;
  growthRatePct: number;
  realtorMode: RealtorRepresentationMode;
  realtorPct: number;
};

export function buildMarketingDealTerms(state: MarketingLiteState): DealTerms {
  return {
    property_value: state.propertyValue,
    upfront_payment: state.upfrontPayment,
    monthly_payment: state.monthlyPayment,
    number_of_payments: state.numberOfPayments,
    payback_window_start_year: Math.max(0, Math.floor(state.exitYear / 3)),
    payback_window_end_year: Math.max(1, Math.ceil((state.exitYear * 2) / 3)),
    timing_factor_early: 1,
    timing_factor_late: 1,
    floor_multiple: 1.10,
    ceiling_multiple: 2.00,
    downside_mode: "HARD_FLOOR",
    contract_maturity_years: 30,
    liquidity_trigger_year: 13,
    minimum_hold_years: 2,
    platform_fee: FEE_DEFAULTS.platform_fee,
    servicing_fee_monthly: FEE_DEFAULTS.servicing_fee_monthly,
    exit_fee_pct: FEE_DEFAULTS.exit_fee_pct,
    duration_yield_floor_enabled: false,
    duration_yield_floor_start_year: null,
    duration_yield_floor_min_multiple: null,
    realtor_representation_mode: state.realtorMode,
    realtor_commission_pct: state.realtorPct / 100,
    realtor_commission_payment_mode: "PER_PAYMENT_EVENT",
  };
}

export function buildMarketingAssumptions(state: MarketingLiteState): ScenarioAssumptions {
  return {
    annual_appreciation: state.growthRatePct / 100,
    closing_cost_pct: 0,
    exit_year: state.exitYear,
  };
}

const MARKETING_PERSONAS: CalculatorPersona[] = ["buyer", "homeowner", "realtor"];

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

const chipStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "4px 10px",
  background: "#f3f4f6",
  borderRadius: 16,
  fontSize: 12,
  color: "#374151",
  border: "1px solid #e5e7eb",
  whiteSpace: "nowrap",
};

const chipLabelStyle: React.CSSProperties = {
  color: "#6b7280",
  fontWeight: 400,
};

const chipValueStyle: React.CSSProperties = {
  fontWeight: 600,
};

export { MARKETING_PERSONAS };

function isDevMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return (
      import.meta.env.VITE_DEV_HARNESS === "true" ||
      new URLSearchParams(window.location.search).get("DEV_HARNESS") === "true" ||
      import.meta.env.DEV === true
    );
  } catch {
    return false;
  }
}

function getDevAuth(): "loggedOut" | "viewer" | "editor" | null {
  if (!isDevMode()) return null;
  if (typeof window === "undefined") return null;
  try {
    const param = new URLSearchParams(window.location.search).get("devAuth");
    if (param === "editor" || param === "viewer" || param === "loggedOut") return param;
    const envVal = import.meta.env.VITE_DEV_AUTH;
    if (envVal === "editor" || envVal === "viewer" || envVal === "loggedOut") return envVal;
  } catch { /* ignore */ }
  return null;
}

function formatChipValue(value: number | string, fmt: string): string {
  if (typeof value === "string") return value;
  switch (fmt) {
    case "currency":
      return formatCurrency(value);
    case "percent":
      return formatPct(value);
    case "multiple":
      return `${value.toFixed(2)}×`;
    case "months":
      return `${value}`;
    default:
      return String(value);
  }
}

export function WiredCalculatorWidget(props: FractPathCalculatorWidgetProps) {
  const {
    persona,
    mode = "marketing",
    canEdit: canEditProp,
    onEvent,
    onDraftSnapshot,
    onShareSummary,
    onSave,
  } = props;

  const isApp = mode === "app";
  const isMarketing = mode === "marketing";

  const devAuth = getDevAuth();
  const canEdit = devAuth === "editor" ? true : devAuth === "viewer" || devAuth === "loggedOut" ? false : (canEditProp ?? false);

  const [showEditModal, setShowEditModal] = useState(false);

  const [propertyValue, setPropertyValue] = useState(600_000);
  const [upfrontPayment, setUpfrontPayment] = useState(100_000);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [numberOfPayments, setNumberOfPayments] = useState(0);
  const [exitYear, setExitYear] = useState(10);
  const [growthRatePct, setGrowthRatePct] = useState(3.0);

  const [realtorMode, setRealtorMode] = useState<RealtorRepresentationMode>("NONE");
  const [realtorPct, setRealtorPct] = useState(0);

  useEffect(() => {
    onEvent?.({ type: "calculator_used", persona });
  }, [persona, onEvent]);

  const liteState: MarketingLiteState = useMemo(() => ({
    propertyValue,
    upfrontPayment,
    monthlyPayment,
    numberOfPayments,
    exitYear,
    growthRatePct,
    realtorMode,
    realtorPct,
  }), [propertyValue, upfrontPayment, monthlyPayment, numberOfPayments, exitYear, growthRatePct, realtorMode, realtorPct]);

  const dealTerms = useMemo(() => buildMarketingDealTerms(liteState), [liteState]);
  const assumptions = useMemo(() => buildMarketingAssumptions(liteState), [liteState]);

  const canonicalResult = useMemo(
    () => computeDeal(dealTerms, assumptions),
    [dealTerms, assumptions],
  );

  const presentation = useMemo(
    () => resolvePersonaPresentation(persona, dealTerms, assumptions, canonicalResult),
    [persona, dealTerms, assumptions, canonicalResult],
  );

  const settlementMonth = exitYear * 12;

  const appOutputs = useMemo(
    () =>
      isApp
        ? computeScenario({
            homeValue: propertyValue,
            initialBuyAmount: upfrontPayment,
            termYears: exitYear,
            annualGrowthRate: growthRatePct / 100,
          })
        : null,
    [isApp, propertyValue, upfrontPayment, exitYear, growthRatePct],
  );

  const chart = useMemo(
    () => (appOutputs ? buildChartSeries(appOutputs) : null),
    [appOutputs],
  );

  const parseNumber = (raw: string, fallback: number): number => {
    const n = Number(raw.replace(/,/g, ""));
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };

  const handleSave = useCallback(() => {
    onEvent?.({ type: "save_clicked", persona });
    if (onSave && appOutputs) {
      const snapshot = buildFullDealSnapshotV1(appOutputs.normalizedInputs);
      onSave(snapshot);
    }
  }, [appOutputs, onSave, onEvent, persona]);

  const handleMarketingSave = useCallback(async () => {
    onEvent?.({ type: "save_continue_clicked", persona });
    if (onDraftSnapshot) {
      const inputs = {
        homeValue: propertyValue,
        initialBuyAmount: upfrontPayment,
        termYears: exitYear,
        annualGrowthRate: growthRatePct / 100,
      };
      const basic_results = {
        standard_net_payout: canonicalResult.isa_settlement,
        early_net_payout: canonicalResult.isa_settlement,
        late_net_payout: canonicalResult.isa_settlement,
        standard_settlement_month: settlementMonth,
        early_settlement_month: settlementMonth,
        late_settlement_month: settlementMonth,
      };
      const [input_hash, output_hash] = await Promise.all([
        deterministicHash(inputs as unknown as Record<string, unknown>),
        deterministicHash(basic_results as unknown as Record<string, unknown>),
      ]);
      onDraftSnapshot({
        contract_version: CONTRACT_VERSION,
        schema_version: SCHEMA_VERSION,
        persona,
        mode: "marketing",
        inputs,
        basic_results,
        input_hash,
        output_hash,
        created_at: new Date().toISOString(),
      });
    }
  }, [persona, propertyValue, upfrontPayment, exitYear, growthRatePct, canonicalResult, settlementMonth, onDraftSnapshot, onEvent]);

  const handleMarketingShare = useCallback(() => {
    onEvent?.({ type: "share_clicked", persona });
    if (onShareSummary) {
      onShareSummary({
        contract_version: CONTRACT_VERSION,
        schema_version: SCHEMA_VERSION,
        persona,
        inputs: {
          homeValue: propertyValue,
          initialBuyAmount: upfrontPayment,
          termYears: exitYear,
          annualGrowthRate: growthRatePct / 100,
        },
        basic_results: {
          standard_net_payout: canonicalResult.isa_settlement,
          early_net_payout: canonicalResult.isa_settlement,
          late_net_payout: canonicalResult.isa_settlement,
        },
        created_at: new Date().toISOString(),
      });
    }
  }, [persona, propertyValue, upfrontPayment, exitYear, growthRatePct, canonicalResult, onShareSummary, onEvent]);

  const readonlyChips = useMemo(() => {
    const chips: { label: string; value: string }[] = [
      { label: "Property", value: formatCurrency(propertyValue) },
      { label: "Upfront", value: formatCurrency(upfrontPayment) },
      { label: "Monthly", value: formatCurrency(monthlyPayment) },
      { label: "# Months", value: String(numberOfPayments) },
      { label: "Exit Year", value: String(exitYear) },
      { label: "Growth", value: formatPct(growthRatePct / 100) },
    ];
    if (realtorMode !== "NONE") {
      chips.push({ label: "Realtor", value: `${realtorMode} ${realtorPct}%` });
    }
    return chips;
  }, [propertyValue, upfrontPayment, monthlyPayment, numberOfPayments, exitYear, growthRatePct, realtorMode, realtorPct]);

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

      {isApp && (
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              alignItems: "center",
            }}
            data-testid="deal-term-chips"
          >
            {readonlyChips.map((c, i) => (
              <span key={i} style={chipStyle}>
                <span style={chipLabelStyle}>{c.label}:</span>
                <span style={chipValueStyle}>{c.value}</span>
              </span>
            ))}
          </div>
          {canEdit && (
            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              style={{
                marginTop: 8,
                padding: "6px 14px",
                borderRadius: 6,
                border: "1px solid #d1d5db",
                background: "#fff",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "system-ui, sans-serif",
                color: "#374151",
              }}
              data-testid="edit-button"
            >
              Edit
            </button>
          )}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isApp ? "1fr" : "minmax(220px, 1fr) minmax(320px, 2fr)",
          gap: 20,
        }}
      >
        {isMarketing && (
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
                value={propertyValue.toLocaleString()}
                onChange={(e) => {
                  setPropertyValue(parseNumber(e.target.value, propertyValue));
                }}
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={inputLabelStyle}>
                {getLabel("deal_terms.upfront_payment", persona, "Upfront Payment ($)")}
              </label>
              <input
                type="text"
                inputMode="numeric"
                style={inputStyle}
                value={upfrontPayment.toLocaleString()}
                onChange={(e) => {
                  setUpfrontPayment(
                    parseNumber(e.target.value, upfrontPayment),
                  );
                }}
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={inputLabelStyle}>
                {getLabel("deal_terms.monthly_payment", persona, "Monthly Installment ($)")}
              </label>
              <input
                type="text"
                inputMode="numeric"
                style={inputStyle}
                value={monthlyPayment.toLocaleString()}
                onChange={(e) => {
                  setMonthlyPayment(parseNumber(e.target.value, monthlyPayment));
                }}
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={inputLabelStyle}>
                Number of Monthly Payments
              </label>
              <input
                type="number"
                min={0}
                max={360}
                step={1}
                style={inputStyle}
                value={numberOfPayments}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (Number.isFinite(v) && v >= 0 && v <= 360) {
                    setNumberOfPayments(v);
                  }
                }}
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={inputLabelStyle}>
                {getLabel("scenario.exit_year", persona, "Target Exit Year")}
              </label>
              <input
                type="number"
                min={1}
                max={30}
                step={1}
                style={inputStyle}
                value={exitYear}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (Number.isFinite(v) && v >= 1 && v <= 30) {
                    setExitYear(v);
                  }
                }}
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={inputLabelStyle}>
                Annual Growth Rate (assumption)
              </label>
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

            <div style={inputGroupStyle}>
              <label style={inputLabelStyle}>
                {getLabel("deal_terms.realtor_representation_mode", persona, "Realtor Representation")}
              </label>
              <select
                value={realtorMode}
                onChange={(e) => {
                  setRealtorMode(e.target.value as RealtorRepresentationMode);
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

            {isMarketing && (
              <div style={{ marginTop: 12 }}>
                <h4 style={{ margin: "0 0 8px 0", fontSize: 12, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Fees
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ padding: "6px 10px", background: "#f3f4f6", borderRadius: 6, fontSize: 13, color: "#6b7280", border: "1px solid #e5e7eb" }}>
                    Platform fee: {formatCurrency(FEE_DEFAULTS.platform_fee)}
                  </div>
                  <div style={{ padding: "6px 10px", background: "#f3f4f6", borderRadius: 6, fontSize: 13, color: "#6b7280", border: "1px solid #e5e7eb" }}>
                    Monthly servicing: {formatCurrency(FEE_DEFAULTS.servicing_fee_monthly)}
                  </div>
                  <div style={{ padding: "6px 10px", background: "#f3f4f6", borderRadius: 6, fontSize: 13, color: "#6b7280", border: "1px solid #e5e7eb" }}>
                    Exit fee: {formatPct(FEE_DEFAULTS.exit_fee_pct)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div>
          <div
            style={{
              ...cardStyle,
              marginBottom: 16,
              textAlign: "center",
            }}
            data-testid="hero-metric"
          >
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
              {presentation.hero.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#111827" }}>
              {formatChipValue(presentation.hero.value, presentation.hero.valueFormat)}
            </div>
            {presentation.hero.subtitle && (
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                {presentation.hero.subtitle}
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              marginBottom: 16,
            }}
            data-testid="summary-strip"
          >
            {presentation.strip.map((chip, i) => (
              <span key={i} style={chipStyle}>
                <span style={chipLabelStyle}>{chip.label}:</span>
                <span style={chipValueStyle}>{formatChipValue(chip.value, chip.valueFormat)}</span>
              </span>
            ))}
          </div>

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

          {isMarketing && (
            <div style={{ marginBottom: 16 }}>
              <SimpleBarChart bars={presentation.chartSpec.bars} width={480} height={200} />
            </div>
          )}

          {isMarketing && (
            <div style={{ ...cardStyle, marginBottom: 16, padding: "10px 12px" }}>
              <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>
                <strong>Standard</strong> · {formatMonth(settlementMonth)} · Net Payout: {formatCurrency(canonicalResult.isa_settlement)}
              </div>
            </div>
          )}

          {!isMarketing && appOutputs && (
            <>
              <h3 style={{ margin: "0 0 8px 0", fontSize: 14, color: "#374151" }}>
                Settlement Scenarios
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  marginBottom: 16,
                }}
              >
                {([
                  { label: "Early", data: appOutputs.settlements.early },
                  { label: "Standard", data: appOutputs.settlements.standard },
                  { label: "Late", data: appOutputs.settlements.late },
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
            </>
          )}

          {!isMarketing && chart && (
            <EquityChart series={chart} width={520} height={240} />
          )}

          {isMarketing && (
            <ul
              style={{
                margin: "0 0 12px 0",
                padding: "0 0 0 18px",
                fontSize: 12,
                lineHeight: 1.7,
                color: "#374151",
              }}
              data-testid="marketing-bullets"
            >
              {presentation.marketingBullets.map((bullet, i) => (
                <li key={i} style={{ marginBottom: 2 }}>{bullet}</li>
              ))}
            </ul>
          )}

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
                  onClick={handleMarketingSave}
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
                  onClick={handleMarketingShare}
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

      {isMarketing && isDevMode() && (
        <details style={{ marginTop: 12, fontSize: 11, color: "#6b7280" }}>
          <summary style={{ cursor: "pointer" }}>Canonical deal_terms (debug)</summary>
          <pre style={{ whiteSpace: "pre-wrap", background: "#f9fafb", padding: 8, borderRadius: 6, marginTop: 4 }}>
            {JSON.stringify({ deal_terms: dealTerms, assumptions, result: { isa_settlement: canonicalResult.isa_settlement, invested_capital_total: canonicalResult.invested_capital_total, vested_equity_percentage: canonicalResult.vested_equity_percentage } }, null, 2)}
          </pre>
        </details>
      )}

      {showEditModal && canEdit && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          data-testid="edit-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowEditModal(false);
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 24,
              maxWidth: 600,
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>Edit Deal Terms</h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#6b7280" }}
              >
                ×
              </button>
            </div>
            <p style={{ fontSize: 13, color: "#6b7280" }}>
              The full tabbed editor (DealEditModal) opens here. This is a placeholder for the existing edit modal integration.
            </p>
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              style={{ ...ctaButtonStyle, background: "#111827", color: "#fff", marginTop: 12 }}
            >
              Close
            </button>
          </div>
        </div>
      )}

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
        {devAuth && <> · DEV_AUTH: <strong>{devAuth}</strong></>}
        {" · "}
        {formatCurrency(propertyValue)} home · {formatCurrency(upfrontPayment)}{" "}
        upfront · {formatCurrency(monthlyPayment)}×{numberOfPayments}mo · {exitYear}yr · {formatPct(growthRatePct / 100)} growth
      </div>
    </div>
  );
}
