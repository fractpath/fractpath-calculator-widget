import { useState, useCallback, useMemo } from "react";
import type { DraftCanonicalInputs, FieldErrors, PreviewState } from "../editing/types.js";
import type { FieldMeta, FieldKey, Anchor } from "../editing/fieldMeta.js";
import { FIELD_META, computeDynamicAnchors } from "../editing/fieldMeta.js";
import { TAB_CONFIG, type TabKey } from "../editing/tabConfig.js";
import { hasErrors } from "../editing/validateDraft.js";
import type { CalculatorPersona } from "../types.js";
import { getLabel } from "../persona.js";
import { KioskSelect } from "./KioskSelect.js";
import { PreviewPanel } from "./PreviewPanel.js";
import { HelpTooltip } from "./HelpTooltip.js";

type DraftPath =
  | `deal_terms.${string & keyof DraftCanonicalInputs["deal_terms"]}`
  | `scenario.${string & keyof DraftCanonicalInputs["scenario"]}`;

type DealEditModalProps = {
  draft: DraftCanonicalInputs;
  errors: FieldErrors;
  preview: PreviewState;
  persona: CalculatorPersona;
  permissions?: { canEdit?: boolean };
  setField: (path: DraftPath, value: unknown) => void;
  onBlurCompute: () => void;
  onSave: (draft: DraftCanonicalInputs) => void;
  onClose: () => void;
};

function getFieldValue(draft: DraftCanonicalInputs, key: FieldKey): unknown {
  if (key === "__disclosure__") return null;
  const [section, field] = key.split(".") as ["deal_terms" | "scenario", string];
  return (draft[section] as unknown as Record<string, unknown>)[field];
}

function resolveAnchors(meta: FieldMeta, draft: DraftCanonicalInputs): Anchor[] {
  if (meta.dynamicPercentAnchors) {
    return computeDynamicAnchors(meta, draft.deal_terms.property_value);
  }
  return meta.anchors ?? [];
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  paddingTop: "5vh",
  zIndex: 9999,
  fontFamily: "system-ui, sans-serif",
};

const modalStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 12,
  width: "min(680px, 95vw)",
  height: "min(85vh, 720px)",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
};

const tabBarStyle: React.CSSProperties = {
  display: "flex",
  gap: 0,
  borderBottom: "1px solid #e5e7eb",
  padding: "0 16px",
  overflowX: "auto",
};

