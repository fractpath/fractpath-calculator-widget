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
      `Projected net ${payoutWord} of ${payoutLabel} at standard buyout (${whenLabel}).`,
      `Based on a ${homeLabel} property with ${investLabel} upfront, assuming ${pctLabel} annual growth.`,
      `Commission and fees are tracked separately and do not reduce this figure.`,
      `Buyout timing and growth rate affect the final amount.`,
    ];
  }

  return [
    `Projected net ${payoutWord} of ${payoutLabel} based on ${investLabel} ${cashWord} upfront.`,
    `Assumes ${subjectWord} grows at ${pctLabel} per year over ${termYears} years.`,
    `Standard buyout is expected at ${whenLabel}.`,
    `Earlier or later buyout timing may change this result.`,
  ];
}

type TabExplainerInputs = {
  upfrontPayment?: number;
  monthlyPayment?: number;
  numberOfPayments?: number;
  contractMaturityYears?: number;
  minimumHoldYears?: number;
  exitYear?: number;
  setupFeePct?: number;
  servicingFeeMonthly?: number;
  exitAdminFeeAmount?: number;
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
      lines.push(`These amounts make up the total scheduled buyer funding.`);
      return lines;
    }

    case "ownership": {
      const lines: string[] = [];
      if (inputs.contractMaturityYears != null) {
        lines.push(`The contract lasts up to ${inputs.contractMaturityYears} years.`);
      }
      if (inputs.minimumHoldYears != null) {
        lines.push(`Earliest allowed buyout is at year ${inputs.minimumHoldYears}.`);
      }
      if (inputs.exitYear != null) {
        lines.push(`Expected buyout is at year ${inputs.exitYear}.`);
      }
      if (lines.length === 0) {
        lines.push(`This tab controls how long the deal lasts and when buyout can happen.`);
      }
      return lines;
    }

    case "protections": {
      return [
        `Extension premiums apply if the deal extends beyond the target exit window.`,
        `A higher premium compensates FractPath for a longer hold period.`,
        `Partial buyouts let the homeowner buy out FractPath\u2019s stake in stages.`,
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
      if (inputs.setupFeePct != null) {
        lines.push(`Setup fee: ${formatPct(inputs.setupFeePct)} of upfront payment at closing.`);
      }
      if (inputs.servicingFeeMonthly != null) {
        lines.push(`Monthly servicing: ${formatCurrency(inputs.servicingFeeMonthly)}/mo for account management.`);
      }
      if (inputs.exitAdminFeeAmount != null) {
        lines.push(`Exit admin fee: ${formatCurrency(inputs.exitAdminFeeAmount)} flat at settlement.`);
      }
      if (lines.length === 0) {
        lines.push(`Fees include a setup fee at closing, monthly servicing, and an exit admin fee at settlement.`);
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
