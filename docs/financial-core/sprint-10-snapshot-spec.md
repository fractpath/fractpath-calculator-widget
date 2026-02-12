Excellent. This is the document that ensures your financial engine cannot drift or mutate after approval.

📄 DOCUMENT 3 OF N
Snapshot Architecture & Persistence Specification

This governs how computed deals are stored in the app and protects auditability.

✅ Repository

fractpath-app

Reason:

Snapshots are persisted in Supabase via the app.

Persistence and immutability are app responsibilities.

Compute module lives elsewhere, but snapshots live here.

✅ File Path
docs/financial-core/sprint-10-snapshot-spec.md


Create docs/financial-core/ if it does not exist.

✅ Paste the Following Entire Document Into That File
# FractPath — Sprint 10 Snapshot Architecture Specification

Version: 10.0.0  
Applies To: fractpath-app  
Depends On: sprint-10-compute-spec.md  

---

# Purpose

This document defines how financial results are persisted immutably after deal approval.

Snapshots are the canonical historical record of:

- Inputs
- Assumptions
- Outputs
- Compute version

Snapshots must never mutate silently.

---

# Core Principles

1. Snapshots are immutable.
2. Snapshots store both inputs and outputs.
3. Snapshots store compute_version.
4. Snapshots store computed_at timestamp.
5. Forks copy inputs only, not outputs.
6. Recompute must reproduce stored outputs deterministically.

---

# Snapshot Data Structure

Upon deal approval, the following JSON payload must be persisted:

```json
{
  "compute_version": "10.0.0",
  "inputs": { ...DealTerms },
  "assumptions": { ...ScenarioAssumptions },
  "outputs": { ...DealResults },
  "computed_at": "ISO_TIMESTAMP"
}

Database Requirements

The database must:

Store snapshot as JSONB

Prevent mutation after creation

Allow read access

Allow fork generation

Recommended table:

deal_snapshots


Fields:

id (uuid)

deal_id (uuid)

compute_version (text)

snapshot_payload (jsonb)

created_at (timestamp)


---

# Immutability Rules

After insertion:

- snapshot_payload must never be updated.
- compute_version must never change.
- outputs must never be overwritten.

If deal terms are modified:

- A new snapshot must be created.
- The old snapshot remains preserved.

---

# Fork Invariant

When a deal is forked:

1. Copy inputs from prior snapshot.
2. Copy assumptions from prior snapshot.
3. DO NOT copy outputs.
4. Recompute using current compute version.
5. Create new snapshot on approval.

---

# Deterministic Recompute Invariant

Before persisting snapshot:

App must validate:



compute(inputs, assumptions) === outputs


Comparison must be within rounding tolerance defined in compute spec.

If mismatch:

- Throw error
- Prevent persistence

---

# Compute Version Enforcement

Snapshots must store:



compute_version


If compute logic changes:

- Version must increment
- New deals use new version
- Old snapshots remain tied to old version

No retroactive mutation permitted.

---

# Audit Capability

Snapshots must allow reconstruction of:

- Projected FMV
- IBA
- Gain
- Floor/ceiling
- IRR
- Settlement amount

At any point in time.
