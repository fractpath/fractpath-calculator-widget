import { useCallback, useEffect, useRef, useState } from "react";
import type {
  CalculatorPersona,
  FractPathCalculatorWidgetProps,
} from "./types.js";
import type { ScenarioOutputs } from "../calc/types.js";

import { computeScenario } from "../calc/calc.js";
import { buildChartSeriesV1 } from "../calc/chart.js";
import { DEFAULT_INPUTS } from "../calc/constants.js";
import { EquityChart } from "../components/EquityChart.js";
import { formatCurrency, formatPct, formatMonth } from "./format.js";
import { getPersonaConfig } from "./persona.js";
import {
  buildLiteShareSummaryV1,
  buildFullDealSnapshotV1,
} from "../contracts/builders.js";
import {
  buildDraftSnapshot,
  buildShareSummary,
  buildSavePayload,
} from "./snapshot.js";

const FONT = "system-ui, sans-serif";

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  color: "#6b7280",
  marginBottom: 4,
  fontWeight: 500,
};

const fieldStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  fontSize: 14,
  fontFamily: FONT,
  boxSizing: "border-box",
};

const fieldGroupStyle: React.CSSProperties = {
  marginBottom: 14,
};

const cardStyle: React.CSSProperties = {
  padding: 12,
  background: "#f9fafb",
  borderRadius: 8,
  border: "1px solid #e5e7eb",
};

const btnBase: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: 8,
  border: "none",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: FONT,
};

const btnPrimary: React.CSSProperties = {
  ...btnBase,
  background: "#111827",
  color: "#fff",
};

const btnSecondary: React.CSSProperties = {
  ...btnBase,
  background: "#fff",
  color: "#111827",
  border: "1px solid #d1d5db",
};