export function DealEditModal({
  draft,
  errors,
  preview,
  persona,
  permissions,
  setField,
  onBlurCompute,
  onSave,
  onClose,
}: DealEditModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("payments");
  const [customValues, setCustomValues] = useState<Record<string, string>>({});

  const metaMap = useMemo(() => {
    const m = new Map<FieldKey, FieldMeta>();
    for (const fm of FIELD_META) m.set(fm.key, fm);
    return m;
  }, []);

  const canSave =
    !hasErrors(errors) &&
    persona !== "realtor" &&
    (permissions?.canEdit !== false);

  const handleAnchorSelect = useCallback(
    (key: FieldKey, value: number) => {
      setField(key as DraftPath, value);
      setCustomValues((cv) => ({ ...cv, [key]: "" }));

      if (key === "deal_terms.realtor_representation_mode") return;

      if (key === ("deal_terms.realtor_commission_pct" as FieldKey)) {
        onBlurCompute();
        return;
      }

      onBlurCompute();
    },
    [setField, onBlurCompute],
  );

  const handleEnumChange = useCallback(
    (key: FieldKey, value: string) => {
      if (key === "deal_terms.duration_yield_floor_enabled") {
        setField(key as DraftPath, value === "true");
        onBlurCompute();
        return;
      }

      setField(key as DraftPath, value);

      if (key === "deal_terms.realtor_representation_mode") {
        if (value === "NONE") {
          setField("deal_terms.realtor_commission_pct" as DraftPath, 0);
        }
        onBlurCompute();
        return;
      }

      onBlurCompute();
    },
    [setField, onBlurCompute],
  );

  const handleCustomChange = useCallback(
    (key: FieldKey, raw: string) => {
      setCustomValues((cv) => ({ ...cv, [key]: raw }));
    },
    [],
  );

  const handleCustomBlur = useCallback(
    (key: FieldKey, meta: FieldMeta) => {
      const raw = customValues[key];
      if (raw === undefined || raw === "") return;

      let parsed: number;
      if (meta.unit === "percent") {
        parsed = parseFloat(raw) / 100;
      } else {
        parsed = parseFloat(raw.replace(/,/g, ""));
      }

      if (!Number.isFinite(parsed)) return;

      if (meta.hardRange) {
        parsed = Math.max(meta.hardRange.min, Math.min(meta.hardRange.max, parsed));
      }

      setField(key as DraftPath, parsed);
      onBlurCompute();
    },
    [customValues, setField, onBlurCompute],
  );

  const handleSave = useCallback(() => {
    if (!canSave) return;
    onSave(draft);
    onClose();
  }, [canSave, draft, onSave, onClose]);

  const isRealtorDisabled = (key: FieldKey): boolean => {
    if (key === "deal_terms.realtor_commission_pct") {
      return draft.deal_terms.realtor_representation_mode === "NONE";
    }
    if (key === "deal_terms.realtor_commission_payment_mode") {
      return true;
    }
    return false;
  };

  const formatDisplayValue = (val: unknown, meta: FieldMeta): string => {
    if (val === null || val === undefined) return "—";
    if (meta.unit === "percent") return `${((val as number) * 100).toFixed(2)}%`;
    if (meta.unit === "currency") return `$${(val as number).toLocaleString("en-US")}`;
    if (meta.unit === "years") return `${val} yr`;
    if (meta.unit === "months") return `${val} mo`;
    if (typeof val === "boolean") return val ? "Yes" : "No";
    return String(val);
  };

  const renderField = (meta: FieldMeta) => {
    const key = meta.key;
    const value = getFieldValue(draft, key);
    const error = errors[key];
    const disabled = meta.readOnly || isRealtorDisabled(key);
    const fieldLabel = getLabel(key, persona, meta.label);

    if (meta.control === "info") {
      return (
        <div
          key={key}
          style={{
            padding: "10px 12px",
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: 8,
            fontSize: 12,
            lineHeight: 1.6,
            color: "#92400e",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{meta.simpleDefinition}</div>
          <div>{meta.impact}</div>
        </div>
      );
    }

    if (meta.control === "enum") {
      const options = meta.options ?? [];
      const currentValue =
        key === "deal_terms.duration_yield_floor_enabled"
          ? String(value)
          : (value as string);

      return (
        <div key={key} style={{ marginBottom: 14 }}>
          <label style={labelStyle}>
            {fieldLabel}
            <HelpTooltip simpleDefinition={meta.simpleDefinition} impact={meta.impact} />
          </label>
          <select
            value={currentValue}
            disabled={disabled}
            onChange={(e) => handleEnumChange(key, e.target.value)}
            style={{
              ...selectStyle,
              background: disabled ? "#f3f4f6" : "#fff",
              color: disabled ? "#9ca3af" : "#111827",
            }}
          >
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {error && <div style={errorStyle}>{error}</div>}
        </div>
      );
    }

    if (meta.control === "readonly") {
      return (
        <div key={key} style={{ marginBottom: 14 }}>
          <label style={labelStyle}>
            {fieldLabel}
            <HelpTooltip simpleDefinition={meta.simpleDefinition} impact={meta.impact} />
          </label>
          <div style={readonlyStyle}>{formatDisplayValue(value, meta)}</div>
        </div>
      );
    }

    if (meta.control === "slider" && meta.slider) {
      return (
        <div key={key} style={{ marginBottom: 14 }}>
          <label style={labelStyle}>
            {fieldLabel}
            <HelpTooltip simpleDefinition={meta.simpleDefinition} impact={meta.impact} />
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="range"
              min={meta.slider.min}
              max={meta.slider.max}
              step={meta.slider.step}
              value={value as number}
              disabled={disabled}
              onChange={(e) => setField(key as DraftPath, parseFloat(e.target.value))}
              onMouseUp={onBlurCompute}
              onTouchEnd={onBlurCompute}
              style={{ flex: 1 }}
            />
            <span style={{ fontSize: 13, fontWeight: 600, minWidth: 80, textAlign: "right" }}>
              {formatDisplayValue(value, meta)}
            </span>
          </div>
          {error && <div style={errorStyle}>{error}</div>}
        </div>
      );
    }

    if (meta.control === "kiosk") {
      const anchors = resolveAnchors(meta, draft);
      const fourAnchors: [Anchor, Anchor, Anchor, Anchor] =
        anchors.length >= 4
          ? [anchors[0], anchors[1], anchors[2], anchors[3]]
          : [
              anchors[0] ?? { label: "—", value: 0 },
              anchors[1] ?? { label: "—", value: 0 },
              anchors[2] ?? { label: "—", value: 0 },
              anchors[3] ?? { label: "—", value: 0 },
            ];

      let displayCustomValue = customValues[key] ?? "";
      if (!displayCustomValue && !fourAnchors.some((a) => a.value === value)) {
        if (meta.unit === "percent") {
          displayCustomValue = ((value as number) * 100).toString();
        } else {
          displayCustomValue = String(value);
        }
      }

      return (
        <div key={key} style={{ marginBottom: 14 }}>
          <label style={labelStyle}>
            {fieldLabel}
            <HelpTooltip simpleDefinition={meta.simpleDefinition} impact={meta.impact} />
          </label>
          <KioskSelect
            value={value as number}
            anchors={fourAnchors}
            unit={meta.unit as "currency" | "percent" | "number" | "months" | "years"}
            onSelectAnchor={(v) => handleAnchorSelect(key, v)}
            customValue={displayCustomValue}
            onChangeCustom={(v) => handleCustomChange(key, v)}
            onBlurCustom={() => handleCustomBlur(key, meta)}
            disabled={disabled}
            error={error}
          />
        </div>
      );
    }

    return null;
  };

  const currentTab = TAB_CONFIG.find((t) => t.key === activeTab)!;

  return (
    <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={modalStyle} role="dialog" aria-modal="true" data-testid="deal-edit-modal">
        <div style={{ padding: "16px 20px 0", borderBottom: "none" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0, fontSize: 18, color: "#111827" }}>Edit Deal Terms</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                background: "none",
                border: "none",
                fontSize: 20,
                cursor: "pointer",
                color: "#6b7280",
                padding: "4px 8px",
              }}
            >
              ×
            </button>
          </div>
        </div>

        <div style={tabBarStyle}>
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "10px 16px",
                border: "none",
                borderBottom: activeTab === tab.key ? "2px solid #111827" : "2px solid transparent",
                background: "none",
                fontSize: 13,
                fontWeight: activeTab === tab.key ? 600 : 400,
                color: activeTab === tab.key ? "#111827" : "#6b7280",
                cursor: "pointer",
                fontFamily: "system-ui, sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "16px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 20 }}>
            <div>
              {currentTab.sections.map((section) => (
                <div key={section.label} style={{ marginBottom: 20 }}>
                  <h4
                    style={{
                      margin: "0 0 10px 0",
                      fontSize: 12,
                      color: "#9ca3af",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    {section.label}
                  </h4>
                  {section.fieldKeys.map((fk) => {
                    const meta = metaMap.get(fk);
                    if (!meta) return null;
                    return renderField(meta);
                  })}
                </div>
              ))}
            </div>

            <div>
              <PreviewPanel
                tier1={preview.tier1}
                status={preview.status}
                error={preview.error}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "8px 20px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              background: "#fff",
              color: "#374151",
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            style={{
              padding: "8px 24px",
              borderRadius: 8,
              border: "none",
              background: canSave ? "#111827" : "#d1d5db",
              color: canSave ? "#fff" : "#9ca3af",
              fontSize: 13,
              fontWeight: 600,
              cursor: canSave ? "pointer" : "not-allowed",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  color: "#374151",
  marginBottom: 5,
  fontWeight: 500,
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "7px 10px",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  fontSize: 13,
  fontFamily: "system-ui, sans-serif",
  boxSizing: "border-box" as const,
};

const readonlyStyle: React.CSSProperties = {
  padding: "7px 10px",
  background: "#f3f4f6",
  border: "1px solid #e5e7eb",
  borderRadius: 6,
  fontSize: 13,
  color: "#6b7280",
};

const errorStyle: React.CSSProperties = {
  color: "#ef4444",
  fontSize: 11,
  marginTop: 3,
};
