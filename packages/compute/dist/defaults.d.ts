import type { DealTerms } from "./types.js";
/**
 * Canonical default DealTerms generator.
 * Deterministic + pure (no env, no I/O).
 *
 * This returns a COMPLETE DealTerms object as required by the compute engine.
 * It is intentionally conservative/minimal and can be calibrated later.
 */
export declare function defaultDealTerms(params: {
    iba_usd: number;
    maturity_months: number;
}): DealTerms;