function parseNum(raw: string, fallback: number): number {
  const n = Number(raw.replace(/,/g, ""));
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

type InputDraft = {
  homeValue: number;
  initialBuyAmount: number;
  termYears: number;
  growthRatePct: number;
  floorMultiple: number;
  capMultiple: number;
  tfStandard: number;
  tfEarly: number;
  tfLate: number;
  upfrontEquityPct: number;
  monthlyEquityPct: number;
  mortgageBalance: number;
};

function defaultDraft(): InputDraft {
  return {
    homeValue: DEFAULT_INPUTS.homeValue,
    initialBuyAmount: DEFAULT_INPUTS.initialBuyAmount,
    termYears: DEFAULT_INPUTS.termYears,
    growthRatePct: DEFAULT_INPUTS.annualGrowthRate * 100,
    floorMultiple: DEFAULT_INPUTS.floorMultiple,
    capMultiple: DEFAULT_INPUTS.capMultiple,
    tfStandard: DEFAULT_INPUTS.transferFeeRate_standard * 100,
    tfEarly: DEFAULT_INPUTS.transferFeeRate_early * 100,
    tfLate: DEFAULT_INPUTS.transferFeeRate_late * 100,
    upfrontEquityPct: DEFAULT_INPUTS.vesting.upfrontEquityPct * 100,
    monthlyEquityPct: DEFAULT_INPUTS.vesting.monthlyEquityPct * 100,
    mortgageBalance: DEFAULT_INPUTS.mortgageBalance,
  };
}

function InputModal({
  draft,
  setDraft,
  isMarketing,
  onApply,
  onClose,
}: {
  draft: InputDraft;
  setDraft: (d: InputDraft) => void;
  isMarketing: boolean;
  onApply: () => void;
  onClose: () => void;
}) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [assumptionsOpen, setAssumptionsOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    const el = modalRef.current;
    if (!el) return;

    const focusable = el.querySelectorAll<HTMLElement>(
      'input, button, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length) focusable[0].focus();

    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", trap);
    return () => document.removeEventListener("keydown", trap);
  }, []);

  const update = (key: keyof InputDraft, value: number) =>
    setDraft({ ...draft, [key]: value });

  const readOnlyNote = isMarketing ? (
    <div
      style={{
        fontSize: 11,
        color: "#9ca3af",
        fontStyle: "italic",
        marginTop: 4,
      }}
    >
      Editable after signup
    </div>
  ) : null;

  return (
    <div
      ref={backdropRef}
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      data-testid="input-modal-backdrop"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-label="Calculator Inputs"
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 24,
          width: "100%",
          maxWidth: 480,
          maxHeight: "85vh",
          overflowY: "auto",
          fontFamily: FONT,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 18, color: "#111827" }}>
            Scenario Inputs
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 20,
              cursor: "pointer",
              color: "#6b7280",
              padding: 4,
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Home Value ($)</label>
          <input
            type="text"
            inputMode="numeric"
            style={fieldStyle}
            value={draft.homeValue.toLocaleString()}
            onChange={(e) =>
              update("homeValue", parseNum(e.target.value, draft.homeValue))
            }
          />
        </div>

        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Initial Buy Amount ($)</label>
          <input
            type="text"
            inputMode="numeric"
            style={fieldStyle}
            value={draft.initialBuyAmount.toLocaleString()}
            onChange={(e) =>
              update(
                "initialBuyAmount",
                parseNum(e.target.value, draft.initialBuyAmount),
              )
            }
          />
        </div>

        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Term (years)</label>
          <input
            type="number"
            min={1}
            max={30}
            step={1}
            style={fieldStyle}
            value={draft.termYears}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (Number.isFinite(v) && v >= 1 && v <= 30)
                update("termYears", v);
            }}
          />
        </div>

        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Annual Growth Rate (%)</label>
          <input
            type="number"
            min={0}
            max={20}
            step={0.1}
            style={fieldStyle}
            value={draft.growthRatePct}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (Number.isFinite(v) && v >= 0 && v <= 20)
                update("growthRatePct", v);
            }}
          />
        </div>

        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Mortgage Balance ($)</label>
          <input
            type="text"
            inputMode="numeric"
            style={fieldStyle}
            value={draft.mortgageBalance.toLocaleString()}
            onChange={(e) =>
              update(
                "mortgageBalance",
                parseNum(e.target.value, draft.mortgageBalance),
              )
            }
          />
        </div>

        <div style={{ marginTop: 8, marginBottom: 16 }}>
          <button
            type="button"
            onClick={() => setAssumptionsOpen(!assumptionsOpen)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              color: "#6b7280",
              fontFamily: FONT,
              padding: 0,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                fontSize: 10,
                transition: "transform 0.15s",
                transform: assumptionsOpen ? "rotate(90deg)" : "rotate(0deg)",
                display: "inline-block",
              }}
            >
              ▶
            </span>
            Assumptions
          </button>

          {assumptionsOpen && (
            <div
              style={{
                marginTop: 10,
                padding: 12,
                background: "#f9fafb",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
              }}
            >
              {isMarketing && readOnlyNote}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginTop: isMarketing ? 8 : 0,
                }}
              >
                <div>
                  <label style={labelStyle}>Floor Multiple</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    style={{
                      ...fieldStyle,
                      background: isMarketing ? "#f3f4f6" : "#fff",
                    }}
                    value={draft.floorMultiple}
                    readOnly={isMarketing}
                    onChange={(e) => {
                      if (!isMarketing) {
                        const v = parseFloat(e.target.value);
                        if (Number.isFinite(v) && v >= 0)
                          update("floorMultiple", v);
                      }
                    }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Cap Multiple</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    style={{
                      ...fieldStyle,
                      background: isMarketing ? "#f3f4f6" : "#fff",
                    }}
                    value={draft.capMultiple}
                    readOnly={isMarketing}
                    onChange={(e) => {
                      if (!isMarketing) {
                        const v = parseFloat(e.target.value);
                        if (Number.isFinite(v) && v >= 0)
                          update("capMultiple", v);
                      }
                    }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>TF Standard (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    style={{
                      ...fieldStyle,
                      background: isMarketing ? "#f3f4f6" : "#fff",
                    }}
                    value={draft.tfStandard}
                    readOnly={isMarketing}
                    onChange={(e) => {
                      if (!isMarketing) {
                        const v = parseFloat(e.target.value);
                        if (Number.isFinite(v)) update("tfStandard", v);
                      }
                    }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>TF Early (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    style={{
                      ...fieldStyle,
                      background: isMarketing ? "#f3f4f6" : "#fff",
                    }}
                    value={draft.tfEarly}
                    readOnly={isMarketing}
                    onChange={(e) => {
                      if (!isMarketing) {
                        const v = parseFloat(e.target.value);
                        if (Number.isFinite(v)) update("tfEarly", v);
                      }
                    }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>TF Late (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    style={{
                      ...fieldStyle,
                      background: isMarketing ? "#f3f4f6" : "#fff",
                    }}
                    value={draft.tfLate}
                    readOnly={isMarketing}
                    onChange={(e) => {
                      if (!isMarketing) {
                        const v = parseFloat(e.target.value);
                        if (Number.isFinite(v)) update("tfLate", v);
                      }
                    }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Upfront Equity (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    style={{
                      ...fieldStyle,
                      background: isMarketing ? "#f3f4f6" : "#fff",
                    }}
                    value={draft.upfrontEquityPct}
                    readOnly={isMarketing}
                    onChange={(e) => {
                      if (!isMarketing) {
                        const v = parseFloat(e.target.value);
                        if (Number.isFinite(v)) update("upfrontEquityPct", v);
                      }
                    }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Monthly Equity (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.001}
                    style={{
                      ...fieldStyle,
                      background: isMarketing ? "#f3f4f6" : "#fff",
                    }}
                    value={draft.monthlyEquityPct}
                    readOnly={isMarketing}
                    onChange={(e) => {
                      if (!isMarketing) {
                        const v = parseFloat(e.target.value);
                        if (Number.isFinite(v)) update("monthlyEquityPct", v);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onApply}
          style={{
            ...btnPrimary,
            width: "100%",
            padding: "12px 20px",
            fontSize: 15,
          }}
          data-cta="apply"
        >
          Apply
        </button>
      </div>
    </div>
  );
}

function PersonaHeader({
  activePersona,
  onSwitch,
}: {
  activePersona: CalculatorPersona;
  onSwitch: (p: CalculatorPersona) => void;
}) {
  const tabs: { persona: CalculatorPersona; label: string }[] = [
    { persona: "homeowner", label: "Homeowner" },
    { persona: "buyer", label: "Buyer" },
  ];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        marginBottom: 16,
      }}
    >
      {tabs.map((t) => {
        const active = activePersona === t.persona;
        return (
          <button
            key={t.persona}
            type="button"
            onClick={() => onSwitch(t.persona)}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              border: active ? "2px solid #111827" : "1px solid #d1d5db",
              background: active ? "#111827" : "#fff",
              color: active ? "#fff" : "#374151",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: FONT,
            }}
            data-persona-tab={t.persona}
          >
            {t.label}
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => onSwitch("realtor")}
        style={{
          marginLeft: 8,
          padding: "6px 12px",
          borderRadius: 6,
          border:
            activePersona === "realtor"
              ? "2px solid #6b7280"
              : "1px solid #e5e7eb",
          background: activePersona === "realtor" ? "#f3f4f6" : "transparent",
          color: "#6b7280",
          fontSize: 12,
          cursor: "pointer",
          fontFamily: FONT,
        }}
        data-persona-tab="realtor"
      >
        Realtor <span style={{ fontSize: 10, opacity: 0.7 }}>(beta)</span>
      </button>
    </div>
  );
}

function EmptyState({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div
      style={{
        ...cardStyle,
        textAlign: "center",
        padding: "40px 24px",
      }}
      data-testid="empty-state"
    >
      <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>📊</div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: "#374151",
          marginBottom: 8,
        }}
      >
        No results yet
      </div>
      <div style={{ fontSize: 13, color: "#9ca3af", marginBottom: 20 }}>
        Enter your property details to see projected outcomes.
      </div>
      <button
        type="button"
        onClick={onGetStarted}
        style={btnPrimary}
        data-cta="get-started"
      >
        Get Started
      </button>
    </div>
  );
}

/**
 * Marketing-safe outputs:
 * - NO Early/Standard/Late comparison tables (WGT-031 explicitly excludes scenario comparison tables).
 * - NO charts (keep gated; host marketing site can render its own basic visuals later if desired).
 * - Persona-framed hero value only + disclaimers + CTAs.
 */
function MarketingOutputs({
  outputs,
  persona,
  onSaveContinue,
  onShare,
  onEditInputs,
}: {
  outputs: ScenarioOutputs;
  persona: CalculatorPersona;
  onSaveContinue: () => void;
  onShare: () => void;
  onEditInputs: () => void;
}) {
  const personaCfg = getPersonaConfig(persona);
  const heroValue = personaCfg.heroValue(outputs);

  return (
    <div data-testid="marketing-outputs">
      <div style={{ ...cardStyle, marginBottom: 16, textAlign: "center" }}>
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
          {personaCfg.heroLabel}
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: "#111827" }}>
          {formatCurrency(heroValue)}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#9ca3af",
            marginTop: 6,
            lineHeight: 1.35,
          }}
        >
          Illustrative estimate. Not a binding offer.
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#9ca3af",
            marginTop: 6,
            lineHeight: 1.35,
          }}
        >
          Only the portion of equity you own (FMV − mortgage) can be sold.
        </div>
      </div>

      <div
        style={{
          padding: "12px 0",
          marginTop: 12,
          borderTop: "1px solid #e5e7eb",
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "#9ca3af",
            marginBottom: 6,
            fontWeight: 600,
          }}
        >
          Assumptions (read-only in marketing)
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#9ca3af",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 4,
          }}
        >
          <span>
            Growth: {formatPct(outputs.normalizedInputs.annualGrowthRate)}
          </span>
          <span>Floor/Ceiling protections apply</span>
          <span>Timing affects payout, not home value</span>
        </div>
      </div>

      <div
        style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}
      >
        <button
          type="button"
          onClick={onSaveContinue}
          style={btnPrimary}
          data-cta="save-continue"
        >
          Save &amp; Continue
        </button>
        <button
          type="button"
          onClick={onShare}
          style={btnSecondary}
          data-cta="share"
        >
          Share
        </button>
        <button
          type="button"
          onClick={onEditInputs}
          style={btnSecondary}
          data-cta="edit-inputs"
        >
          Edit Inputs
        </button>
      </div>
    </div>
  );
}

