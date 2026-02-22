import type { DealTerms, ScenarioAssumptions, DealResults } from "../packages/compute/src/index.js";
import type { CalculatorPersona } from "./types.js";
import { formatCurrency, formatPct } from "./format.js";

export type ValueFormat = "currency" | "percent" | "multiple" | "text" | "months";

export type HeroSpec = {
  label: string;
  value: number;
  valueFormat: ValueFormat;
  subtitle: string;
};

export type ChipSpec = {
  label: string;
  value: number | string;
  valueFormat: ValueFormat;
};

export type BarSpec = {
  label: string;
  value: number;
};

export type ChartSpec = {
  type: "bar";
  bars: BarSpec[];
};

export type PersonaPresentationResult = {
  hero: HeroSpec;
  strip: ChipSpec[];
  chartSpec: ChartSpec;
  marketingBullets: string[];
};

function fmtToken(value: number, fmt: ValueFormat): string {
  switch (fmt) {
    case "currency":
      return formatCurrency(value);
    case "percent":
      return formatPct(value);
    case "multiple":
      return `${value.toFixed(2)}×`;
    case "months":
      return `${value}`;
    case "text":
      return String(value);
  }
}

export function resolvePersonaPresentation(
  persona: CalculatorPersona,
  dealTerms: DealTerms,
  assumptions: ScenarioAssumptions,
  outputs: DealResults,
): PersonaPresentationResult {
  switch (persona) {
    case "homeowner":
      return resolveHomeowner(dealTerms, assumptions, outputs);
    case "realtor":
      return resolveRealtor(dealTerms, assumptions, outputs);
    case "buyer":
    case "investor":
    case "ops":
    default:
      return resolveBuyer(dealTerms, assumptions, outputs);
  }
}

function resolveBuyer(
  _dealTerms: DealTerms,
  assumptions: ScenarioAssumptions,
  outputs: DealResults,
): PersonaPresentationResult {
  const buyerProfit = outputs.investor_profit;
  const buyerSettlement = outputs.isa_settlement;
  const buyerTotalInvested = outputs.invested_capital_total;
  const projectedFmv = outputs.projected_fmv;
  const buyerMultiple = outputs.investor_multiple;
  const impliedEquitySharePct =
    projectedFmv > 0 ? buyerSettlement / projectedFmv : 0;

  return {
    hero: {
      label: "Projected Net Return",
      value: buyerProfit,
      valueFormat: "currency",
      subtitle: `Profit at standard settlement (Year ${assumptions.exit_year}).`,
    },
    strip: [
      { label: "Net payout at settlement", value: buyerSettlement, valueFormat: "currency" },
      { label: "Total cash paid", value: buyerTotalInvested, valueFormat: "currency" },
      { label: "Projected home value", value: projectedFmv, valueFormat: "currency" },
      { label: "Implied equity share", value: impliedEquitySharePct, valueFormat: "percent" },
      { label: "Return multiple", value: buyerMultiple, valueFormat: "multiple" },
    ],
    chartSpec: {
      type: "bar",
      bars: [
        { label: "Total cash paid", value: buyerTotalInvested },
        { label: "Settlement payout", value: buyerSettlement },
        { label: "Projected home value", value: projectedFmv },
      ],
    },
    marketingBullets: [
      `~${fmtToken(impliedEquitySharePct, "percent")} equity built over ${assumptions.exit_year} years — with no financing or interest.`,
      `You contribute ${fmtToken(buyerTotalInvested, "currency")} total. At settlement, payout is ${fmtToken(buyerSettlement, "currency")}.`,
      `Projected home value at settlement: ${fmtToken(projectedFmv, "currency")} (base assumptions).`,
      `Assumes ${fmtToken(assumptions.annual_appreciation, "percent")} annual appreciation — Save & Continue free to model different growth and timing.`,
    ],
  };
}

function resolveHomeowner(
  dealTerms: DealTerms,
  assumptions: ScenarioAssumptions,
  outputs: DealResults,
): PersonaPresentationResult {
  const homeownerCashReceived = outputs.invested_capital_total;
  const projectedFmv = outputs.projected_fmv;

  return {
    hero: {
      label: "Lifetime Cash Unlocked",
      value: homeownerCashReceived,
      valueFormat: "currency",
      subtitle: "Cash received over the deal term (upfront + installments).",
    },
    strip: [
      { label: "Upfront cash received", value: dealTerms.upfront_payment, valueFormat: "currency" },
      { label: "Monthly cash received", value: dealTerms.monthly_payment, valueFormat: "currency" },
      { label: "Installment months", value: dealTerms.number_of_payments, valueFormat: "months" },
      { label: "Total cash unlocked", value: homeownerCashReceived, valueFormat: "currency" },
      { label: "Projected home value", value: projectedFmv, valueFormat: "currency" },
    ],
    chartSpec: {
      type: "bar",
      bars: [
        { label: "Cash unlocked", value: homeownerCashReceived },
        { label: "Projected home value", value: projectedFmv },
      ],
    },
    marketingBullets: [
      `Unlock ${fmtToken(homeownerCashReceived, "currency")} while continuing to own your home.`,
      `Upfront: ${fmtToken(dealTerms.upfront_payment, "currency")}. Monthly: ${fmtToken(dealTerms.monthly_payment, "currency")} for ${dealTerms.number_of_payments} months.`,
      `Projected home value at settlement: ${fmtToken(projectedFmv, "currency")} (base assumptions).`,
      `Assumes ${fmtToken(assumptions.annual_appreciation, "percent")} annual appreciation — Save & Continue free to model growth, protections, and timing.`,
    ],
  };
}

function resolveRealtor(
  dealTerms: DealTerms,
  _assumptions: ScenarioAssumptions,
  outputs: DealResults,
): PersonaPresentationResult {
  const commissionProjected = outputs.realtor_fee_total_projected;
  const buyerSettlement = outputs.isa_settlement;
  const projectedFmv = outputs.projected_fmv;
  const remainingOpportunityValue = projectedFmv - buyerSettlement;
  const commissionPctDisplay = dealTerms.realtor_commission_pct * 100;

  return {
    hero: {
      label: "Projected Commission (Standard)",
      value: commissionProjected,
      valueFormat: "currency",
      subtitle: `Based on ${commissionPctDisplay.toFixed(1)}% as ${dealTerms.realtor_representation_mode} representation.`,
    },
    strip: [
      { label: "Commission rate", value: `${commissionPctDisplay.toFixed(1)}%`, valueFormat: "text" },
      { label: "Representation", value: dealTerms.realtor_representation_mode, valueFormat: "text" },
      { label: "Commission from this deal", value: commissionProjected, valueFormat: "currency" },
      {
        label: "Remaining opportunity",
        value: remainingOpportunityValue > 0 ? remainingOpportunityValue : 0,
        valueFormat: "currency",
      },
    ],
    chartSpec: {
      type: "bar",
      bars: [
        { label: "Commission on this deal", value: commissionProjected },
        { label: "Remaining opportunity", value: remainingOpportunityValue > 0 ? remainingOpportunityValue : 0 },
      ],
    },
    marketingBullets: [
      `Projected commission on this deal: ${fmtToken(commissionProjected, "currency")} (standard timing).`,
      `Commission rate: ${commissionPctDisplay.toFixed(1)}% as ${dealTerms.realtor_representation_mode} representation.`,
      `Capture buyers and sellers earlier — without requiring an immediate full sale or full purchase.`,
      `Remaining property value at settlement (conditional): ${fmtToken(remainingOpportunityValue > 0 ? remainingOpportunityValue : 0, "currency")}. Save free to model scenarios.`,
    ],
  };
}
