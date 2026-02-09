# WGT-INT-001 — Lock widget public interface (Integration Contract Mirror)

## Sprint
Sprint 0 (alignment-only) → enables Sprint 5 execution

## Objective
Make the widget repo the canonical, audited source of truth for the widget's public API and data contracts, matching:
`docs/architecture/integration-contract.md` (canonical contract file).

This ticket creates a "contract mirror" inside the widget repo and establishes stability guarantees that prevent silent mutation.

## Non-Goals
- No code execution in Sprint 0.
- No marketing or app code changes here.
- No UI implementation changes (those belong to WGT-030).
- No gating logic implementation changes (those belong to WGT-031).

## Deliverables (Docs Only)
1) Add `docs/architecture/integration-contract.md` (or mirror path) into this repo **verbatim** as the canonical contract used by widget engineers.
2) Add `docs/architecture/contract-versioning.md` describing:
   - contract version format (e.g., `contract_version: "1.0.0"`)
   - what constitutes breaking vs non-breaking changes
   - deprecation policy and coordination requirement
3) Add `docs/architecture/public-api.md` summarizing:
   - exported component name(s)
   - props + callback shapes
   - data types: `DraftSnapshot`, `ShareSummary`, `SavePayload`
   - mode semantics pointer (WGT-031, WGT-030)

## Stability Guarantees
- Any change to public props/callbacks or data shapes requires:
  - explicit version bump
  - coordination ticket in OPS-INT-001 (cross-repo)
  - release notes entry in widget repo
- No silent mutation: data serialized from the widget must be backward-readable by the app for the supported contract window.

## Acceptance Criteria
- The widget repo contains the contract mirror docs with explicit versioning and change control rules.
- Public interface definitions are centralized and linkable from ticket docs.
- The doc set is sufficient for a Sprint 5 agent to implement without guessing.

## Dependencies
- Canonical file referenced: `docs/architecture/integration-contract.md` (project-level)
- Coordination: OPS-INT-001 (multi-repo orchestration meta)

## Open Questions (must be resolved in Sprint 0)
- What is the initial `contract_version`?
- Supported compatibility window (e.g., last N minor versions)?
