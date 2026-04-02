import { useState } from "react";
import type {
  DealTerms,
  ScenarioAssumptions,
  DealResults,
} from "../../compute.js";
import type { CalculatorPersona } from "../types.js";
import { DealKpiStrip, type KpiItem } from "./DealKpiStrip.js";
import { EquityTransferChart } from "./EquityTransferChart.js";
import { formatCurrency } from "../format.js";

export type DealWidgetPermissions = { canEdit?: boolean };

export type DealSnapshotViewProps = {
  persona?: CalculatorPersona;
  permissions?: DealWidgetPermissions;
  status?: string;
  inputs: { deal_terms: DealTerms; scenario: ScenarioAssumptions };
  results: DealResults;
};

type DetailTab =
  | "cash_flow"
  | "ownership"
  | "protections"
  | "fees"
  | "assumptions";

const TABS: { key: DetailTab; label: string }[] = [
  { key: "cash_flow", label: "Cash Flow" },
  { key: "ownership", label: "Ownership" },
  { key: "protections", label: "Exit Terms" },
  { key: "fees", label: "Fees" },
  { key: "assumptions", label: "Assumptions" },
];

function fmtPct(n: number): string {
  return (n * 100).toFixed(2) + "%";
}

function fmtMultiple(n: number): string {
  return n.toFixed(2) + "\u00d7";
}

type DlRow = { label: string; value: string };

