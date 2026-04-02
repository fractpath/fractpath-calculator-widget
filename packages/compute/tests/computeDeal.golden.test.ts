import { describe, expect, test } from "vitest";
import { computeDeal, COMPUTE_VERSION, type DealTerms, type ScenarioAssumptions } from "../src/index.js";
import { roundMoney } from "../src/rounding.js";

const GOLDEN_TERMS: DealTerms = {
  property_value: 960_000,
  upfront_payment: 144_000,
  monthly_payment: 1_900,
  number_of_payments: 50,
  minimum_hold_years: 2,
  contract_maturity_years: 30,

  target_exit_year: 5,
  target_exit_window_start_year: 3,
  target_exit_window_end_year: 7,
  long_stop_year: 11,

  first_extension_start_year: 7,
  first_extension_end_year: 9,
  first_extension_premium_pct: 0.06,

  second_extension_start_year: 9,
  second_extension_end_year: 11,
  second_extension_premium_pct: 0.12,

  partial_buyout_allowed: true,
  partial_buyout_min_fraction: 0.25,
  partial_buyout_increment_fraction: 0.25,

  buyer_purchase_option_enabled: true,
  buyer_purchase_notice_days: 30,
  buyer_purchase_closing_days: 45,

  setup_fee_pct: 0.0225,
  setup_fee_floor: 1_750,
  setup_fee_cap: 18_000,
  servicing_fee_monthly: 59,
  payment_admin_fee: 4,
  exit_admin_fee_amount: 4_500,

  realtor_representation_mode: "NONE",
  realtor_commission_pct: 0,
};

function scenario(overrides: Partial<ScenarioAssumptions> = {}): ScenarioAssumptions {
  return {
    annual_appreciation: 0.04,
    closing_cost_pct: 0.02,
    exit_year: 5,
    ...overrides,
  };
}

describe("computeDeal v11 golden contract", () => {
  test("output is JSON-serializable and compute_version is stable", () => {
    const out = computeDeal(GOLDEN_TERMS, scenario());
    expect(out.compute_version).toBe(COMPUTE_VERSION);
    expect(out.compute_version).toBe("11.0.0");
    expect(() => JSON.stringify(out)).not.toThrow();
    const roundTrip = JSON.parse(JSON.stringify(out));
    expect(roundTrip.compute_version).toBe(COMPUTE_VERSION);
  });

  test("exit_month flooring: payments counted as floor(exit_year * 12)", () => {
    const terms: DealTerms = {
      ...GOLDEN_TERMS,
      upfront_payment: 10_000,
      monthly_payment: 1_000,
      number_of_payments: 120,
    };
    const s = scenario({ annual_appreciation: 0.0, exit_year: 1.41 });
    const out = computeDeal(terms, s);

    const expectedExitMonth = Math.floor(1.41 * 12); // 16
    const expectedPaymentsMade = Math.min(terms.number_of_payments, expectedExitMonth);
    const expectedFunding = terms.upfront_payment + terms.monthly_payment * expectedPaymentsMade;

    expect(expectedExitMonth).toBe(16);
    expect(expectedPaymentsMade).toBe(16);
    expect(out.actual_buyer_funding_to_date).toBe(roundMoney(expectedFunding));
  });

  test("total scheduled funding is fixed regardless of exit timing", () => {
    const early = computeDeal(GOLDEN_TERMS, scenario({ exit_year: 2 }));
    const late = computeDeal(GOLDEN_TERMS, scenario({ exit_year: 10 }));
    // total_scheduled always = full upfront + all installments planned
    expect(early.total_scheduled_buyer_funding).toBe(239_000);
    expect(late.total_scheduled_buyer_funding).toBe(239_000);
  });

  test("actual funding differs by exit timing when payments not fully made", () => {
    const earlyOut = computeDeal(GOLDEN_TERMS, scenario({ exit_year: 2 }));
    const fullOut = computeDeal(GOLDEN_TERMS, scenario({ exit_year: 5 }));
    expect(earlyOut.actual_buyer_funding_to_date).toBeLessThan(
      fullOut.actual_buyer_funding_to_date
    );
    // Exit year 2: 24 payments; all 50 payments within year 5 (60 months)
    expect(fullOut.actual_buyer_funding_to_date).toBe(239_000);
    expect(earlyOut.actual_buyer_funding_to_date).toBe(
      roundMoney(144_000 + 1_900 * 24)
    );
  });

  test("window classification across all four representative exit years", () => {
    expect(computeDeal(GOLDEN_TERMS, scenario({ exit_year: 2 })).current_window).toBe("pre_target");
    expect(computeDeal(GOLDEN_TERMS, scenario({ exit_year: 5 })).current_window).toBe("target_exit");
    expect(computeDeal(GOLDEN_TERMS, scenario({ exit_year: 8 })).current_window).toBe("first_extension");
    expect(computeDeal(GOLDEN_TERMS, scenario({ exit_year: 10 })).current_window).toBe("second_extension");
  });

  test("post_long_stop window applies when exit_year > long_stop_year", () => {
    const out = computeDeal(GOLDEN_TERMS, scenario({ exit_year: 15 }));
    expect(out.current_window).toBe("post_long_stop");
    const expected = roundMoney(
      out.base_buyout_amount * (1 + GOLDEN_TERMS.second_extension_premium_pct)
    );
    expect(out.extension_adjusted_buyout_amount).toBe(expected);
  });

  test("partial buyouts scale from extension_adjusted_buyout_amount", () => {
    const out = computeDeal(GOLDEN_TERMS, scenario({ exit_year: 8 }));
    expect(out.partial_buyout_amount_25).toBe(
      roundMoney(out.extension_adjusted_buyout_amount * 0.25)
    );
    expect(out.partial_buyout_amount_50).toBe(
      roundMoney(out.extension_adjusted_buyout_amount * 0.5)
    );
    expect(out.partial_buyout_amount_75).toBe(
      roundMoney(out.extension_adjusted_buyout_amount * 0.75)
    );
  });

  test("discount_purchase_price is contract_value minus participation_value", () => {
    const out = computeDeal(GOLDEN_TERMS, scenario({ exit_year: 5 }));
    expect(out.discount_purchase_price).toBe(
      roundMoney(out.current_contract_value - out.current_participation_value)
    );
  });

  test("setup fee is within configured floor and cap", () => {
    const out = computeDeal(GOLDEN_TERMS, scenario());
    expect(out.fractpath_setup_fee_amount).toBeGreaterThanOrEqual(GOLDEN_TERMS.setup_fee_floor);
    expect(out.fractpath_setup_fee_amount).toBeLessThanOrEqual(GOLDEN_TERMS.setup_fee_cap);
    // 239000 * 0.0225 = 5377.50 — between 1750 and 18000
    expect(out.fractpath_setup_fee_amount).toBe(roundMoney(239_000 * 0.0225));
  });

  test("determinism: 10 repeated runs are identical", () => {
    const results = Array.from({ length: 10 }, () =>
      computeDeal(GOLDEN_TERMS, scenario())
    );
    const first = JSON.stringify(results[0]);
    for (let i = 1; i < results.length; i++) {
      expect(JSON.stringify(results[i])).toBe(first);
    }
  });
});
