import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FractPathCalculatorWidgetProps } from "./types.js";
import type { CalculatorPersona } from "./types.js";
import type {
  DealTerms,
  ScenarioAssumptions,
  RealtorRepresentationMode,
} from "../compute.js";
import { computeDeal } from "../compute.js";

import { computeScenario } from "../calc/calc.js";
import { buildChartSeries } from "../calc/chart.js";
import { EquityChart } from "../components/EquityChart.js";
import { formatCurrency, formatPct, formatMonth } from "./format.js";
import { getLabel } from "./persona.js";
import { buildFullDealSnapshotV1 } from "./snapshot.js";
import { deterministicHash } from "./hash.js";
import { CONTRACT_VERSION, SCHEMA_VERSION } from "./types.js";
import { FEE_DEFAULTS } from "./editing/feeDefaults.js";
import { resolvePersonaPresentation } from "./personaPresentation.js";
import { SimpleBarChart } from "./components/SimpleBarChart.js";
import { DealEditModal } from "./components/DealEditModal.js";
import { useDealDraftState } from "./editing/useDealDraftState.js";
import type { DraftCanonicalInputs } from "./editing/types.js";
import { getDefaultDraftCanonicalInputs } from "./editing/defaults.js";

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
    floor_multiple: 1.1,
    ceiling_multiple: 2.0,
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

export function buildMarketingAssumptions(
  state: MarketingLiteState,
): ScenarioAssumptions {
  return {
    annual_appreciation: state.growthRatePct / 100,
    closing_cost_pct: 0,
    exit_year: state.exitYear,
  };
}

const MARKETING_PERSONAS: CalculatorPersona[] = [
  "buyer",
  "homeowner",
  "realtor",
];

export function DealEditModalMount(props: {
  initial: DraftCanonicalInputs;
  persona: CalculatorPersona;
  onClose: () => void;
  onSaved: (saved: DraftCanonicalInputs) => void;
}) {
  const safeInitial = useMemo(() => {
    const defaults = getDefaultDraftCanonicalInputs();

    return {
      ...defaults,
      ...props.initial,
      deal_terms: {
        ...defaults.deal_terms,
        ...(props.initial?.deal_terms ?? {}),
      },
      scenario: {
        ...defaults.scenario,
        ...(props.initial?.scenario ?? {}),
      },
    } satisfies DraftCanonicalInputs;
  }, [props.initial]);

  const { draft, errors, preview, setField, onBlurCompute } =
    useDealDraftState(safeInitial);

  return (
    <DealEditModal
      draft={draft}
      errors={errors}
      preview={preview}
      persona={props.persona}
      setField={setField}
      onBlurCompute={onBlurCompute}
      onSave={(saved) => props.onSaved(saved)}
      onClose={props.onClose}
    />
  );
}

function useIsMobile(breakpoint = 640): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [breakpoint]);
  return isMobile;
}

function AnimatedNumber({ value, format }: { value: number; format: "currency" | "percent" | "number" }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prevRef = useRef(value);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    prevRef.current = to;
    if (from === to || !ref.current) return;

    const duration = 300;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;

      if (ref.current) {
        if (format === "currency") ref.current.textContent = formatCurrency(current);
        else if (format === "percent") ref.current.textContent = formatPct(current);
        else ref.current.textContent = current.toLocaleString(undefined, { maximumFractionDigits: 1 });
      }

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, format]);

  let display: string;
  if (format === "currency") display = formatCurrency(value);
  else if (format === "percent") display = formatPct(value);
  else display = value.toLocaleString(undefined, { maximumFractionDigits: 1 });

  return <span ref={ref}>{display}</span>;
}

const PERSONA_VALUE_LINE: Record<CalculatorPersona, string> = {
  homeowner: "Model how a homeowner could unlock value today while sharing future appreciation.",
  buyer: "Model how a buyer could participate in future appreciation through a structured agreement.",
  realtor: "Explore structured scenarios to help clients evaluate flexible paths to homeownership.",
  investor: "Model how an investor could participate in future appreciation through a structured agreement.",
  ops: "Model how a structured agreement works across different scenarios.",
};

const TAB_LABELS: Record<CalculatorPersona, string> = {
  homeowner: "Homeowner",
  buyer: "Buyer",
  realtor: "Realtor",
  investor: "Investor",
  ops: "Ops",
};

export { MARKETING_PERSONAS };

function isDevMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return (
      import.meta.env.VITE_DEV_HARNESS === "true" ||
      new URLSearchParams(window.location.search).get("DEV_HARNESS") ===
        "true" ||
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
    if (param === "editor" || param === "viewer" || param === "loggedOut")
      return param;
    const envVal = import.meta.env.VITE_DEV_AUTH;
    if (envVal === "editor" || envVal === "viewer" || envVal === "loggedOut")
      return envVal;
  } catch {
    /* ignore */
  }
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

function formatHorizonLabel(years: number): string {
  if (years === 1) return "1 Year";
  return `${years} Years`;
}

const WIDGET_CSS = `
  @keyframes fp-fadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fp-tabSwitch {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  [data-fractpath-widget] * {
    box-sizing: border-box;
  }
  [data-fractpath-widget] input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: #e5e7eb;
    outline: none;
    cursor: pointer;
  }
  [data-fractpath-widget] input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #111827;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
  [data-fractpath-widget] input[type="range"]::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #111827;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }
  [data-fractpath-widget] button:focus-visible {
    outline: 2px solid #111827;
    outline-offset: 2px;
  }
  [data-fractpath-widget] input:focus-visible,
  [data-fractpath-widget] select:focus-visible {
    outline: 2px solid #111827;
    outline-offset: 1px;
    border-color: #111827;
  }
`;

