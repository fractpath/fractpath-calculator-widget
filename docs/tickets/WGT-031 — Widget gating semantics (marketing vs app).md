# WGT-031 — Widget gating semantics (marketing vs app)

## Sprint
Sprint 0 (alignment-only rewrite) → Sprint 5 (implementation)

## Objective
Define **strict, unambiguous gating rules** for what the widget may **render, emit, and persist** in each mode:
- `mode="marketing"`
- `mode="app"`

These rules prevent interpretation drift across repos, prohibit silent expansion
of marketing-visible outputs, and ensure a clean separation between **persuasive projection**
(marketing) and **authoritative deal review/editing** (app).

This ticket governs **what is allowed to be shown and emitted**, not *how it is styled*
(WGT-030) or *what the data contracts look like* (WGT-INT-001 / WGT-040).

---

## Context (Locked Decisions)
- Widget is canonical for calculator math, schema validation, and persona framing logic.
- Marketing embeds widget and performs **no calculator math**.
- App owns deal creation, persistence, versioning, and permissions.
- Marketing operates entirely on **draft / illustrative projections**.
- App operates on **saved calculator snapshots tied to Deal IDs**.
- Widget has two modes with explicitly different affordances and guarantees.

---

## Definitions
- **Basic Results (Marketing)**  
  A strictly limited, non-binding subset of calculator outputs intended to
  communicate *directional value only*. These are **not deal terms**.

- **Full Deal Outputs (App)**  
  Any outputs that reveal deal structure, pricing mechanics, fee waterfalls,
  counterparty economics, legal terms, or versioned history.

- **DraftSnapshot**  
  A widget-produced snapshot of:
  - applied inputs
  - computed outputs
  - engine/meta information  
  used to resume a projection in the app. DraftSnapshots are **not deals**.

- **Draft Token**  
  An app-minted token that references a DraftSnapshot server-side and enables
  resume after authentication.

---

## Mode Semantics

### mode="marketing" (Unauthenticated, illustrative)

#### Allowed
- Render persona selector UX (Homeowner / Buyer + Realtor tertiary entry).
- Capture inputs via the modal overlay defined in WGT-030.
- Compute full results internally using widget-owned math.
- **Render only Basic Results** (explicit list below).
- Emit `onMarketingSnapshot(snapshot)` when user selects **Save & Continue**.
- Emit `onShareSummary(summary)` for marketing-safe share content.

#### Prohibited
- Rendering Full Deal Outputs.
- Creation of real Deal IDs.
- Persistence beyond emitting DraftSnapshot / ShareSummary payloads.
- Calling app or marketing APIs directly from the widget.
- Reframing or “unlocking” additional outputs without authentication.
- Displaying any value that could be interpreted as a binding quote.

---

### mode="app" (Authenticated, authoritative)

#### Allowed
- Render **all computed outputs** derived from the canonical calculator result.
- Render objective deal review surfaces (terms sheet, charts, fee structures).
- Emit `onAppSaveRequest(payload)` on **Apply** for app-owned persistence.
- Render permissioned share affordances as defined by the host app.

#### Prohibited
- Marketing lead capture flows.
- Marketing-branded persuasion copy or CTAs.
- Draft-token semantics (“Save & Continue”, magic-link resume).
- Any artificial restriction of outputs that exist in the saved snapshot.

---

## Basic Results (Marketing) — **Explicit, Exhaustive List**

In `mode="marketing"`, the widget may render **only** the following categories
of output, framed per persona but derived from the canonical compute result.

### Headline KPI Cards (Persona-Framed)
These are presentation-level cards, not deal terms.

- Homeowner:
  - Upfront cash (illustrative)
  - Monthly cashflow (if applicable)
  - Projected net at sale event (illustrative)

- Buyer:
  - Ownership path over time
  - Monthly contribution + timeline
  - Effective purchase price / discount vs FMV

- Realtor (beta):
  - Immediate commission potential
  - Future sale commission potential
  - Total commission potential

> All values must be clearly labeled as **illustrative estimates**.

### Ranges / Directional Indicators (Non-binding)
- Estimated holding period range
- Estimated future value range
- Estimated cost-of-capital or appreciation context (if shown)

### Visualizations
- At most **two** primary, non-interactive visualizations:
  - ownership / value over time
  - cash or commission realization illustration  
- Visuals must be derived solely from Basic Results (no hidden detail unlocks).

### Assumptions & Disclosures (Read-only)
- Base appreciation assumption (e.g. “Assumes 4%/yr”)
- Platform fee model disclosure
- Equity constraint disclosure:
  - “Only the portion of equity you own (FMV − mortgage) can be sold.”
- General disclaimer (“Illustrative estimate; not a binding offer”)

### Metadata (Display-safe)
- Selected persona
- Calculator schema / assumptions version
- Disclaimer key or copy reference

---

## Explicitly Excluded (Marketing)
If a field or concept is not listed above, it **must not render** in marketing mode.

Marketing mode must NOT render:
- Counterparty-specific pricing mechanics
- Fee waterfalls or payout schedules
- APR or legally interpretable rates
- Legal or contractual clauses
- Deal version history or comparisons
- Editable assumptions
- Scenario comparison tables
- Any value that could reasonably be construed as a final offer

---

## Save & Continue Gating Flow (Marketing)
1) User selects persona → widget resets output to empty state.
2) User opens input modal, enters required inputs.
3) User clicks **Apply**:
   - widget computes results
   - widget renders Basic Results only
4) User clicks **Save & Continue**:
   - widget emits `onMarketingSnapshot(snapshot)`
5) Hosting marketing app is responsible for:
   - email capture gating
   - calling app-owned lead or mint endpoint
   - receiving draft token
   - redirecting to app resume/signup flow

---

## Marketing Share Gating Flow
1) User clicks **Share**:
   - widget emits `onShareSummary(summary)` containing marketing-safe fields only
2) Hosting app:
   - sends branded email
   - mints magic link
   - enforces that no real deal data is accessible without auth

---

## App Share Flow
- Widget may render share state in `mode="app"`.
- All permission checks and access control are app-owned.
- No marketing-originated share grants access to real deal data without authentication.

---

## Acceptance Criteria
- Basic Results are **explicitly enumerated and exhaustive**.
- Persona-framed outputs exist only in marketing mode.
- No marketing-visible output exists outside the allowed list.
- Apply semantics are respected (no silent recompute or unlock).
- Callback responsibilities are unambiguous and host-owned.
- App mode renders authoritative snapshot data without artificial gating.

---

## Dependencies
- WGT-030 — Widget UI surface + mode behavior
- WGT-020 — Share semantics
- WGT-040 — Draft snapshot schema + stability guarantees
- WGT-INT-001 — Locked public interface
