import type { DraftCanonicalInputs, Tier1Preview } from "./types.js";
import { formatCurrency } from "../format.js";

export function deriveTier1Preview(draft: DraftCanonicalInputs): Tier1Preview {
  const { upfront_payment, monthly_payment, number_of_payments } =
    draft.deal_terms;
  const { exit_year } = draft.scenario;

  const exitMonth = Math.floor(exit_year * 12);
  const paymentsMadeByExit = Math.min(number_of_payments, exitMonth);
  const totalInstallments = monthly_payment * paymentsMadeByExit;
  const totalCashPaid = upfront_payment + totalInstallments;

  const installmentsLabel =
    paymentsMadeByExit === 0
      ? "No installments"
      : `${paymentsMadeByExit} payments of ${formatCurrency(monthly_payment)}`;

  return {
    upfrontCash: upfront_payment,
    installmentsLabel,
    totalInstallments,
    totalCashPaid,
  };
}
