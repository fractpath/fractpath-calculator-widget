# WGT-040 — Draft snapshot schema + stability guarantees

## Objective
Lock DraftSnapshot schema: required fields, optional fields, invariants, and backward compatibility expectations.

## Must Define
- Minimal required inputs
- Persona + mode markers
- Deterministic outputs needed to resume in app
- Schema version field and upgrade strategy

## Acceptance
- App can redeem any DraftSnapshot produced within supported versions.
- Snapshot is non-binding and clearly labeled as draft/proto.
