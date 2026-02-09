# WGT-031 — Widget gating semantics (marketing vs app)

## Sprint
Sprint 0 (alignment-only rewrite) → Sprint 5 (implementation)

## Objective
Define unambiguous gating rules for what the widget may display, persist, and emit in each mode:
- `mode="marketing"`
- `mode="app"`

These rules must prevent interpretation drift across repos.

## Context (Locked Decisions)
- Widget is canonical for calculator math and persona logic.
- Marketing embeds widget and does no calculator math.
- App owns draft-token minting + redemption; no real deals pre-auth.
- Marketing share = branded email summary + magic link (proto deal).
- App share = permissioned, authenticated, read-only deal access.
- Widget has two modes with different surfaces and behaviors.

## Definitions
- **Basic Results**: the minimal set of outputs allowed to display pre-auth in marketing (explicitly listed below).
- **Full Deal Outputs**: any outputs that reveal deal structure details, version graphs, counterparty terms, or anything requiring app permissions.
- **DraftSnapshot**: widget-produced snapshot of inputs + computed outputs needed to resume in app.
- **Draft Token**: app-minted token that references/persists a DraftSnapshot server-side.

## Mode Semantics

### mode="marketing"
Allowed:
- Render persona selector UX (tabs) + input form.
- Compute all results locally (widget-owned math) but **display only Basic Results**.
- Emit `onDraftSnapshot(draft: DraftSnapshot)` when user hits "Save & Continue" (or equivalent).
- Emit `onShareSummary(share: ShareSummary)` for marketing share email content.

Not allowed:
- No full deal functionality, no negotiation state, no version history.
- No creation of real deals.
- No persistence beyond emitting DraftSnapshot/ShareSummary via callbacks.
- No calling app APIs directly from the widget.

### mode="app"
Allowed:
- Render full deal functionality and all outputs needed for authenticated user flows.
- Emit `onSave(payload: SavePayload)` for app-owned persistence flows.
- Render permissioned share UX (as designed in app), if the widget is used there.

Not allowed:
- App mode must not reintroduce marketing lead capture or marketing email gating.

## Basic Results (Marketing) — Explicit List
Marketing may show ONLY:
- High-level "headline" outputs: e.g., estimated cash unlocked, estimated monthly/annual impact ranges, and a single primary visualization.
- Must NOT show any counterparty-specific terms, legal clauses, or deal version structures.
- Must NOT show any output that could be construed as a binding quote.

> NOTE: The specific fields included in Basic Results must be enumerated here or referenced via the contract doc section. No implied fields.

## Save & Continue Gating Flow (Marketing)
1) User edits inputs → widget updates Basic Results live.
2) User clicks "Save & Continue":
   - widget produces `DraftSnapshot`
   - widget calls `onDraftSnapshot(draft)`
3) Hosting app (marketing) is responsible for:
   - email capture gating
   - calling app-owned mint endpoint (`/api/lead` as per MKT-006 rewrite)
   - receiving draft token
   - redirecting to app `/resume?token=...`

## Marketing Share Gating Flow
1) User clicks "Share":
   - widget produces `ShareSummary` (marketing-safe content only)
   - widget calls `onShareSummary(summary)`
2) Hosting app (marketing) sends branded email + magic link via `/api/share` (per MKT-006 rewrite)

## App Share Flow
- Widget may support rendering share state in app mode, but share permissions and delivery are app-owned.
- Any share link that grants access to real deal data must require authentication/authorization checks server-side.

## Acceptance Criteria
- A single, unambiguous list of what can appear in marketing vs app.
- Explicit callback responsibilities split between widget and host.
- No place where "it depends" is allowed; all boundaries defined or referenced to contract sections.
- Aligns with the canonical integration contract.

## Dependencies
- WGT-INT-001 (public interface locked)
- WGT-030 (UI surface implementation)
- WGT-020 (share semantics details)
