import { useState } from "react";
import type {
  DealTerms,
  ScenarioAssumptions,
  DealResults,
} from "@fractpath/compute";
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
  { key: "protections", label: "Protections" },
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
      label: "Settlement",
      value: formatCurrency(results.isa_settlement),
      sublabel: results.dyf_applied ? "DYF applied" : undefined,
    },
    {
      label: "Investor Profit",
      value: formatCurrency(results.investor_profit),
    },
    {
      label: "Return Multiple",
      value: fmtMultiple(results.investor_multiple),
    },
    {
      label: "Annual IRR",
      value: fmtPct(results.investor_irr_annual),
    },
    {
      label: "Projected FMV",
      value: formatCurrency(results.projected_fmv),
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
      label: "Invested capital (total)",
      value: formatCurrency(results.invested_capital_total),
    },
    { label: "ISA settlement", value: formatCurrency(results.isa_settlement) },
    {
      label: "Investor profit",
      value: formatCurrency(results.investor_profit),
    },
    { label: "Return multiple", value: fmtMultiple(results.investor_multiple) },
    { label: "Annual IRR", value: fmtPct(results.investor_irr_annual) },
    {
      label: "Annual IRR (net)",
      value:
        results.investor_irr_annual_net != null
          ? fmtPct(results.investor_irr_annual_net)
          : "Not computed",
    },
    {
      label: "Timing factor applied",
      value: fmtMultiple(results.timing_factor_applied),
    },
  ];
}

function getOwnershipRows(
  inputs: DealSnapshotViewProps["inputs"],
  results: DealResults,
): DlRow[] {
  return [
    { label: "Vested equity", value: fmtPct(results.vested_equity_percentage) },
    {
      label: "Base equity value",
      value: formatCurrency(results.base_equity_value),
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
      label: "Liquidity trigger",
      value: `${inputs.deal_terms.liquidity_trigger_year} yr`,
    },
  ];
}

function getProtectionRows(
  inputs: DealSnapshotViewProps["inputs"],
  results: DealResults,
): DlRow[] {
  const rows: DlRow[] = [
    {
      label: "Floor multiple",
      value: fmtMultiple(inputs.deal_terms.floor_multiple),
    },
    { label: "Floor amount", value: formatCurrency(results.floor_amount) },
    {
      label: "Ceiling multiple",
      value: fmtMultiple(inputs.deal_terms.ceiling_multiple),
    },
    { label: "Ceiling amount", value: formatCurrency(results.ceiling_amount) },
    {
      label: "Downside mode",
      value:
        inputs.deal_terms.downside_mode === "HARD_FLOOR"
          ? "Hard floor"
          : "No floor",
    },
    {
      label: "Pre-floor/cap value",
      value: formatCurrency(results.isa_pre_floor_cap),
    },
    {
      label: "Gain above capital",
      value: formatCurrency(results.gain_above_capital),
    },
  ];

  if (inputs.deal_terms.duration_yield_floor_enabled) {
    rows.push(
      { label: "DYF enabled", value: "Yes" },
      {
        label: "DYF start year",
        value: `${inputs.deal_terms.duration_yield_floor_start_year ?? "—"} yr`,
      },
      {
        label: "DYF min multiple",
        value:
          inputs.deal_terms.duration_yield_floor_min_multiple != null
            ? fmtMultiple(inputs.deal_terms.duration_yield_floor_min_multiple)
            : "—",
      },
      {
        label: "DYF floor amount",
        value:
          results.dyf_floor_amount != null
            ? formatCurrency(results.dyf_floor_amount)
            : "—",
      },
      { label: "DYF applied", value: results.dyf_applied ? "Yes" : "No" },
    );
  } else {
    rows.push({ label: "DYF enabled", value: "No" });
  }

  return rows;
}

function getFeeRows(
  inputs: DealSnapshotViewProps["inputs"],
  results: DealResults,
): DlRow[] {
  const rows: DlRow[] = [
    {
      label: "Platform fee",
      value: formatCurrency(inputs.deal_terms.platform_fee),
    },
    {
      label: "Servicing fee (monthly)",
      value: formatCurrency(inputs.deal_terms.servicing_fee_monthly),
    },
    { label: "Exit fee", value: fmtPct(inputs.deal_terms.exit_fee_pct) },
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
    label: "Commission payment mode",
    value: inputs.deal_terms.realtor_commission_payment_mode,
  });
  rows.push({
    label: "Realtor fee (upfront)",
    value: formatCurrency(results.realtor_fee_upfront_projected),
  });
  rows.push({
    label: "Realtor fee (installments)",
    value: formatCurrency(results.realtor_fee_installments_projected),
  });
  rows.push({
    label: "Buyer attribution",
    value: formatCurrency(results.buyer_realtor_fee_total_projected),
  });
  rows.push({
    label: "Seller attribution",
    value: formatCurrency(results.seller_realtor_fee_total_projected),
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
      label: "Payback window",
      value: `${inputs.deal_terms.payback_window_start_year}–${inputs.deal_terms.payback_window_end_year} yr`,
    },
    {
      label: "Timing factor (early)",
      value: fmtMultiple(inputs.deal_terms.timing_factor_early),
    },
    {
      label: "Timing factor (late)",
      value: fmtMultiple(inputs.deal_terms.timing_factor_late),
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
