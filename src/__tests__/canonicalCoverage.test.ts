import { describe, it, expect } from "vitest";
import { getDefaultDraftCanonicalInputs } from "../widget/editing/defaults.js";
import { FIELD_META } from "../widget/editing/fieldMeta.js";
import { TAB_CONFIG } from "../widget/editing/tabConfig.js";
import { flattenKeys } from "./helpers/dotPaths.js";

const NON_UI_KEYS = [
  "__disclosure__",
] as const;

const OPTIONAL_COMPUTE_KEYS = [
  "deal_terms.fmv_override",
] as const;

describe("Canonical Field Coverage Guard", () => {
  const defaults = getDefaultDraftCanonicalInputs();
  const defaultKeys = flattenKeys(defaults as unknown as Record<string, unknown>);

  it("defaults include every required canonical key", () => {
    const REQUIRED_DEAL_TERMS_KEYS = [
      "deal_terms.property_value",
      "deal_terms.upfront_payment",
      "deal_terms.monthly_payment",
      "deal_terms.number_of_payments",
      "deal_terms.payback_window_start_year",
      "deal_terms.payback_window_end_year",
      "deal_terms.timing_factor_early",
      "deal_terms.timing_factor_late",
      "deal_terms.floor_multiple",
      "deal_terms.ceiling_multiple",
      "deal_terms.downside_mode",
      "deal_terms.contract_maturity_years",
      "deal_terms.liquidity_trigger_year",
      "deal_terms.minimum_hold_years",
      "deal_terms.platform_fee",
      "deal_terms.servicing_fee_monthly",
      "deal_terms.exit_fee_pct",
      "deal_terms.realtor_representation_mode",
      "deal_terms.realtor_commission_pct",
      "deal_terms.realtor_commission_payment_mode",
    ];

    const REQUIRED_SCENARIO_KEYS = [
      "scenario.annual_appreciation",
      "scenario.closing_cost_pct",
      "scenario.exit_year",
    ];

    const allRequired = [...REQUIRED_DEAL_TERMS_KEYS, ...REQUIRED_SCENARIO_KEYS].sort();

    for (const key of allRequired) {
      expect(defaultKeys, `Missing canonical key: ${key}`).toContain(key);
    }
  });

  it("defaults do not contain unexpected extra keys beyond canonical + DYF optional fields", () => {
    const KNOWN_KEYS = [
      "deal_terms.property_value",
      "deal_terms.upfront_payment",
      "deal_terms.monthly_payment",
      "deal_terms.number_of_payments",
      "deal_terms.payback_window_start_year",
      "deal_terms.payback_window_end_year",
      "deal_terms.timing_factor_early",
      "deal_terms.timing_factor_late",
      "deal_terms.floor_multiple",
      "deal_terms.ceiling_multiple",
      "deal_terms.downside_mode",
      "deal_terms.contract_maturity_years",
      "deal_terms.liquidity_trigger_year",
      "deal_terms.minimum_hold_years",
      "deal_terms.platform_fee",
      "deal_terms.servicing_fee_monthly",
      "deal_terms.exit_fee_pct",
      "deal_terms.realtor_representation_mode",
      "deal_terms.realtor_commission_pct",
      "deal_terms.realtor_commission_payment_mode",
      "scenario.annual_appreciation",
      "scenario.closing_cost_pct",
      "scenario.exit_year",
    ].sort();

    for (const key of defaultKeys) {
      expect(KNOWN_KEYS, `Unexpected key in defaults: ${key}. Add to KNOWN_KEYS if intentional.`).toContain(key);
    }
  });

  it("every field key in TAB_CONFIG exists in FIELD_META", () => {
    const metaKeys = new Set(FIELD_META.map((m) => m.key));
    const tabFieldKeys = TAB_CONFIG.flatMap((tab) =>
      tab.sections.flatMap((sec) => sec.fieldKeys)
    );

    for (const key of tabFieldKeys) {
      expect(metaKeys.has(key), `TAB_CONFIG references "${key}" which is not in FIELD_META`).toBe(true);
    }
  });

  it("every FIELD_META key (except non-UI) corresponds to a canonical draft default key", () => {
    const nonUiSet = new Set<string>(NON_UI_KEYS);
    const optionalSet = new Set<string>(OPTIONAL_COMPUTE_KEYS);
    const dyfKeys = new Set([
      "deal_terms.duration_yield_floor_enabled",
      "deal_terms.duration_yield_floor_start_year",
      "deal_terms.duration_yield_floor_min_multiple",
    ]);

    for (const meta of FIELD_META) {
      if (nonUiSet.has(meta.key)) continue;
      if (optionalSet.has(meta.key)) continue;
      if (dyfKeys.has(meta.key)) continue;
      expect(defaultKeys, `FIELD_META key "${meta.key}" not found in draft defaults`).toContain(meta.key);
    }
  });

  it("FIELD_META count matches expected (27 entries + disclosure)", () => {
    expect(FIELD_META.length).toBe(27);
  });

  it("TAB_CONFIG covers all 5 tabs", () => {
    const tabKeys = TAB_CONFIG.map((t) => t.key).sort();
    expect(tabKeys).toEqual(["assumptions", "fees", "ownership", "payments", "protections"]);
  });
});