function AppOutputs({
  outputs,
  chart,
  onEditInputs,
}: {
  outputs: ScenarioOutputs;
  chart: ReturnType<typeof buildChartSeriesV1>;
  onEditInputs: () => void;
}) {
  const settlements = [
    { label: "Early", data: outputs.settlements.early },
    { label: "Standard", data: outputs.settlements.standard },
    { label: "Late", data: outputs.settlements.late },
  ] as const;

  return (
    <div data-testid="app-outputs">
      <h3 style={{ margin: "0 0 8px 0", fontSize: 14, color: "#374151" }}>
        Settlement Analysis
      </h3>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          marginBottom: 16,
        }}
      >
        {settlements.map((s) => (
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
              <div style={{ fontSize: 11, color: "#9ca3af" }}>Month</div>
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

      <EquityChart series={chart} width={520} height={240} />

      <div
        style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}
      >
        <button
          type="button"
          onClick={onEditInputs}
          style={btnSecondary}
          data-cta="edit-inputs"
        >
          Edit Inputs
        </button>
      </div>
    </div>
  );
}

export function WiredCalculatorWidget(props: FractPathCalculatorWidgetProps) {
  const {
    persona: initialPersona,
    mode = "marketing",
    onEvent,
    onDraftSnapshot,
    onShareSummary,
    onSave,
    onLiteSnapshot,
    onFullSnapshot,
  } = props;

  const [activePersona, setActivePersona] =
    useState<CalculatorPersona>(initialPersona);
  const [modalOpen, setModalOpen] = useState(false);
  const [appliedOutputs, setAppliedOutputs] = useState<ScenarioOutputs | null>(
    null,
  );
  const [draft, setDraft] = useState<InputDraft>(defaultDraft);

  const isMarketing = mode === "marketing";

  useEffect(() => {
    onEvent?.({ type: "calculator_used", persona: activePersona });
  }, [activePersona, onEvent]);

  const handlePersonaSwitch = useCallback(
    (newPersona: CalculatorPersona) => {
      if (newPersona === activePersona) return;
      const prev = activePersona;
      setActivePersona(newPersona);
      setAppliedOutputs(null);
      setDraft(defaultDraft());
      onEvent?.({ type: "persona_switched", persona: newPersona, previousPersona: prev });
      onEvent?.({ type: "inputs_reset", persona: newPersona });
    },
    [activePersona, onEvent],
  );

  const openModal = useCallback(() => {
    setModalOpen(true);
    onEvent?.({ type: "modal_opened", persona: activePersona });
  }, [activePersona, onEvent]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    onEvent?.({ type: "modal_closed", persona: activePersona });
  }, [activePersona, onEvent]);

  const handleApply = useCallback(async () => {
    const outputs = computeScenario({
      homeValue: draft.homeValue,
      initialBuyAmount: draft.initialBuyAmount,
      termYears: draft.termYears,
      annualGrowthRate: draft.growthRatePct / 100,
      floorMultiple: draft.floorMultiple,
      capMultiple: draft.capMultiple,
      transferFeeRate_standard: draft.tfStandard / 100,
      transferFeeRate_early: draft.tfEarly / 100,
      transferFeeRate_late: draft.tfLate / 100,
      vesting: {
        upfrontEquityPct: draft.upfrontEquityPct / 100,
        monthlyEquityPct: draft.monthlyEquityPct / 100,
        months: draft.termYears * 12,
      },
      mortgageBalance: draft.mortgageBalance,
    });

    setAppliedOutputs(outputs);
    setModalOpen(false);
    onEvent?.({ type: "apply_clicked", persona: activePersona });

    if (isMarketing && onLiteSnapshot) {
      const lite = buildLiteShareSummaryV1(activePersona, outputs.normalizedInputs, outputs);
      onLiteSnapshot(lite);
    }

    if (!isMarketing) {
      if (onSave) {
        const payload = await buildSavePayload(activePersona, outputs.normalizedInputs, outputs);
        onSave(payload);
      }
      if (onFullSnapshot) {
        const full = await buildFullDealSnapshotV1(activePersona, outputs.normalizedInputs, outputs);
        onFullSnapshot(full);
      }
      onEvent?.({ type: "save_clicked", persona: activePersona });
    }
  }, [draft, activePersona, isMarketing, onSave, onFullSnapshot, onLiteSnapshot, onEvent]);

  const handleSaveContinue = useCallback(async () => {
    if (!appliedOutputs) return;
    onEvent?.({ type: "save_continue_clicked", persona: activePersona });
    if (onDraftSnapshot) {
      const snapshot = await buildDraftSnapshot(
        activePersona,
        appliedOutputs.normalizedInputs,
        appliedOutputs,
      );
      onDraftSnapshot(snapshot);
    }
    if (onLiteSnapshot) {
      const lite = buildLiteShareSummaryV1(
        activePersona,
        appliedOutputs.normalizedInputs,
        appliedOutputs,
      );
      onLiteSnapshot(lite);
    }
  }, [activePersona, appliedOutputs, onDraftSnapshot, onLiteSnapshot, onEvent]);

  const handleShare = useCallback(() => {
    if (!appliedOutputs) return;
    onEvent?.({ type: "share_clicked", persona: activePersona });
    if (onShareSummary) {
      const summary = buildShareSummary(
        activePersona,
        appliedOutputs.normalizedInputs,
        appliedOutputs,
      );
      onShareSummary(summary);
    }
  }, [activePersona, appliedOutputs, onShareSummary, onEvent]);

  const chart = appliedOutputs ? buildChartSeriesV1(appliedOutputs) : null;

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 20,
        fontFamily: FONT,
        maxWidth: 700,
      }}
      data-fractpath-widget
      data-persona={activePersona}
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
          ? "Illustrative estimate (marketing)"
          : "Full analysis (app)"}
      </div>

      <PersonaHeader
        activePersona={activePersona}
        onSwitch={handlePersonaSwitch}
      />

      {!appliedOutputs && <EmptyState onGetStarted={openModal} />}

      {appliedOutputs && isMarketing && (
        <MarketingOutputs
          outputs={appliedOutputs}
          persona={activePersona}
          onSaveContinue={handleSaveContinue}
          onShare={handleShare}
          onEditInputs={openModal}
        />
      )}

      {appliedOutputs && chart && !isMarketing && (
        <AppOutputs
          outputs={appliedOutputs}
          chart={chart}
          onEditInputs={openModal}
        />
      )}

      {modalOpen && (
        <InputModal
          draft={draft}
          setDraft={setDraft}
          isMarketing={isMarketing}
          onApply={handleApply}
          onClose={closeModal}
        />
      )}

      <div
        style={{
          marginTop: 12,
          color: "#9ca3af",
          fontSize: 11,
          textAlign: "center",
        }}
      >
        Viewing as <strong>{activePersona}</strong>
        {" · "}
        Mode: <strong>{mode}</strong>
      </div>
    </div>
  );
}