export function WiredCalculatorWidget(props: FractPathCalculatorWidgetProps) {
  const {
    persona: propPersona,
    mode = "marketing",
    canEdit: canEditProp,
    onEvent,
    onDraftSnapshot,
    onShareSummary,
    onSave,
  } = props;

  const isApp = mode === "app";
  const isMarketing = mode === "marketing";

  const [activePersona, setActivePersona] = useState<CalculatorPersona>(propPersona);

  useEffect(() => {
    setActivePersona(propPersona);
  }, [propPersona]);

  const persona = isMarketing ? activePersona : propPersona;

  const isMobile = useIsMobile();

  const devAuth = getDevAuth();
  const canEdit =
    devAuth === "editor"
      ? true
      : devAuth === "viewer" || devAuth === "loggedOut"
        ? false
        : (canEditProp ?? false);

  const [showEditModal, setShowEditModal] = useState(false);

  const [propertyValue, setPropertyValue] = useState(600_000);
  const [upfrontPayment, setUpfrontPayment] = useState(100_000);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [numberOfPayments, setNumberOfPayments] = useState(0);
  const [exitYear, setExitYear] = useState(10);
  const [growthRatePct, setGrowthRatePct] = useState(3.0);

  const [realtorMode, setRealtorMode] =
    useState<RealtorRepresentationMode>("NONE");
  const [realtorPct, setRealtorPct] = useState(0);

  useEffect(() => {
    onEvent?.({ type: "calculator_used", persona });
  }, [persona, onEvent]);

  const liteState: MarketingLiteState = useMemo(
    () => ({
      propertyValue,
      upfrontPayment,
      monthlyPayment,
      numberOfPayments,
      exitYear,
      growthRatePct,
      realtorMode,
      realtorPct,
    }),
    [
      propertyValue,
      upfrontPayment,
      monthlyPayment,
      numberOfPayments,
      exitYear,
      growthRatePct,
      realtorMode,
      realtorPct,
    ],
  );

  const dealTerms = useMemo(
    () => buildMarketingDealTerms(liteState),
    [liteState],
  );
  const assumptions = useMemo(
    () => buildMarketingAssumptions(liteState),
    [liteState],
  );

  const initialDraft = useMemo(
    () => ({ deal_terms: dealTerms, scenario: assumptions }),
    [dealTerms, assumptions],
  );

  const canonicalResult = useMemo(
    () => computeDeal(dealTerms, assumptions),
    [dealTerms, assumptions],
  );

  const presentation = useMemo(
    () =>
      resolvePersonaPresentation(
        persona,
        dealTerms,
        assumptions,
        canonicalResult,
      ),
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
  }, [
    persona,
    propertyValue,
    upfrontPayment,
    exitYear,
    growthRatePct,
    canonicalResult,
    settlementMonth,
    onDraftSnapshot,
    onEvent,
  ]);

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
  }, [
    persona,
    propertyValue,
    upfrontPayment,
    exitYear,
    growthRatePct,
    canonicalResult,
    onShareSummary,
    onEvent,
  ]);

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
  }, [
    propertyValue,
    upfrontPayment,
    monthlyPayment,
    numberOfPayments,
    exitYear,
    growthRatePct,
    realtorMode,
    realtorPct,
  ]);

  const projectedAppreciation = propertyValue * Math.pow(1 + growthRatePct / 100, exitYear);

  const inputLabelStyle: React.CSSProperties = {
    display: "block",
    fontSize: isMobile ? 14 : 13,
    color: "#374151",
    marginBottom: 6,
    fontWeight: 500,
    letterSpacing: "-0.01em",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: isMobile ? "12px 14px" : "10px 12px",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    fontSize: isMobile ? 16 : 14,
    fontFamily: "system-ui, sans-serif",
    boxSizing: "border-box",
    color: "#111827",
    background: "#fafafa",
    transition: "border-color 0.15s, box-shadow 0.15s",
  };

  const inputGroupStyle: React.CSSProperties = {
    marginBottom: isMobile ? 20 : 16,
  };

  const chipStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "5px 12px",
    background: "#f9fafb",
    borderRadius: 20,
    fontSize: 12,
    color: "#374151",
    border: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
  };

  const chipLabelStyle: React.CSSProperties = {
    color: "#9ca3af",
    fontWeight: 400,
  };

  const chipValueStyle: React.CSSProperties = {
    fontWeight: 600,
    color: "#111827",
  };

  const kpiCards = [
    {
      label: "Home Value Today",
      value: propertyValue,
      format: "currency" as const,
    },
    {
      label: "Cash Unlocked Today",
      value: upfrontPayment,
      format: "currency" as const,
    },
    {
      label: numberOfPayments > 0
        ? `Monthly Contribution / ${numberOfPayments} Month${numberOfPayments === 1 ? "" : "s"}`
        : "Monthly Contribution",
      value: monthlyPayment,
      format: "currency" as const,
    },
    {
      label: `Projected Value in ${formatHorizonLabel(exitYear)}`,
      value: projectedAppreciation,
      format: "currency" as const,
    },
  ];

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        maxWidth: 960,
      }}
      data-fractpath-widget
      data-persona={persona}
      data-mode={mode}
    >
      <style>{WIDGET_CSS}</style>

      {isApp && (
        <div style={{ marginBottom: 20 }}>
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
                marginTop: 10,
                padding: "8px 18px",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                background: "#fff",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "system-ui, sans-serif",
                color: "#374151",
                transition: "background 0.15s",
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
          gridTemplateColumns: isApp || isMobile
            ? "1fr"
            : "minmax(240px, 1fr) minmax(340px, 2fr)",
          gap: isMobile ? 16 : 24,
        }}
      >
        {isMarketing && (
          <div>
            <h3
              style={{
                margin: "0 0 16px 0",
                fontSize: 13,
                color: "#9ca3af",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Scenario Inputs
            </h3>

            <div style={inputGroupStyle}>
              <label style={inputLabelStyle}>
                {getLabel(
                  "deal_terms.property_value",
                  persona,
                  "Home Value ($)",
                )}
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
                {getLabel(
                  "deal_terms.upfront_payment",
                  persona,
                  "Upfront Payment ($)",
                )}
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
                {getLabel(
                  "deal_terms.monthly_payment",
                  persona,
                  "Monthly Installment ($)",
                )}
              </label>
              <input
                type="text"
                inputMode="numeric"
                style={inputStyle}
                value={monthlyPayment.toLocaleString()}
                onChange={(e) => {
                  setMonthlyPayment(
                    parseNumber(e.target.value, monthlyPayment),
                  );
                }}
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={inputLabelStyle}>Number of Monthly Payments</label>
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
                {getLabel(
                  "deal_terms.realtor_representation_mode",
                  persona,
                  "Realtor Representation",
                )}
              </label>
              <select
                value={realtorMode}
                onChange={(e) => {
                  setRealtorMode(e.target.value as RealtorRepresentationMode);
                  if (e.target.value === "NONE") setRealtorPct(0);
                }}
                style={{
                  ...inputStyle,
                  cursor: "pointer",
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
                  {getLabel(
                    "deal_terms.realtor_commission_pct",
                    persona,
                    "Commission (%)",
                  )}
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
              <details style={{ marginTop: 8 }}>
                <summary
                  style={{
                    fontSize: 13,
                    color: "#9ca3af",
                    cursor: "pointer",
                    fontWeight: 500,
                    userSelect: "none",
                  }}
                >
                  Fee details
                </summary>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}
                >
                  <div
                    style={{
                      padding: "8px 12px",
                      background: "#f9fafb",
                      borderRadius: 8,
                      fontSize: 13,
                      color: "#6b7280",
                      border: "1px solid #f3f4f6",
                    }}
                  >
                    Platform fee: {formatCurrency(FEE_DEFAULTS.platform_fee)}
                  </div>
                  <div
                    style={{
                      padding: "8px 12px",
                      background: "#f9fafb",
                      borderRadius: 8,
                      fontSize: 13,
                      color: "#6b7280",
                      border: "1px solid #f3f4f6",
                    }}
                  >
                    Monthly servicing:{" "}
                    {formatCurrency(FEE_DEFAULTS.servicing_fee_monthly)}
                  </div>
                  <div
                    style={{
                      padding: "8px 12px",
                      background: "#f9fafb",
                      borderRadius: 8,
                      fontSize: 13,
                      color: "#6b7280",
                      border: "1px solid #f3f4f6",
                    }}
                  >
                    Exit fee: {formatPct(FEE_DEFAULTS.exit_fee_pct)}
                  </div>
                </div>
              </details>
            )}
          </div>
        )}

        <div>
          {isMarketing && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr 1fr" : "1fr 1fr 1fr 1fr",
                gap: isMobile ? 10 : 12,
                marginBottom: 20,
              }}
              data-testid="summary-cards"
            >
              {kpiCards.map((card) => (
                <div
                  key={card.label}
                  style={{
                    padding: isMobile ? "14px 10px" : "16px",
                    background: "#f9fafb",
                    borderRadius: 12,
                    border: "1px solid #f3f4f6",
                    textAlign: "center",
                    animation: "fp-fadeIn 0.3s ease-out",
                  }}
                >
                  <div style={{
                    fontSize: isMobile ? 20 : 24,
                    fontWeight: 700,
                    color: "#111827",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.2,
                    marginBottom: 4,
                  }}>
                    <AnimatedNumber value={card.value} format={card.format} />
                  </div>
                  <div style={{
                    fontSize: isMobile ? 10 : 11,
                    color: "#9ca3af",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                    lineHeight: 1.3,
                  }}>
                    {card.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div
            style={{
              padding: isMobile ? "14px" : "16px 20px",
              background: "#f9fafb",
              borderRadius: 12,
              border: "1px solid #f3f4f6",
              marginBottom: 16,
              textAlign: "center",
            }}
            data-testid="hero-metric"
          >
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4, fontWeight: 500 }}>
              {presentation.hero.label}
            </div>
            <div style={{
              fontSize: isMobile ? 28 : 34,
              fontWeight: 700,
              color: "#111827",
              letterSpacing: "-0.02em",
            }}>
              {formatChipValue(
                presentation.hero.value,
                presentation.hero.valueFormat,
              )}
            </div>
            {presentation.hero.subtitle && (
              <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 6, lineHeight: 1.4 }}>
                {presentation.hero.subtitle}
              </div>
            )}
          </div>

          {isMarketing && (
            <div style={{ marginBottom: 20, padding: isMobile ? "4px 0" : "8px 0" }}>
              <SimpleBarChart
                bars={presentation.chartSpec.bars}
                width={480}
                height={isMobile ? 180 : 220}
              />
            </div>
          )}

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
                <span style={chipValueStyle}>
                  {formatChipValue(chip.value, chip.valueFormat)}
                </span>
              </span>
            ))}
          </div>

          {isMarketing && (
            <div
              style={{
                padding: "10px 14px",
                background: "#f9fafb",
                borderRadius: 10,
                border: "1px solid #f3f4f6",
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: 12, color: "#9ca3af" }}>
                <strong style={{ color: "#374151" }}>Standard</strong> · {formatMonth(settlementMonth)} · Net
                Payout: {formatCurrency(canonicalResult.isa_settlement)}
              </div>
            </div>
          )}

          {!isMarketing && appOutputs && (
            <>
              <h3
                style={{ margin: "0 0 10px 0", fontSize: 15, color: "#374151", fontWeight: 600 }}
              >
                Settlement Scenarios
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  marginBottom: 20,
                }}
              >
                {(
                  [
                    { label: "Early", data: appOutputs.settlements.early },
                    {
                      label: "Standard",
                      data: appOutputs.settlements.standard,
                    },
                    { label: "Late", data: appOutputs.settlements.late },
                  ] as const
                ).map((s) => (
                  <div
                    key={s.label}
                    style={{
                      padding: "12px 14px",
                      background: "#f9fafb",
                      borderRadius: 10,
                      border: "1px solid #f3f4f6",
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr 1fr 1fr" : "1fr 1fr 1fr 1fr 1fr 1fr",
                      gap: 8,
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>
                        Timing
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>
                        {s.label}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>When</div>
                      <div style={{ fontSize: 13, color: "#111827" }}>
                        {formatMonth(s.data.settlementMonth)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>
                        Net Payout
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>
                        {formatCurrency(s.data.netPayout)}
                      </div>
                    </div>
                    {!isMobile && (
                      <>
                        <div>
                          <div style={{ fontSize: 11, color: "#9ca3af" }}>
                            Raw Payout
                          </div>
                          <div style={{ fontSize: 13, color: "#111827" }}>
                            {formatCurrency(s.data.rawPayout)}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: "#9ca3af" }}>
                            Transfer Fee
                          </div>
                          <div style={{ fontSize: 13, color: "#111827" }}>
                            {formatCurrency(s.data.transferFeeAmount)} (
                            {formatPct(s.data.transferFeeRate)})
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: "#9ca3af" }}>
                            Clamp
                          </div>
                          <div style={{ fontSize: 13, color: "#111827" }}>
                            {s.data.clamp.applied === "none"
                              ? "\u2014"
                              : s.data.clamp.applied === "floor"
                                ? "Floor"
                                : "Cap"}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {!isMarketing && chart && (
            <div style={{ marginBottom: 20 }}>
              <EquityChart series={chart} width={520} height={isMobile ? 200 : 260} />
            </div>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: 10,
              marginTop: 20,
            }}
          >
            {isMarketing && (
              <>
                <button
                  type="button"
                  onClick={handleMarketingSave}
                  style={{
                    padding: isMobile ? "14px 20px" : "12px 24px",
                    borderRadius: 10,
                    border: "none",
                    fontSize: isMobile ? 16 : 15,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "system-ui, sans-serif",
                    background: "#111827",
                    color: "#fff",
                    width: isMobile ? "100%" : "auto",
                    transition: "opacity 0.15s",
                  }}
                  data-cta="save-continue"
                >
                  Save and Continue
                </button>
                <button
                  type="button"
                  onClick={handleMarketingShare}
                  style={{
                    padding: isMobile ? "14px 20px" : "12px 24px",
                    borderRadius: 10,
                    border: "1px solid #e5e7eb",
                    fontSize: isMobile ? 16 : 15,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "system-ui, sans-serif",
                    background: "#fff",
                    color: "#111827",
                    width: isMobile ? "100%" : "auto",
                    transition: "opacity 0.15s",
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
                  padding: isMobile ? "14px 20px" : "12px 24px",
                  borderRadius: 10,
                  border: "none",
                  fontSize: isMobile ? 16 : 15,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "system-ui, sans-serif",
                  background: "#111827",
                  color: "#fff",
                  width: isMobile ? "100%" : "auto",
                }}
                data-cta="save"
              >
                Save
              </button>
            )}
          </div>

          {isMarketing && (
            <p style={{
              margin: "12px 0 0 0",
              fontSize: 13,
              color: "#9ca3af",
              lineHeight: 1.4,
              textAlign: isMobile ? "center" : "left",
            }}>
              Create a free account to save your scenario and continue in FractPath.
            </p>
          )}
        </div>
      </div>


      {showEditModal && canEdit && (
        <DealEditModalMount
          initial={initialDraft}
          persona={persona}
          onClose={() => setShowEditModal(false)}
          onSaved={(saved) => {
            setPropertyValue(saved.deal_terms.property_value);
            setUpfrontPayment(saved.deal_terms.upfront_payment);
            setMonthlyPayment(saved.deal_terms.monthly_payment);
            setNumberOfPayments(saved.deal_terms.number_of_payments);

            setExitYear(saved.scenario.exit_year);
            setGrowthRatePct(saved.scenario.annual_appreciation * 100);

            setRealtorMode(saved.deal_terms.realtor_representation_mode);
            setRealtorPct(saved.deal_terms.realtor_commission_pct * 100);

            setShowEditModal(false);
          }}
        />
      )}

      <div
        style={{
          marginTop: 16,
          color: "#d1d5db",
          fontSize: 11,
          textAlign: "center",
        }}
      >
        Viewing as <strong>{persona}</strong>
        {" \u00b7 "}
        Mode: <strong>{mode}</strong>
        {devAuth && (
          <>
            {" "}
            {"\u00b7"} DEV_AUTH: <strong>{devAuth}</strong>
          </>
        )}
        {" \u00b7 "}
        {formatCurrency(propertyValue)} home {"\u00b7"} {formatCurrency(upfrontPayment)}{" "}
        upfront {"\u00b7"} {formatCurrency(monthlyPayment)}\u00d7{numberOfPayments}mo {"\u00b7"}{" "}
        {exitYear}yr {"\u00b7"} {formatPct(growthRatePct / 100)} growth
      </div>
    </div>
  );
}
