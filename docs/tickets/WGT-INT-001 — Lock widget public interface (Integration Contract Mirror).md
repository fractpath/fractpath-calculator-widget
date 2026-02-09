# WGT-INT-001 — Lock widget public interface (Integration Contract Mirror)

## Sprint
Sprint 0 (alignment-only) → enables Sprint 5 execution

## Objective
Make the widget repo the **audited implementation reference** for the widget’s public API and data contracts by
mirroring the canonical integration contract:

- Canonical contract: `docs/architecture/integration-contract.md` (project-level source of truth)
- Widget repo: maintains a **verbatim mirror** used by widget engineers and Sprint 5 agents

This ticket establishes a controlled change process that prevents silent mutation across repos.

## Clarification (Canonical vs Mirror)
- The **canonical contract file** lives at the project level (`docs/architecture/integration-contract.md`).
- This repo must contain a **verbatim mirror** of that file (or a direct reference mechanism) so widget work is contract-driven.
- The widget is canonical for **calculator math, persona logic, and producing DraftSnapshot/ShareSummary**.
- The widget repo is not allowed to diverge from the canonical contract without coordinated versioning (WGT-050).

## Non-Goals
- No code execution in Sprint 0.
- No marketing or app code changes here.
- No UI implementation changes (WGT-030).
- No gating logic changes (WGT-031).
- No share delivery logic (WGT-020 defines payloads; delivery is host-owned).

## Deliverables (Docs Only)
1) Contract mirror
   - Add `docs/architecture/integration-contract.md` in this repo as a **verbatim mirror** of the canonical contract.
   - Include a short header comment noting it is a mirror and must remain identical to canonical.

2) Versioning + deprecation policy
   - Add `docs/architecture/contract-versioning.md` that **references and aligns with WGT-050**, covering:
     - semantic versioning rules for `contract_version`
     - what constitutes MAJOR/MINOR/PATCH changes
     - compatibility window and deprecation policy
     - coordinated release requirements (OPS-INT-001)

3) Public API reference
   - Add `docs/architecture/public-api.md` summarizing:
     - exported component name(s)
     - props + callback signatures
     - payload schemas: `DraftSnapshot`, `ShareSummary`, `SavePayload`
     - mode semantics pointers (WGT-031, WGT-030)

## Stability Guarantees (Hard Rules)
- Any change to public props/callbacks or payload shapes requires:
  - canonical contract update
  - `contract_version` bump per WGT-050
  - coordinated cross-repo update governed by OPS-INT-001
  - release notes entry in widget repo
- No silent mutation:
  - payloads emitted by the widget must remain redeemable/usable by the app within the defined compatibility window.

## Resolved Parameters (No Open Questions)
To prevent interpretive drift, the following are locked now:

- Initial `contract_version`: **1.0.0**
- Compatibility window (minimum):
  - Receivers (marketing/app) must support:
    - current MAJOR of `contract_version`
    - at least one prior MINOR within that MAJOR
  - App must redeem DraftSnapshots for:
    - current MAJOR of `schema_version`
    - at least one prior MINOR within that MAJOR

(Any widening of the window is allowed; any narrowing requires explicit OPS coordination.)

## Acceptance Criteria
- Widget repo contains the contract mirror docs and public API reference.
- Versioning/deprecation rules match WGT-050 and are enforceable.
- Sprint 5 agents can implement without guessing field shapes or version policy.
- Contract updates cannot occur without coordinated version bump and OPS governance.

## Dependencies
- WGT-050 — Contract versioning + deprecation policy
- OPS-INT-001 — Multi-repo orchestration governor
- Canonical contract: `docs/architecture/integration-contract.md` (project-level)

## Notes
This ticket defines governance and documentation artifacts only.
Implementation work remains in WGT-031/WGT-030/WGT-020/WGT-040 and Sprint 5 execution.
