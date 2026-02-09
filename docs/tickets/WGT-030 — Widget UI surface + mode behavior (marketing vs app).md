# WGT-030 — Widget UI surface + mode behavior (marketing vs app)

## Sprint
Sprint 0 (alignment-only rewrite) → Sprint 5 (implementation)

## Objective
Define the widget’s rendered UI surface and behavioral differences by mode:
- `mode="marketing"`
- `mode="app"`

This ticket specifies **what UI elements exist, where they appear, and what events they emit**.
It does NOT define gating rules (WGT-031), share semantics (WGT-020), or data contracts (WGT-INT-001).

## Context (Locked Decisions)
- Widget is the canonical owner of calculator math and persona logic.
- Marketing embeds the widget via tight package import; no calculator logic exists in marketing.
- App embeds the widget in authenticated contexts only.
- Widget supports two modes with different surfaces and CTAs.
- Host applications own routing, persistence, and API calls.

## UI Surface by Mode

### Shared (All Modes)
The following UI elements must exist and behave consistently in both modes:
- Persona selector rendered **above** the calculator (tabs or equivalent).
- Input form for all calculator-controlled inputs.
- Live recalculation of results on input change (widget-owned math).
- Deterministic rendering based solely on inputs + persona + contract version.

### mode="marketing"

#### Must Render
- Persona selector (tabs) above calculator
- Input form
- **Basic Results panel only** (as defined in WGT-031)
- One primary visualization suitable for unauthenticated users
- Primary CTA: **“Save & Continue”**
- Secondary CTA: **“Share”**

#### CTA Behavior
- **Save & Continue**
  - Emits `onDraftSnapshot(draft: DraftSnapshot)`
  - Does NOT perform email capture
  - Does NOT navigate or call APIs
- **Share**
  - Emits `onShareSummary(summary: ShareSummary)`
  - Widget does not send emails or create links

#### Must NOT Render
- Email input or gating UI
- Full deal outputs or negotiation surfaces
- Version history or counterparty-specific terms
- Any authenticated-only affordances

### mode="app"

#### May Render
- Full results set (beyond Basic Results)
- Expanded visualizations
- Deal-related UI surfaces appropriate for authenticated users
- Save / update controls tied to app-owned persistence

#### CTA / Event Behavior
- Emits `onSave(payload: SavePayload)` for app-controlled persistence flows
- May emit additional app-scoped events defined in the integration contract

#### Must NOT Render
- Marketing lead capture flows
- Marketing-branded share email affordances
- “Save & Continue” semantics tied to draft token minting

## Host Responsibilities (Explicit Non-Widget Scope)
The widget must **never**:
- Perform routing or redirects
- Call app or marketing APIs directly
- Handle email capture or authentication state
- Persist data outside emitted callbacks

The host (marketing or app) is responsible for:
- Email gating
- Draft-token minting and redemption
- Navigation and resume flows
- Share delivery and access control

## Accessibility & Stability Notes
- Mode switching must not alter underlying math or persona logic.
- UI differences by mode must be declarative and contract-driven, not inferred.
- Any future UI surface changes that affect emitted events require contract review.

## Acceptance Criteria
- A complete, explicit list of UI elements per mode.
- CTA labels and emitted events are unambiguous.
- No overlap or leakage between marketing and app responsibilities.
- Clean references to WGT-031 and WGT-020 for behavioral rules.

## Dependencies
- WGT-031 — Widget gating semantics
- WGT-020 — Share semantics
- WGT-INT-001 — Locked public interface
