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
      "deal_terms.minimum_hold_years",
      "deal_terms.contract_maturity_years",
      "deal_terms.target_exit_year",
      "deal_terms.target_exit_window_start_year",
      "deal_terms.target_exit_window_end_year",
      "deal_terms.long_stop_year",
      "deal_terms.first_extension_start_year",
      "deal_terms.first_extension_end_year",
      "deal_terms.first_extension_premium_pct",
      "deal_terms.second_extension_start_year",
      "deal_terms.second_extension_end_year",
      "deal_terms.second_extension_premium_pct",
      "deal_terms.partial_buyout_allowed",
      "deal_terms.partial_buyout_min_fraction",
      "deal_terms.partial_buyout_increment_fraction",
      "deal_terms.buyer_purchase_option_enabled",
      "deal_terms.buyer_purchase_notice_days",
      "deal_terms.buyer_purchase_closing_days",
      "deal_terms.setup_fee_pct",
      "deal_terms.setup_fee_floor",
      "deal_terms.setup_fee_cap",
      "deal_terms.servicing_fee_monthly",
      "deal_terms.payment_admin_fee",
      "deal_terms.exit_admin_fee_amount",
      "deal_terms.realtor_representation_mode",
      "deal_terms.realtor_commission_pct",
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

  it("defaults do not contain unexpected extra keys beyond canonical v11 fields", () => {
    const KNOWN_KEYS = [
      "deal_terms.property_value",
      "deal_terms.upfront_payment",
      "deal_terms.monthly_payment",
      "deal_terms.number_of_payments",
      "deal_terms.minimum_hold_years",
      "deal_terms.contract_maturity_years",
      "deal_terms.target_exit_year",
      "deal_terms.target_exit_window_start_year",
      "deal_terms.target_exit_window_end_year",
      "deal_terms.long_stop_year",
      "deal_terms.first_extension_start_year",
      "deal_terms.first_extension_end_year",
      "deal_terms.first_extension_premium_pct",
      "deal_terms.second_extension_start_year",
      "deal_terms.second_extension_end_year",
      "deal_terms.second_extension_premium_pct",
      "deal_terms.partial_buyout_allowed",
      "deal_terms.partial_buyout_min_fraction",
      "deal_terms.partial_buyout_increment_fraction",
      "deal_terms.buyer_purchase_option_enabled",
      "deal_terms.buyer_purchase_notice_days",
      "deal_terms.buyer_purchase_closing_days",
      "deal_terms.setup_fee_pct",
      "deal_terms.setup_fee_floor",
      "deal_terms.setup_fee_cap",
      "deal_terms.servicing_fee_monthly",
      "deal_terms.payment_admin_fee",
      "deal_terms.exit_admin_fee_amount",
      "deal_terms.realtor_representation_mode",
      "deal_terms.realtor_commission_pct",
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

    for (const meta of FIELD_META) {
      if (nonUiSet.has(meta.key)) continue;
      if (optionalSet.has(meta.key)) continue;
      expect(defaultKeys, `FIELD_META key "${meta.key}" not found in draft defaults`).toContain(meta.key);
    }
  });

  it("FIELD_META count matches expected (20 entries including disclosure)", () => {
    expect(FIELD_META.length).toBe(20);
  });

  it("TAB_CONFIG covers all 5 tabs", () => {
    const tabKeys = TAB_CONFIG.map((t) => t.key).sort();
    expect(tabKeys).toEqual(["assumptions", "fees", "ownership", "payments", "protections"]);
  });
});
