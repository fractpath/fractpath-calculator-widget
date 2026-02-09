# WGT-040 — DraftSnapshot schema + stability guarantees

## Sprint
Sprint 0 (alignment-only) → Sprint 5 (implementation)

## Objective
Define and lock the **DraftSnapshot** schema produced by the widget and
consumed by the app.

This ticket eliminates ambiguity around:
- required vs optional fields
- determinism guarantees
- versioning and backward compatibility
- non-binding semantics

No field may be added, removed, or inferred outside this definition
without a contract version change.

## DraftSnapshot — Purpose
A DraftSnapshot represents a **non-binding, pre-auth snapshot** of:
- user inputs
- widget-computed outputs
- calculation context

It exists solely to allow a user to resume their work in the app after
email capture and authentication.

A DraftSnapshot is **not** a deal, offer, quote, or commitment.

## DraftSnapshot — Required Fields (Exhaustive)

### Identity & Versioning
- `snapshot_id`  
  - opaque, widget-generated identifier
- `contract_version`  
  - version of the integration contract used to generate this snapshot
- `schema_version`  
  - DraftSnapshot schema version (semantic versioning)
- `created_at`  
  - ISO-8601 timestamp (UTC)

### Context
- `mode`  
  - must be `"marketing"` at time of creation
- `persona`  
  - canonical persona identifier used by widget
- `calculation_assumptions_version`  
  - identifier for the assumption set used by the calculator

### Inputs (User-Provided)
- `property_value_input`
- `desired_cash_input`
- `equity_fraction_input`
- `holding_period_input`
- Any additional inputs **explicitly enumerated in the integration contract**

> All inputs must be raw user inputs, not normalized or inferred values.

### Outputs (Widget-Computed, Non-binding)
- `estimated_cash_unlocked`
- `estimated_equity_fraction_sold`
- `estimated_future_value_range`
- `estimated_cost_of_capital_range`
- Any additional outputs explicitly permitted by WGT-031 Basic Results

### Integrity
- `input_hash`
  - deterministic hash of canonicalized inputs + persona + assumptions
- `output_hash`
  - deterministic hash of computed outputs

## Optional Fields (Explicit Allowlist Only)
Optional fields may exist **only if defined in the integration contract**.
Absence of optional fields must not break app redemption.

No free-form or marketing-only metadata is permitted.

## Prohibited Fields
DraftSnapshot must NOT include:
- counterparty identifiers
- pricing terms
- legal clauses
- deal IDs
- negotiation state
- user authentication identifiers
- any binding or quote-like language

## Determinism Guarantees
- Given identical:
  - inputs
  - persona
  - assumptions version
  - contract version  
  the widget must produce identical outputs and hashes.
- Determinism is required for auditability and replay.

## Versioning & Compatibility Rules
- `schema_version` follows semantic versioning:
  - **PATCH**: additive, backward-compatible metadata
  - **MINOR**: additive fields with app-side tolerance
  - **MAJOR**: breaking changes (requires coordinated release)
- App must be able to redeem snapshots produced by:
  - the current MAJOR version
  - at least one prior MINOR version

## Upgrade & Failure Semantics
- If app encounters an unsupported `schema_version`:
  - redemption must fail explicitly
  - no partial deal may be created
- No silent field inference or defaulting is allowed.

## Stability Guarantees
- DraftSnapshot shape is frozen for Sprint 5 execution.
- Any mutation requires:
  - contract update
  - WGT-050 version bump
  - coordination via OPS-INT-001

## Acceptance Criteria
- DraftSnapshot schema is explicit and exhaustive.
- No implied or inferred fields exist.
- App redemption behavior is deterministic and auditable.
- Snapshot is clearly non-binding at all times.

## Dependencies
- WGT-INT-001 — Widget public interface (contract mirror)
- WGT-031 — Widget gating semantics
- WGT-050 — Contract versioning + deprecation policy
- OPS-INT-001 — Multi-repo orchestration
