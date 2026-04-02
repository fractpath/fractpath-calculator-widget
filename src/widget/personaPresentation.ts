import type { DealTerms, ScenarioAssumptions, DealResults } from "../compute.js";
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

function projectedFmv(dealTerms: DealTerms, assumptions: ScenarioAssumptions): number {
  return dealTerms.property_value * Math.pow(1 + assumptions.annual_appreciation, assumptions.exit_year);
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
  dealTerms: DealTerms,
  assumptions: ScenarioAssumptions,
  outputs: DealResults,
): PersonaPresentationResult {
  const buyerPayout = outputs.extension_adjusted_buyout_amount;
  const buyerInvested = outputs.actual_buyer_funding_to_date;
  const buyerProfit = buyerPayout - buyerInvested;
  const fmv = projectedFmv(dealTerms, assumptions);
  const buyerMultiple = buyerInvested > 0 ? buyerPayout / buyerInvested : 1;
  const impliedEquitySharePct = fmv > 0 ? outputs.effective_buyer_appreciation_share : 0;

  return {
    hero: {
      label: "Projected Net Return",
      value: buyerProfit,
      valueFormat: "currency",
      subtitle: `Profit at standard buyout (Year ${assumptions.exit_year}).`,
    },
    strip: [
      { label: "Net payout at buyout", value: buyerPayout, valueFormat: "currency" },
      { label: "Total cash paid", value: buyerInvested, valueFormat: "currency" },
      { label: "Projected home value", value: fmv, valueFormat: "currency" },
      { label: "Effective appreciation share", value: impliedEquitySharePct, valueFormat: "percent" },
      { label: "Return multiple", value: buyerMultiple, valueFormat: "multiple" },
    ],
    chartSpec: {
      type: "bar",
      bars: [
        { label: "Total cash paid", value: buyerInvested },
        { label: "Buyout payout", value: buyerPayout },
        { label: "Projected home value", value: fmv },
      ],
    },
    marketingBullets: [
      `~${fmtToken(impliedEquitySharePct, "percent")} effective appreciation share over ${assumptions.exit_year} years — with no financing or interest.`,
      `You contribute ${fmtToken(buyerInvested, "currency")} total. At buyout, payout is ${fmtToken(buyerPayout, "currency")}.`,
      `Projected home value at buyout: ${fmtToken(fmv, "currency")} (base assumptions).`,
      `Assumes ${fmtToken(assumptions.annual_appreciation, "percent")} annual appreciation — Save & Continue free to model different growth and timing.`,
    ],
  };
}

function resolveHomeowner(
  dealTerms: DealTerms,
  assumptions: ScenarioAssumptions,
  outputs: DealResults,
): PersonaPresentationResult {
  const homeownerCashReceived = outputs.actual_buyer_funding_to_date;
  const fmv = projectedFmv(dealTerms, assumptions);

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
      { label: "Projected home value", value: fmv, valueFormat: "currency" },
    ],
    chartSpec: {
      type: "bar",
      bars: [
        { label: "Cash unlocked", value: homeownerCashReceived },
        { label: "Projected home value", value: fmv },
      ],
    },
    marketingBullets: [
      `Unlock ${fmtToken(homeownerCashReceived, "currency")} while continuing to own your home.`,
      `Upfront: ${fmtToken(dealTerms.upfront_payment, "currency")}. Monthly: ${fmtToken(dealTerms.monthly_payment, "currency")} for ${dealTerms.number_of_payments} months.`,
      `Projected home value at buyout: ${fmtToken(fmv, "currency")} (base assumptions).`,
      `Assumes ${fmtToken(assumptions.annual_appreciation, "percent")} annual appreciation — Save & Continue free to model growth, protections, and timing.`,
    ],
  };
}

function resolveRealtor(
  dealTerms: DealTerms,
  assumptions: ScenarioAssumptions,
  outputs: DealResults,
): PersonaPresentationResult {
  const commissionProjected = outputs.realtor_fee_total_projected;
  const buyerPayout = outputs.extension_adjusted_buyout_amount;
  const fmv = projectedFmv(dealTerms, assumptions);
  const remainingOpportunityValue = fmv - buyerPayout;
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
      `Remaining property value at buyout (conditional): ${fmtToken(remainingOpportunityValue > 0 ? remainingOpportunityValue : 0, "currency")}. Save free to model scenarios.`,
    ],
  };
}
