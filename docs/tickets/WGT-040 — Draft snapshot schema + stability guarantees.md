# WGT-040 — DraftSnapshot schema + stability guarantees

## Sprint
Sprint 0 (alignment-only) → Sprint 5 (implementation)

## Objective
Define and lock the **DraftSnapshot** schema produced by the widget and consumed by the app.

This ticket eliminates ambiguity around:
- required vs optional fields
- determinism guarantees
- versioning and backward compatibility
- non-binding semantics
- equity-availability constraints (FMV − mortgage)

No field may be added, removed, renamed, or inferred outside this definition
without a schema version change governed by WGT-050.

---

## DraftSnapshot — Purpose
A DraftSnapshot represents a **non-binding, pre-auth snapshot** of:
- applied user inputs (as captured in the modal)
- widget-computed outputs
- calculation context and assumptions used

It exists solely to allow a user to resume their work in the app after
email capture and authentication.

A DraftSnapshot is **not** a deal, offer, quote, or commitment.

---

## Naming + Contract Alignment
DraftSnapshot is the transport envelope for the canonical calculator contract:
- `CalculatorInputsV1` (inputs)
- `CalculatorResultV1` (result)

DraftSnapshot must embed these objects in full (not partial field lists) so the app can:
- render the same projection deterministically
- persist it as the first saved snapshot upon deal creation (post-auth)
- validate against the widget’s exported schemas

Marketing display constraints are governed by WGT-031; DraftSnapshot may contain full compute output,
but marketing must render only Basic Results.

---

## DraftSnapshot — Required Fields (Exhaustive)

### Identity & Versioning
- `snapshot_id`
  - opaque, widget-generated identifier (uuid recommended)
- `schema_version`
  - DraftSnapshot schema version (semantic versioning; starts at `"v1"`)
- `calculator_schema_version`
  - calculator contract schema version (e.g. `"v1"`)
- `engine_version`
  - widget package engine version used to compute (e.g. package.json version)
- `created_at_iso`
  - ISO-8601 timestamp (UTC)

### Context
- `mode`
  - must be `"marketing"` at time of creation
- `persona`
  - canonical persona identifier used for marketing framing at time of creation
  - allowed: `"homeowner" | "buyer" | "realtor"`
- `assumptions`
  - the assumption set applied by the engine at compute time (object)
  - in marketing this is read-only in UI but MUST be included in snapshot for replay

### Inputs (Applied, User-Provided + Explicit Defaults)
- `inputs`
  - the applied calculator inputs object
  - MUST be valid against `CalculatorInputsV1Schema`
  - includes required user-provided values (e.g. FMV, mortgage balance for homeowner)
  - includes explicit defaults used by the engine for omitted optional fields
  - note: “raw typing state” is NOT included; only applied modal values

### Outputs (Widget-Computed, Non-binding)
- `result`
  - the computed calculator result object
  - MUST be valid against `CalculatorResultV1Schema`
  - includes:
    - KPI outputs
    - breakdown / terms sheet rows
    - charts / series (if generated)
    - ops / waterfall / fee structure outputs (if part of compute today)

### Integrity
- `inputs_hash`
  - deterministic hash of canonicalized `inputs` + `calculator_schema_version`
- `result_hash`
  - deterministic hash of canonicalized `result` + `calculator_schema_version`

> Hashes must be stable across hosts and time. Hashes must not include timestamps.

---

## Equity Availability Constraint (Required Semantics)
The engine MUST enforce and disclose the equity constraint:

- sellable equity is limited to the equity the user owns:
  - `available_equity_usd = max(0, FMV - mortgage_balance)`
- calculator must not produce projections that imply selling more equity than available

This must be reflected as:
- validation: reject impossible inputs (or clamp with explicit disclosure—pick one behavior and keep it deterministic)
- disclosure: a breakdown row and/or assumption note:
  - “Only the portion of equity you own (FMV − mortgage) can be sold.”

This constraint is mandatory for homeowner persona Day 1.

---

## Optional Fields (Explicit Allowlist Only)
Optional fields may exist only if:
- explicitly defined in WGT-INT-001 contract, AND
- they are additive and non-breaking per WGT-050

Optional fields MUST be safe for app redemption even if absent.

No free-form marketing metadata is permitted.

---

## Prohibited Fields
DraftSnapshot must NOT include:
- deal IDs
- counterparty identifiers or permissions
- negotiation state / version history
- authentication identifiers (user_id, email, etc.)
- legal clauses or binding quote language
- API URLs, routing info, or host-specific payload wrappers
- any field that implies a committed offer

---

## Determinism Guarantees
Given identical:
- applied `inputs`
- `calculator_schema_version`
- `engine_version`
the widget must produce identical:
- `result` numeric outputs
- `inputs_hash` and `result_hash`

Persona affects **marketing presentation**, not compute.
DraftSnapshot records persona for replay of marketing framing, but compute determinism must not depend on persona.

---

## Versioning & Compatibility Rules
- `schema_version` follows semantic versioning policy governed by WGT-050.
- App must be able to redeem snapshots produced by:
  - the current MAJOR version
  - at least one prior MINOR version

---

## Upgrade & Failure Semantics
- If app encounters unsupported `schema_version` or invalid schema payload:
  - redemption must fail explicitly
  - no partial deal may be created
- No silent field inference or defaulting is allowed by the app during redemption.
- If engine defaults change between versions, snapshots remain replayable because defaults used are embedded in `inputs` and `assumptions`.

---

## Stability Guarantees
- DraftSnapshot shape is frozen for Sprint 5 execution.
- Any mutation requires:
  - WGT-050 version bump policy application
  - WGT-INT-001 contract mirror update
  - explicit multi-repo coordination

---

## Acceptance Criteria
- DraftSnapshot schema is explicit and exhaustive.
- Snapshot embeds `inputs` and `result` objects that validate against widget-exported schemas.
- Hash rules are deterministic and exclude timestamps.
- Persona is recorded but does not affect compute determinism.
- Equity-availability constraint is enforced and disclosed.
- App redemption behavior is deterministic and auditable.
- Snapshot is clearly non-binding at all times.

---

## Dependencies
- WGT-030 — Widget UI surface + mode behavior
- WGT-031 — Widget gating semantics
- WGT-050 — Contract versioning + deprecation policy
- WGT-INT-001 — Widget public interface (contract mirror)
- OPS-INT-001 — Multi-repo orchestration
