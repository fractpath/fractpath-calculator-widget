# WGT-020 — Share semantics (marketing vs app)

## Sprint
Sprint 0 (alignment-only rewrite) → Sprint 5 (implementation)

## Objective
Define share behavior and payload semantics distinctly for:
- **Marketing share**: unauthenticated, branded email summary + magic link
- **App share**: authenticated, permissioned, read-only access to real deals

This ticket explicitly locks the **ShareSummary** schema and prevents
marketing-visible shares from ever implying a binding deal.

The widget may **produce share-safe summaries**, but must never own
share delivery, access control, or persistence.

## Definitions
- **ShareSummary**: a widget-produced, unauthenticated-safe summary payload
  intended solely for marketing email sharing.
- **Marketing Share**: pre-auth, non-binding, informational only.
- **App Share**: post-auth, permissioned, deal-backed access.

## Marketing Share (mode="marketing")

### Widget Responsibilities
The widget MUST:
- Produce a `ShareSummary` object containing **only the fields enumerated below**
- Call `onShareSummary(summary: ShareSummary)`
- Treat ShareSummary as **display-only**, non-binding information

The widget must NOT:
- Send emails
- Generate magic links
- Call APIs
- Persist share data

### ShareSummary — Required Fields (Exhaustive)

#### Identity & Context
- `summary_id`
  - opaque, widget-generated identifier
- `contract_version`
  - integration contract version used to generate summary
- `created_at`
  - ISO-8601 timestamp (UTC)
- `persona`
  - canonical persona identifier

#### Display-Safe Headline Outputs
(Subset of WGT-031 Basic Results only)
- `estimated_cash_unlocked`
- `estimated_equity_fraction_sold`
- `estimated_future_value_range`

#### Input Highlights (Non-sensitive)
- `property_value_input`
- `holding_period_input`

#### Copy & Disclaimers
- `disclaimer_key`
  - pointer to non-binding legal/marketing copy
- `non_binding: true`
  - explicit flag indicating summary is informational only

### Explicitly Prohibited Fields
ShareSummary must NOT include:
- deal IDs
- draft tokens
- counterparty identifiers
- pricing terms
- legal clauses
- version history
- user identifiers
- authentication context

If a field is not listed above, it is **not permitted**.

### Host (Marketing) Responsibilities
Marketing MUST:
- Treat ShareSummary as opaque, contract-defined data
- Forward it unchanged to `/api/share`
- Generate branded email + magic link outside the widget
- Ensure email copy clearly indicates non-binding status

Marketing must NOT:
- Add, remove, or mutate ShareSummary fields
- Derive new metrics from ShareSummary data
- Interpret ShareSummary as a quote or offer

### Magic Link Semantics
- Marketing share links may point to:
  - app `/resume?token=...`, or
  - a marketing-safe landing that forwards to app
- Access to real deal data always requires authentication and authorization.

## App Share (mode="app")

### Widget Role (Optional)
- When embedded in app mode, widget may render share UI state
  or emit a **share intent** event (no payload schema defined here).

### App Responsibilities
The app:
- Creates permissioned share artifacts server-side
- Enforces authentication, authorization, and logging
- Provides read-only deal views
- Controls share revocation and expiry

Marketing ShareSummary must never be reused for app-level sharing.

## Prohibitions (No Silent Mutation)
- Widget must not infer or enrich ShareSummary fields.
- Marketing must not “enhance” summaries.
- App must not treat ShareSummary as authoritative deal data.

Violations require contract review and version bump.

## Acceptance Criteria
- Marketing and app share semantics are strictly separated.
- ShareSummary schema is explicit and exhaustive.
- No marketing share can be mistaken for a binding deal.
- Widget never performs share delivery or access control.

## Dependencies
- WGT-031 — Widget gating semantics
- WGT-040 — DraftSnapshot schema
- WGT-INT-001 — Public interface locked
- OPS-INT-001 — Multi-repo orchestration
