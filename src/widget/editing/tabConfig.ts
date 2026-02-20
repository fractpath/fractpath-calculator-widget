import type { FieldKey } from "./fieldMeta.js";

export type TabKey = "payments" | "ownership" | "assumptions" | "protections" | "fees";

export type TabSection = {
  label: string;
  fieldKeys: FieldKey[];
};

export type TabConfig = {
  key: TabKey;
  label: string;
  sections: TabSection[];
};

export const TAB_CONFIG: TabConfig[] = [
  {
    key: "payments",
    label: "Payments",
    sections: [
      {
        label: "Payment terms",
        fieldKeys: [
          "deal_terms.property_value",
          "deal_terms.upfront_payment",
          "deal_terms.monthly_payment",
          "deal_terms.number_of_payments",
        ],
      },
    ],
  },
  {
    key: "ownership",
    label: "Ownership",
    sections: [
      {
        label: "Hold & maturity",
        fieldKeys: [
          "deal_terms.minimum_hold_years",
          "deal_terms.contract_maturity_years",
          "deal_terms.liquidity_trigger_year",
        ],
      },
    ],
  },
  {
    key: "assumptions",
    label: "Assumptions",
    sections: [
      {
        label: "Market & timing",
        fieldKeys: [
          "scenario.annual_appreciation",
          "scenario.exit_year",
          "scenario.closing_cost_pct",
        ],
      },
      {
        label: "Disclosures",
        fieldKeys: ["__disclosure__"],
      },
    ],
  },
  {
    key: "protections",
    label: "Protections",
    sections: [
      {
        label: "Floor & ceiling",
        fieldKeys: [
          "deal_terms.floor_multiple",
          "deal_terms.ceiling_multiple",
          "deal_terms.downside_mode",
        ],
      },
      {
        label: "Timing window",
        fieldKeys: [
          "deal_terms.payback_window_start_year",
          "deal_terms.payback_window_end_year",
          "deal_terms.timing_factor_early",
          "deal_terms.timing_factor_late",
        ],
      },
      {
        label: "Duration Yield Floor",
        fieldKeys: [
          "deal_terms.duration_yield_floor_enabled",
          "deal_terms.duration_yield_floor_start_year",
          "deal_terms.duration_yield_floor_min_multiple",
        ],
      },
    ],
  },
  {
    key: "fees",
    label: "Fees",
    sections: [
      {
        label: "System fees",
        fieldKeys: [
          "deal_terms.platform_fee",
          "deal_terms.servicing_fee_monthly",
          "deal_terms.exit_fee_pct",
        ],
      },
      {
        label: "Realtor commission",
        fieldKeys: [
          "deal_terms.realtor_representation_mode",
          "deal_terms.realtor_commission_pct",
          "deal_terms.realtor_commission_payment_mode",
        ],
      },
    ],
  },
];
