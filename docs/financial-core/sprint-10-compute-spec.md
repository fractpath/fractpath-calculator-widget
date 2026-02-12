# FractPath — Sprint 10 Canonical Compute Specification
Version: 10.0.0  
Status: Frozen for Engineering  
Applies To: @fractpath/compute  

---

# Purpose

This document defines the single source of financial truth for FractPath.

All compute logic implemented in code must strictly adhere to this specification.

Marketing, App, Snapshot persistence, and any third-party integrations must rely on the canonical compute module governed by this document.

No alternative math implementations are permitted.

---

# Core Principles

1. Deterministic compute (same inputs → same outputs)
2. Single source of financial truth
3. Snapshot immutability
4. Versioned compute logic
5. Marketing + App math parity
6. Fork copies inputs only, not outputs
7. No silent mutation of binding financial fields

---

# Canonical Schemas

## DealTerms (Binding on Approval)

These values are immutable once a deal is approved.

```ts
interface DealTerms {
  property_value: number
  upfront_payment: number
  monthly_payment: number
  number_of_payments: number

  payback_window_start_year: number
  payback_window_end_year: number

  timing_factor_early: number
  timing_factor_late: number

  floor_multiple: number
  ceiling_multiple: number

  downside_mode: "HARD_FLOOR" | "NO_FLOOR"

  contract_maturity_years: number
  liquidity_trigger_year: number
  minimum_hold_years: number

  platform_fee: number
  servicing_fee_monthly: number
  exit_fee_pct: number
}
