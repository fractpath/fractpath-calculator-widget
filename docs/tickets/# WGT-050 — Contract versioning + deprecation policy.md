# WGT-050 — Contract versioning + deprecation policy (no silent mutation)

## Sprint
Sprint 0 (alignment-only) → governs all Sprint 5 execution and beyond

## Objective
Codify an enforceable breaking-change protocol for:
- Widget public interface (props + callbacks)
- Serialized payloads (`DraftSnapshot`, `ShareSummary`, `SavePayload`)
- Mode semantics (`mode="marketing"` vs `mode="app"`)

This policy prevents silent mutation and ensures cross-repo coordination.

## Canonical Source of Truth
- Canonical contract file: `docs/architecture/integration-contract.md`
- This repo must mirror or reference the canonical contract via WGT-INT-001.

## Version Fields (Required)
The following version identifiers must exist and be carried through payloads:

1) `contract_version` (semantic version)
- Governs the public interface and all payload shapes.

2) `schema_version` (semantic version; per payload when applicable)
- Used for payload-specific evolution (e.g., DraftSnapshot schema).

## Semantic Versioning Rules (Enforced)

### contract_version
- **MAJOR**: Breaking changes
  - Removing/renaming props or callbacks
  - Changing required field names/types
  - Changing meaning/semantics of a field (even if name stays the same)
  - Changing mode behavior that alters allowed outputs (WGT-031/WGT-030)
- **MINOR**: Backward-compatible additions
  - Adding optional props/callbacks (must have safe defaults)
  - Adding optional fields to payloads (must not be required by receivers)
- **PATCH**: Non-functional or internal changes
  - Documentation clarifications
  - Bug fixes that do not change output meaning
  - Performance improvements that preserve determinism and semantics

### schema_version (DraftSnapshot / ShareSummary)
- **MAJOR**: Receiver would break or misinterpret data
- **MINOR**: Additive optional fields only
- **PATCH**: Clarifications / metadata that is safely ignorable

## Compatibility Window (Hard Requirement)
To prevent breaking production links and emails:

- Marketing and App must accept:
  - the current `contract_version` MAJOR
  - at least the prior MINOR within that MAJOR
- App must be able to redeem DraftSnapshots for:
  - the current DraftSnapshot `schema_version` MAJOR
  - at least one prior MINOR within that MAJOR

No change may shorten this window without explicit cross-repo approval.

## Deprecation Policy
- A feature, prop, callback, or field is deprecated only when:
  - it is marked deprecated in the canonical contract
  - a removal version is specified (future MAJOR)
  - migration guidance is provided
- Deprecated surfaces must remain supported for the compatibility window.

## Coordinated Release Requirements (No Silent Mutation)
Any change that impacts the contract requires:

1) Update canonical contract (`integration-contract.md`)
2) Bump `contract_version` appropriately
3) Update widget repo mirror/reference (WGT-INT-001)
4) Create or update OPS coordination entry (OPS-INT-001) indicating:
   - which repos must update
   - required order (widget → marketing → app)
5) Release notes entry documenting:
   - what changed
   - why
   - migration steps

No agent or developer may implement a contract change without these steps.

## Changelog Requirements
- Maintain a changelog entry per `contract_version` bump:
  - Added / Changed / Deprecated / Removed
  - Explicit breaking-change callouts for MAJOR bumps
- Changelog must be referenced by the Sprint 5 agent prompts.

## Determinism & Meaning Preservation
- Contract updates must not introduce ambiguity:
  - Every field must have a clear meaning, unit, and constraints.
- Determinism is required:
  - identical inputs + persona + assumptions must yield identical outputs

## Acceptance Criteria
- Versioning rules are explicit and non-negotiable.
- Compatibility window is defined and enforceable.
- Coordinated release steps prevent silent mutation.
- Sprint 5 agents can implement without making interpretive choices.

## Dependencies
- WGT-INT-001 — Contract mirror / public interface lock
- OPS-INT-001 — Multi-repo orchestration governor
- WGT-031 — Gating semantics
- WGT-040 — DraftSnapshot schema
