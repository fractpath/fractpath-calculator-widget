import { StrictMode, useState, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { FractPathCalculatorWidget } from "./widget/FractPathCalculatorWidget.js";
import { MARKETING_PERSONAS } from "./widget/wired.js";
import type { CalculatorPersona, CalculatorMode, DevAuthRole } from "./widget/types.js";
import "./index.css";

const showHarness =
  import.meta.env.VITE_DEV_HARNESS === "true" ||
  new URLSearchParams(window.location.search).get("DEV_HARNESS") === "true";

const ALL_PERSONAS: CalculatorPersona[] = ["buyer", "homeowner", "investor", "realtor", "ops"];
const DEV_AUTH_ROLES: DevAuthRole[] = ["loggedOut", "viewer", "editor"];

const LazyEditModalHarness = lazy(() => import("./widget/dev/EditModalHarness.js").then(m => ({ default: m.EditModalHarness })));
const LazySnapshotViewHarness = lazy(() => import("./widget/dev/SnapshotViewHarness.js").then(m => ({ default: m.SnapshotViewHarness })));
const LazyDraftStateHarness = lazy(() => import("./widget/dev/DraftStateHarness.js").then(m => ({ default: m.DraftStateHarness })));
const LazyFieldMetaHarness = lazy(() => import("./widget/dev/FieldMetaHarness.js").then(m => ({ default: m.FieldMetaHarness })));

function DevHarness() {
  const [persona, setPersona] = useState<CalculatorPersona>("buyer");
  const [mode, setMode] = useState<CalculatorMode>("marketing");
  const [devAuth, setDevAuth] = useState<DevAuthRole>("loggedOut");

  const personaList = (mode === "marketing" && !showHarness)
    ? MARKETING_PERSONAS
    : ALL_PERSONAS;

  const canEdit = devAuth === "editor";

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <div style={{ marginBottom: 16, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, color: "#6b7280" }}>Persona:</span>
        {personaList.map((p) => (
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
        {(["marketing", "app"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              border: mode === m ? "2px solid #111827" : "1px solid #d1d5db",
              background: mode === m ? "#111827" : "#fff",
              color: mode === m ? "#fff" : "#374151",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {m}
          </button>
        ))}
        <span style={{ marginLeft: 12, fontSize: 13, color: "#6b7280" }}>Auth:</span>
        {DEV_AUTH_ROLES.map((role) => (
          <button
            key={role}
            onClick={() => setDevAuth(role)}
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              border: devAuth === role ? "2px solid #059669" : "1px solid #d1d5db",
              background: devAuth === role ? "#059669" : "#fff",
              color: devAuth === role ? "#fff" : "#374151",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {role}
          </button>
        ))}
      </div>
      <FractPathCalculatorWidget
        persona={persona}
        mode={mode}
        canEdit={canEdit}
        onDraftSnapshot={(snapshot) => console.log("[onDraftSnapshot]", snapshot)}
        onShareSummary={(summary) => console.log("[onShareSummary]", summary)}
        onSave={(payload) => console.log("[onSave]", payload)}
        onEvent={(e) => console.log("[WidgetEvent]", e)}
      />
      {showHarness && (
        <Suspense fallback={<div style={{ padding: 12, color: "#9ca3af" }}>Loading harness...</div>}>
          <LazyEditModalHarness />
          <LazySnapshotViewHarness />
          <LazyDraftStateHarness />
          <LazyFieldMetaHarness />
        </Suspense>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DevHarness />
  </StrictMode>
);
