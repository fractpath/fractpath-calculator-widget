# WGT-031 — Widget gating semantics (marketing vs app)

## Sprint
Sprint 0 (alignment-only rewrite) → Sprint 5 (implementation)

## Objective
Define unambiguous gating rules for what the widget may display, persist, and emit in each mode:
- `mode="marketing"`
- `mode="app"`

These rules prevent interpretation drift across repos and prohibit silent expansion
of marketing-visible outputs.

## Context (Locked Decisions)
- Widget is canonical for calculator math and persona logic.
- Marketing embeds widget and does no calculator math.
- App owns draft-token minting + redemption; no real deals pre-auth.
- Marketing share = branded email summary + magic link (proto deal).
- App share = permissioned, authenticated, read-only deal access.
- Widget has two modes with different surfaces and behaviors.

## Definitions
- **Basic Results**: the *only* outputs permitted to render pre-auth in marketing.
- **Full Deal Outputs**: any outputs that reveal deal structure, pricing mechanics,
  counterparty terms, legal clauses, or version history.
- **DraftSnapshot**: widget-produced snapshot of inputs + computed outputs needed
  to resume in app.
- **Draft Token**: app-minted token that references/persists a DraftSnapshot server-side.

## Mode Semantics

### mode="marketing"

#### Allowed
- Render persona selector UX (tabs) + input form.
- Compute all results locally (widget-owned math) but **display only Basic Results**.
- Emit `onDraftSnapshot(draft: DraftSnapshot)` when user selects “Save & Continue”.
- Emit `onShareSummary(summary: ShareSummary)` for marketing share email content.

#### Prohibited
- Full deal functionality (negotiation, counterparty terms, version graphs).
- Creation of real deals.
- Persistence beyond emitting DraftSnapshot / ShareSummary.
- Calling app APIs directly from the widget.
- Any output not explicitly listed as a Basic Result.

### mode="app"

#### Allowed
- Render full deal functionality and all computed outputs.
- Emit `onSave(payload: SavePayload)` for app-owned persistence.
- Render permissioned share UX as defined by the app.

#### Prohibited
- Marketing lead capture flows.
- Marketing email gating or branded share mechanics.

## Basic Results (Marketing) — **Explicit, Exhaustive List**

Marketing mode may render **only** the following widget-computed fields:

### Headline Outputs
- `estimated_cash_unlocked`
- `estimated_equity_fraction_sold`
- `estimated_home_value_used_for_calculation`

### Time / Impact Ranges (Non-binding)
- `estimated_holding_period_range`
- `estimated_cost_of_capital_range`
- `estimated_future_value_range`

### Visualizations
- One primary, non-interactive visualization derived solely from the above fields
  (e.g., value-over-time or ownership-split illustration)

### Metadata (Display-safe)
- `persona`
- `calculation_assumptions_version`
- `disclaimer_key` (pointer to non-binding copy)

### Explicitly Excluded
Marketing mode must NOT render:
- Counterparty-specific pricing
- Legal or contractual clauses
- Deal version structures
- Scenario comparison tables
- Any value that could be interpreted as a binding quote

If a field is not listed above, it is **not** a Basic Result.

## Save & Continue Gating Flow (Marketing)
1) User edits inputs → widget updates Basic Results live.
2) User clicks “Save & Continue”:
   - widget produces `DraftSnapshot`
   - widget calls `onDraftSnapshot(draft)`
3) Hosting app (marketing) is responsible for:
   - email capture gating
   - calling app-owned mint endpoint (`/api/lead`)
   - receiving draft token
   - redirecting to app `/resume?token=...`

## Marketing Share Gating Flow
1) User clicks “Share”:
   - widget produces `ShareSummary` (marketing-safe only)
   - widget calls `onShareSummary(summary)`
2) Hosting app sends branded email + magic link via `/api/share`.

## App Share Flow
- Widget may render share state in app mode.
- All permission checks and access control are app-owned.
- No marketing-originated share grants access to real deal data without auth.

## Acceptance Criteria
- Basic Results are explicitly enumerated and exhaustive.
- No marketing-visible output exists outside this list.
- Callback responsibilities are unambiguous.
- All behavior aligns with the canonical integration contract.

## Dependencies
- WGT-INT-001 — Public interface locked
- WGT-030 — Widget UI surface + mode behavior
- WGT-020 — Share semantics
