# WGT-030 — Widget UI surface + mode behavior (marketing vs app)

## Sprint
Sprint 0 (rewrite) → Sprint 5 (implementation)

## Objective
Define the widget UI surface area by mode, including persona selector placement, allowed components, and required host integration points.

This ticket is about *what renders* and *what events fire*, not the gating rules (WGT-031) or share rules (WGT-020).

## Requirements

### Persona Selector UX
- Widget must support persona selection via tabs (or equivalent) rendered ABOVE the calculator.
- Persona selection changes:
  - copy / labels
  - optional input presets or defaults (if contract allows)
  - computation context (widget-owned)

### mode="marketing" UI
Must include:
- Persona tabs above widget
- Input form
- Basic Results panel (as defined by WGT-031)
- Primary visualization
- "Save & Continue" CTA (emits draft snapshot callback)
- "Share" CTA (emits share summary callback)

Must NOT include:
- Email capture UI (host owns gating)
- Any full deal/negotiation surfaces
- Any authenticated-only controls

### mode="app" UI
May include:
- Full results + full visualization suite
- Save controls via app-owned persistence callback
- Negotiation/version features (if in scope for app usage)

Must NOT include:
- Marketing lead capture mechanics
- Marketing branded share email mechanics

## Host Integration Points (No Ambiguity)
- Widget must be embeddable as a package import (marketing repo uses tight embed).
- The host (marketing/app) is responsible for:
  - routing / redirects
  - email gating UI
  - calling app APIs
- Widget is responsible for:
  - math
  - persona logic
  - producing DraftSnapshot + ShareSummary payloads

## Acceptance Criteria
- UI components by mode are enumerated.
- The CTA labels and event semantics are explicit.
- Links to WGT-031 for gating and WGT-020 for share behavior.
- No host responsibilities leak into widget and vice versa.

## Dependencies
- WGT-031 (gating semantics)
- WGT-INT-001 (public interface locked)
