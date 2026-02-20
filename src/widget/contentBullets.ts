import type { CalculatorPersona } from "./types.js";
import { formatCurrency, formatPct, formatMonth } from "./format.js";
import type { TabKey } from "./editing/tabConfig.js";

type MarketingBulletInputs = {
  netPayout: number;
  initialBuyAmount: number;
  homeValue: number;
  termYears: number;
  growthRatePct: number;
  settlementMonth: number;
};

export function getMarketingBullets(
  persona: CalculatorPersona,
  inputs: MarketingBulletInputs,
): string[] {
  const { netPayout, initialBuyAmount, homeValue, termYears, growthRatePct, settlementMonth } = inputs;
  const pctLabel = formatPct(growthRatePct / 100);
  const payoutLabel = formatCurrency(netPayout);
  const investLabel = formatCurrency(initialBuyAmount);
  const homeLabel = formatCurrency(homeValue);
  const whenLabel = formatMonth(settlementMonth);

  const cashWord = persona === "homeowner" ? "received" : "paid";
  const payoutWord = persona === "homeowner" ? "payout" : "return";
  const subjectWord = persona === "homeowner" ? "your home" : "the property";

  if (persona === "realtor") {
    return [
      `Projected net ${payoutWord} of ${payoutLabel} at standard settlement (${whenLabel}).`,
      `Based on a ${homeLabel} property with ${investLabel} upfront, assuming ${pctLabel} annual growth.`,
      `Commission and fees are tracked separately and do not reduce this figure.`,
      `Settlement timing and growth rate affect the final amount.`,
    ];
  }

  return [
    `Projected net ${payoutWord} of ${payoutLabel} based on ${investLabel} ${cashWord} upfront.`,
    `Assumes ${subjectWord} grows at ${pctLabel} per year over ${termYears} years.`,
    `Standard settlement is expected at ${whenLabel}.`,
    `Earlier or later settlement timing may change this result.`,
  ];
}

type TabExplainerInputs = {
  upfrontPayment?: number;
  monthlyPayment?: number;
  numberOfPayments?: number;
  contractMaturityYears?: number;
  minimumHoldYears?: number;
  exitYear?: number;
  platformFee?: number;
  servicingFeeMonthly?: number;
  exitFeePct?: number;
};

export function getTabExplainer(
  tab: TabKey,
  persona: CalculatorPersona,
  inputs: TabExplainerInputs,
): string[] {
  const cashAction = persona === "homeowner" ? "receive" : "pay";
  const payoutWord = persona === "homeowner" ? "payout" : "return";

  switch (tab) {
    case "payments": {
      const lines: string[] = [];
      if (inputs.upfrontPayment != null) {
        lines.push(`You ${cashAction} ${formatCurrency(inputs.upfrontPayment)} upfront at closing.`);
      }
      if (inputs.monthlyPayment != null && inputs.numberOfPayments != null && inputs.numberOfPayments > 0) {
        lines.push(
          `Then ${formatCurrency(inputs.monthlyPayment)}/mo for ${inputs.numberOfPayments} months.`,
        );
      }
      if (lines.length === 0) {
        lines.push(`The upfront amount is set at closing. Monthly installments, if any, follow.`);
      }
      lines.push(`These amounts go directly toward the equity position.`);
      return lines;
    }

    case "ownership": {
      const lines: string[] = [];
      if (inputs.contractMaturityYears != null) {
        lines.push(`The contract lasts up to ${inputs.contractMaturityYears} years.`);
      }
      if (inputs.minimumHoldYears != null) {
        lines.push(`Earliest allowed settlement is at year ${inputs.minimumHoldYears}.`);
      }
      if (inputs.exitYear != null) {
        lines.push(`Expected settlement is at year ${inputs.exitYear}.`);
      }
      if (lines.length === 0) {
        lines.push(`This tab controls how long the deal lasts and when settlement can happen.`);
      }
      return lines;
    }

    case "protections": {
      return [
        `A floor sets the minimum ${payoutWord} — the ${payoutWord} won't go below this level.`,
        `A ceiling caps the maximum ${payoutWord}. Both are adjustable in this tab.`,
        `Duration yield floor, if enabled, adds extra protection for longer hold periods.`,
      ];
    }

    case "assumptions": {
      return [
        `Growth rate and exit year are assumptions, not guarantees.`,
        `Changing these values updates the projected results in real time.`,
      ];
    }

    case "fees": {
      const lines: string[] = [];
      if (inputs.platformFee != null) {
        lines.push(`Platform fee: ${formatCurrency(inputs.platformFee)} (one-time at closing).`);
      }
      if (inputs.servicingFeeMonthly != null) {
        lines.push(`Monthly servicing: ${formatCurrency(inputs.servicingFeeMonthly)}/mo for account management.`);
      }
      if (inputs.exitFeePct != null) {
        lines.push(`Exit fee: ${formatPct(inputs.exitFeePct)} of the settlement amount at exit.`);
      }
      if (lines.length === 0) {
        lines.push(`Fees include a platform fee, monthly servicing, and an exit fee at settlement.`);
      }
      if (persona === "realtor") {
        lines.push(`Realtor commission is tracked separately below.`);
      }
      return lines;
    }

    default:
      return [];
  }
}