function DetailList({ rows }: { rows: DlRow[] }) {
  return (
    <dl style={{ margin: 0 }}>
      {rows.map((r, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "7px 0",
            borderBottom: i < rows.length - 1 ? "1px solid #f3f4f6" : "none",
          }}
        >
          <dt style={{ fontSize: 13, color: "#6b7280" }}>{r.label}</dt>
          <dd
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "#111827",
              margin: 0,
            }}
          >
            {r.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function buildKpis(
  results: DealResults,
  inputs: DealSnapshotViewProps["inputs"],
): KpiItem[] {
  const kpis: KpiItem[] = [
    {
      label: "Buyout Amount",
      value: formatCurrency(results.extension_adjusted_buyout_amount),
      sublabel: `Window: ${results.current_window}`,
    },
    {
      label: "Participation Value",
      value: formatCurrency(results.current_participation_value),
    },
    {
      label: "Funding Completion",
      value: fmtPct(results.funding_completion_factor),
    },
    {
      label: "Appreciation Share",
      value: fmtPct(results.effective_buyer_appreciation_share),
    },
    {
      label: "Total Funding",
      value: formatCurrency(results.actual_buyer_funding_to_date),
      sublabel: `${fmtPct(inputs.scenario.annual_appreciation)} / yr`,
    },
  ];

  const mode = inputs.deal_terms.realtor_representation_mode;
  const commPct = inputs.deal_terms.realtor_commission_pct;

  if (mode !== "NONE") {
    kpis.push({
      label: "Realtor Fee (est.)",
      value: formatCurrency(results.realtor_fee_total_projected),
      sublabel: `${fmtPct(commPct)} \u00b7 ${mode}`,
    });
  } else {
    kpis.push({
      label: "Realtor Fee",
      value: formatCurrency(0),
      sublabel: "No realtor",
    });
  }

  return kpis;
}

function getCashFlowRows(results: DealResults): DlRow[] {
  return [
    {
      label: "Total scheduled funding",
      value: formatCurrency(results.total_scheduled_buyer_funding),
    },
    {
      label: "Actual funding to date",
      value: formatCurrency(results.actual_buyer_funding_to_date),
    },
    {
      label: "Funding completion factor",
      value: fmtPct(results.funding_completion_factor),
    },
    {
      label: "Base buyout amount",
      value: formatCurrency(results.base_buyout_amount),
    },
    {
      label: "Extension-adjusted buyout",
      value: formatCurrency(results.extension_adjusted_buyout_amount),
    },
    {
      label: "Buyer appreciation claim",
      value: formatCurrency(results.buyer_appreciation_claim),
    },
    {
      label: "Current window",
      value: results.current_window,
    },
  ];
}

function getOwnershipRows(
  inputs: DealSnapshotViewProps["inputs"],
  results: DealResults,
): DlRow[] {
  return [
    {
      label: "Scheduled appreciation share",
      value: fmtPct(results.scheduled_buyer_appreciation_share),
    },
    {
      label: "Effective appreciation share",
      value: fmtPct(results.effective_buyer_appreciation_share),
    },
    {
      label: "Current participation value",
      value: formatCurrency(results.current_participation_value),
    },
    {
      label: "Current contract value",
      value: formatCurrency(results.current_contract_value),
    },
    {
      label: "Minimum hold",
      value: `${inputs.deal_terms.minimum_hold_years} yr`,
    },
    {
      label: "Contract maturity",
      value: `${inputs.deal_terms.contract_maturity_years} yr`,
    },
    {
      label: "Target exit year",
      value: `${inputs.deal_terms.target_exit_year} yr`,
    },
  ];
}

function getProtectionRows(
  inputs: DealSnapshotViewProps["inputs"],
  results: DealResults,
): DlRow[] {
  const rows: DlRow[] = [
    {
      label: "First extension premium",
      value: fmtPct(inputs.deal_terms.first_extension_premium_pct),
    },
    {
      label: "Second extension premium",
      value: fmtPct(inputs.deal_terms.second_extension_premium_pct),
    },
    {
      label: "Partial buyout allowed",
      value: inputs.deal_terms.partial_buyout_allowed ? "Yes" : "No",
    },
  ];

  if (inputs.deal_terms.partial_buyout_allowed) {
    rows.push(
      {
        label: "Partial buyout 25%",
        value: results.partial_buyout_amount_25 != null
          ? formatCurrency(results.partial_buyout_amount_25)
          : "—",
      },
      {
        label: "Partial buyout 50%",
        value: results.partial_buyout_amount_50 != null
          ? formatCurrency(results.partial_buyout_amount_50)
          : "—",
      },
      {
        label: "Partial buyout 75%",
        value: results.partial_buyout_amount_75 != null
          ? formatCurrency(results.partial_buyout_amount_75)
          : "—",
      },
    );
  }

  if (results.discount_purchase_price != null) {
    rows.push({
      label: "Discount purchase price",
      value: formatCurrency(results.discount_purchase_price),
    });
  }

  return rows;
}

function getFeeRows(
  inputs: DealSnapshotViewProps["inputs"],
  results: DealResults,
): DlRow[] {
  const rows: DlRow[] = [
    {
      label: "Setup fee (%)",
      value: fmtPct(inputs.deal_terms.setup_fee_pct),
    },
    {
      label: "Setup fee (amount)",
      value: formatCurrency(results.fractpath_setup_fee_amount),
    },
    {
      label: "Servicing fee (monthly)",
      value: formatCurrency(inputs.deal_terms.servicing_fee_monthly),
    },
    {
      label: "Payment admin fee",
      value: formatCurrency(inputs.deal_terms.payment_admin_fee),
    },
    {
      label: "Exit admin fee",
      value: formatCurrency(inputs.deal_terms.exit_admin_fee_amount),
    },
    {
      label: "FractPath revenue to date",
      value: formatCurrency(results.fractpath_revenue_to_date),
    },
  ];

  const mode = inputs.deal_terms.realtor_representation_mode;

  rows.push({
    label: "Realtor representation",
    value: mode === "NONE" ? "None" : mode,
  });
  rows.push({
    label: "Realtor commission",
    value: fmtPct(inputs.deal_terms.realtor_commission_pct),
  });
  rows.push({
    label: "Realtor fee (total projected)",
    value: formatCurrency(results.realtor_fee_total_projected),
  });

  return rows;
}

function getAssumptionRows(inputs: DealSnapshotViewProps["inputs"]): DlRow[] {
  const rows: DlRow[] = [
    {
      label: "Annual appreciation",
      value: fmtPct(inputs.scenario.annual_appreciation),
    },
    { label: "Exit year", value: `${inputs.scenario.exit_year} yr` },
    { label: "Closing costs", value: fmtPct(inputs.scenario.closing_cost_pct) },
    {
      label: "Property value",
      value: formatCurrency(inputs.deal_terms.property_value),
    },
    {
      label: "Upfront payment",
      value: formatCurrency(inputs.deal_terms.upfront_payment),
    },
    {
      label: "Monthly payment",
      value: formatCurrency(inputs.deal_terms.monthly_payment),
    },
    {
      label: "Number of payments",
      value: `${inputs.deal_terms.number_of_payments}`,
    },
    {
      label: "Target exit window",
      value: `${inputs.deal_terms.target_exit_window_start_year}–${inputs.deal_terms.target_exit_window_end_year} yr`,
    },
    {
      label: "Long-stop year",
      value: `${inputs.deal_terms.long_stop_year} yr`,
    },
  ];

  if (inputs.scenario.fmv_override != null) {
    rows.push({
      label: "FMV override",
      value: formatCurrency(inputs.scenario.fmv_override),
    });
  }

  return rows;
}

function getTabContent(
  tab: DetailTab,
  inputs: DealSnapshotViewProps["inputs"],
  results: DealResults,
): DlRow[] {
  switch (tab) {
    case "cash_flow":
      return getCashFlowRows(results);
    case "ownership":
      return getOwnershipRows(inputs, results);
    case "protections":
      return getProtectionRows(inputs, results);
    case "fees":
      return getFeeRows(inputs, results);
    case "assumptions":
      return getAssumptionRows(inputs);
  }
}

export function DealSnapshotView({
  persona,
  status,
  inputs,
  results,
}: DealSnapshotViewProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>("cash_flow");

  const kpis = buildKpis(results, inputs);
  const tabRows = getTabContent(activeTab, inputs, results);

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        fontFamily: "system-ui, sans-serif",
        overflow: "hidden",
      }}
      data-testid="deal-snapshot-view"
      data-persona={persona}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 18px",
          borderBottom: "1px solid #e5e7eb",
          background: "#fafafa",
        }}
      >
        <h2 style={{ margin: 0, fontSize: 17, color: "#111827" }}>
          Deal Snapshot
        </h2>
        {status && (
          <span style={{ fontSize: 11, color: "#9ca3af" }}>{status}</span>
        )}
      </div>

      <div style={{ padding: "14px 18px" }}>
        <DealKpiStrip items={kpis} />
      </div>

      <div style={{ padding: "0 18px 14px" }}>
        <EquityTransferChart results={results} />
      </div>

      <div style={{ borderTop: "1px solid #e5e7eb" }}>
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #e5e7eb",
            padding: "0 18px",
            overflowX: "auto",
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "9px 14px",
                border: "none",
                borderBottom:
                  activeTab === tab.key
                    ? "2px solid #111827"
                    : "2px solid transparent",
                background: "none",
                fontSize: 12,
                fontWeight: activeTab === tab.key ? 600 : 400,
                color: activeTab === tab.key ? "#111827" : "#6b7280",
                cursor: "pointer",
                fontFamily: "system-ui, sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ padding: "14px 18px" }}>
          <DetailList rows={tabRows} />
        </div>
      </div>

      <div
        style={{
          padding: "8px 18px",
          borderTop: "1px solid #f3f4f6",
          background: "#fafafa",
          fontSize: 10,
          color: "#9ca3af",
          textAlign: "center",
        }}
      >
        Compute v{results.compute_version} · Read-only snapshot
      </div>
    </div>
  );
}
