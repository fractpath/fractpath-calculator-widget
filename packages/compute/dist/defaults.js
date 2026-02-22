/**
 * Canonical default DealTerms generator.
 * Deterministic + pure (no env, no I/O).
 *
 * This returns a COMPLETE DealTerms object as required by the compute engine.
 * It is intentionally conservative/minimal and can be calibrated later.
 */
export function defaultDealTerms(params) {
    const iba = Number(params.iba_usd);
    const maturityMonths = Number(params.maturity_months);
    if (!Number.isFinite(iba) || iba <= 0) {
        throw new Error("defaultDealTerms: iba_usd must be a positive number");
    }
    if (!Number.isFinite(maturityMonths) || maturityMonths <= 0) {
        throw new Error("defaultDealTerms: maturity_months must be a positive number");
    }
    const maturityYears = Math.max(1, Math.ceil(maturityMonths / 12));
    return {
        property_value: 0,
        upfront_payment: iba,
        monthly_payment: 0,
        number_of_payments: 0,
        payback_window_start_year: 0,
        payback_window_end_year: maturityYears,
        timing_factor_early: 1,
        timing_factor_late: 1,
        floor_multiple: 0.8,
        ceiling_multiple: 2.0,
        downside_mode: "HARD_FLOOR",
        contract_maturity_years: maturityYears,
        liquidity_trigger_year: maturityYears,
        minimum_hold_years: 0,
        platform_fee: 0,
        servicing_fee_monthly: 0,
        exit_fee_pct: 0,
        duration_yield_floor_enabled: false,
        duration_yield_floor_start_year: null,
        duration_yield_floor_min_multiple: null,
    };
}
