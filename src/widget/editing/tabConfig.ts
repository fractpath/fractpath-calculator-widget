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
          "deal_terms.target_exit_year",
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
    label: "Exit Terms",
    sections: [
      {
        label: "Extension premiums",
        fieldKeys: [
          "deal_terms.first_extension_premium_pct",
          "deal_terms.second_extension_premium_pct",
        ],
      },
      {
        label: "Partial buyout",
        fieldKeys: [
          "deal_terms.partial_buyout_allowed",
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
          "deal_terms.setup_fee_pct",
          "deal_terms.servicing_fee_monthly",
          "deal_terms.payment_admin_fee",
          "deal_terms.exit_admin_fee_amount",
        ],
      },
      {
        label: "Realtor commission",
        fieldKeys: [
          "deal_terms.realtor_representation_mode",
          "deal_terms.realtor_commission_pct",
        ],
      },
    ],
  },
];
