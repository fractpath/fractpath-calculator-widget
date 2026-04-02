import { describe, it, expect } from "vitest";
import { computeDeal } from "../src/computeDeal.js";
import { COMPUTE_VERSION } from "../src/version.js";
import { roundMoney } from "../src/rounding.js";
import type { DealTerms, ScenarioAssumptions } from "../src/types.js";

const BASE_TERMS: DealTerms = {
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

const BASE_ASSUMPTIONS: ScenarioAssumptions = {
  annual_appreciation: 0.04,
  closing_cost_pct: 0.02,
  exit_year: 5,
};

describe("computeDeal v11", () => {
  describe("total scheduled buyer funding", () => {
    it("equals upfront + monthly * number_of_payments", () => {
      const result = computeDeal(BASE_TERMS, BASE_ASSUMPTIONS);
      const expected = roundMoney(
        BASE_TERMS.upfront_payment +
          BASE_TERMS.monthly_payment * BASE_TERMS.number_of_payments
      );
      expect(result.total_scheduled_buyer_funding).toBe(expected);
      expect(result.total_scheduled_buyer_funding).toBe(239_000);
    });
  });

  describe("actual buyer funding at partial completion (exit year 2)", () => {
    const result = computeDeal(BASE_TERMS, { ...BASE_ASSUMPTIONS, exit_year: 2 });

    it("counts only payments made by exit month", () => {
      const exitMonth = Math.floor(2 * 12);
      const paymentsMade = Math.min(BASE_TERMS.number_of_payments, exitMonth);
      const expected = roundMoney(
        BASE_TERMS.upfront_payment + BASE_TERMS.monthly_payment * paymentsMade
      );
      expect(result.actual_buyer_funding_to_date).toBe(expected);
      expect(paymentsMade).toBe(24);
      expect(result.actual_buyer_funding_to_date).toBe(
        roundMoney(144_000 + 1_900 * 24)
      );
    });

    it("is less than total scheduled funding when payments not complete", () => {
      expect(result.actual_buyer_funding_to_date).toBeLessThan(
        result.total_scheduled_buyer_funding
      );
    });
  });

  describe("funding completion factor", () => {
    it("is 1.0 when all payments made by exit", () => {
      const result = computeDeal(BASE_TERMS, { ...BASE_ASSUMPTIONS, exit_year: 5 });
      expect(result.funding_completion_factor).toBe(1.0);
    });

    it("is less than 1.0 on early exit (year 2)", () => {
      const result = computeDeal(BASE_TERMS, { ...BASE_ASSUMPTIONS, exit_year: 2 });
      const expected =
        result.actual_buyer_funding_to_date /
        result.total_scheduled_buyer_funding;
      expect(result.funding_completion_factor).toBeCloseTo(expected, 10);
      expect(result.funding_completion_factor).toBeLessThan(1);
    });

    it("is zero when total_scheduled_buyer_funding is zero", () => {
      const terms: DealTerms = {
        ...BASE_TERMS,
        upfront_payment: 0,
        monthly_payment: 0,
      };
      const result = computeDeal(terms, BASE_ASSUMPTIONS);
      expect(result.funding_completion_factor).toBe(0);
    });
  });

  describe("scheduled and effective appreciation share", () => {
    it("scheduled_buyer_appreciation_share = total_funding / property_value", () => {
      const result = computeDeal(BASE_TERMS, BASE_ASSUMPTIONS);
      const expected =
        result.total_scheduled_buyer_funding / BASE_TERMS.property_value;
      expect(result.scheduled_buyer_appreciation_share).toBeCloseTo(expected, 10);
    });

    it("effective_buyer_appreciation_share = scheduled * factor", () => {
      const result = computeDeal(BASE_TERMS, { ...BASE_ASSUMPTIONS, exit_year: 2 });
      const expected =
        result.scheduled_buyer_appreciation_share * result.funding_completion_factor;
      expect(result.effective_buyer_appreciation_share).toBeCloseTo(expected, 10);
    });

    it("at full completion, effective equals scheduled share", () => {
      const result = computeDeal(BASE_TERMS, BASE_ASSUMPTIONS);
      expect(result.effective_buyer_appreciation_share).toBeCloseTo(
        result.scheduled_buyer_appreciation_share,
        10
      );
    });
  });

  describe("appreciation claim scaling on early exit", () => {
    it("claim is lower on early exit than full-term exit", () => {
      const earlyResult = computeDeal(BASE_TERMS, {
        ...BASE_ASSUMPTIONS,
        exit_year: 2,
      });
      const fullResult = computeDeal(BASE_TERMS, {
        ...BASE_ASSUMPTIONS,
        exit_year: 5,
      });
      expect(earlyResult.buyer_appreciation_claim).toBeLessThan(
        fullResult.buyer_appreciation_claim
      );
    });

    it("claim equals appreciation_amount * effective_share", () => {
      const result = computeDeal(BASE_TERMS, { ...BASE_ASSUMPTIONS, exit_year: 2 });
      const appreciationAmount = Math.max(
        0,
        result.current_contract_value - BASE_TERMS.property_value
      );
      const expected = roundMoney(
        appreciationAmount * result.effective_buyer_appreciation_share
      );
      expect(result.buyer_appreciation_claim).toBe(expected);
    });

    it("claim is zero when property did not appreciate", () => {
      const result = computeDeal(BASE_TERMS, {
        ...BASE_ASSUMPTIONS,
        annual_appreciation: 0,
        exit_year: 2,
      });
      expect(result.buyer_appreciation_claim).toBe(0);
    });
  });

  describe("extension premium — first extension (exit year 8)", () => {
    const result = computeDeal(BASE_TERMS, { ...BASE_ASSUMPTIONS, exit_year: 8 });

    it("current_window is first_extension", () => {
      expect(result.current_window).toBe("first_extension");
    });

    it("extension_adjusted_buyout_amount = base_buyout * (1 + 0.06)", () => {
      const expected = roundMoney(
        result.base_buyout_amount * (1 + BASE_TERMS.first_extension_premium_pct)
      );
      expect(result.extension_adjusted_buyout_amount).toBe(expected);
    });

    it("extension_adjusted_buyout_amount exceeds base_buyout_amount", () => {
      expect(result.extension_adjusted_buyout_amount).toBeGreaterThan(
        result.base_buyout_amount
      );
    });
  });

  describe("extension premium — second extension (exit year 10)", () => {
    const result = computeDeal(BASE_TERMS, { ...BASE_ASSUMPTIONS, exit_year: 10 });

    it("current_window is second_extension", () => {
      expect(result.current_window).toBe("second_extension");
    });

    it("extension_adjusted_buyout_amount = base_buyout * (1 + 0.12)", () => {
      const expected = roundMoney(
        result.base_buyout_amount * (1 + BASE_TERMS.second_extension_premium_pct)
      );
      expect(result.extension_adjusted_buyout_amount).toBe(expected);
    });

    it("second extension premium exceeds first extension premium", () => {
      const firstExt = computeDeal(BASE_TERMS, { ...BASE_ASSUMPTIONS, exit_year: 8 });
      expect(result.extension_adjusted_buyout_amount).toBeGreaterThan(
        firstExt.extension_adjusted_buyout_amount
      );
    });
  });

  describe("no premium in target exit and pre-target windows", () => {
    it("target_exit: extension_adjusted equals base_buyout", () => {
      const result = computeDeal(BASE_TERMS, { ...BASE_ASSUMPTIONS, exit_year: 5 });
      expect(result.current_window).toBe("target_exit");
      expect(result.extension_adjusted_buyout_amount).toBe(result.base_buyout_amount);
    });

    it("pre_target: extension_adjusted equals base_buyout", () => {
      const result = computeDeal(BASE_TERMS, { ...BASE_ASSUMPTIONS, exit_year: 1 });
      expect(result.current_window).toBe("pre_target");
      expect(result.extension_adjusted_buyout_amount).toBe(result.base_buyout_amount);
    });

    it("post_long_stop: uses second extension premium", () => {
      const result = computeDeal(BASE_TERMS, { ...BASE_ASSUMPTIONS, exit_year: 15 });
      expect(result.current_window).toBe("post_long_stop");
      const expected = roundMoney(
        result.base_buyout_amount * (1 + BASE_TERMS.second_extension_premium_pct)
      );
      expect(result.extension_adjusted_buyout_amount).toBe(expected);
    });
  });

  describe("discount purchase price when enabled", () => {
    it("discount_purchase_price is current_contract_value minus current_participation_value", () => {
      const result = computeDeal(BASE_TERMS, BASE_ASSUMPTIONS);
      const expected = roundMoney(
        result.current_contract_value - result.current_participation_value
      );
      expect(result.discount_purchase_price).toBe(expected);
    });

    it("discount_purchase_price is non-null when buyer_purchase_option_enabled", () => {
      const result = computeDeal(BASE_TERMS, BASE_ASSUMPTIONS);
      expect(BASE_TERMS.buyer_purchase_option_enabled).toBe(true);
      expect(result.discount_purchase_price).not.toBeNull();
    });
  });

  describe("null discount purchase price when disabled", () => {
    it("discount_purchase_price is null when buyer_purchase_option_enabled is false", () => {
      const terms: DealTerms = {
        ...BASE_TERMS,
        buyer_purchase_option_enabled: false,
      };
      const result = computeDeal(terms, BASE_ASSUMPTIONS);
      expect(result.discount_purchase_price).toBeNull();
    });
  });

  describe("partial buyout amounts when enabled", () => {
    const result = computeDeal(BASE_TERMS, BASE_ASSUMPTIONS);

    it("partial_buyout_amount_25 is 25% of extension_adjusted_buyout_amount", () => {
      const expected = roundMoney(result.extension_adjusted_buyout_amount * 0.25);
      expect(result.partial_buyout_amount_25).toBe(expected);
    });

    it("partial_buyout_amount_50 is 50% of extension_adjusted_buyout_amount", () => {
      const expected = roundMoney(result.extension_adjusted_buyout_amount * 0.50);
      expect(result.partial_buyout_amount_50).toBe(expected);
    });

    it("partial_buyout_amount_75 is 75% of extension_adjusted_buyout_amount", () => {
      const expected = roundMoney(result.extension_adjusted_buyout_amount * 0.75);
      expect(result.partial_buyout_amount_75).toBe(expected);
    });

    it("all partial buyout amounts are non-null", () => {
      expect(result.partial_buyout_amount_25).not.toBeNull();
      expect(result.partial_buyout_amount_50).not.toBeNull();
      expect(result.partial_buyout_amount_75).not.toBeNull();
    });
  });

  describe("null partial buyout amounts when disabled", () => {
    it("all partial buyouts are null when partial_buyout_allowed is false", () => {
      const terms: DealTerms = { ...BASE_TERMS, partial_buyout_allowed: false };
      const result = computeDeal(terms, BASE_ASSUMPTIONS);
      expect(result.partial_buyout_amount_25).toBeNull();
      expect(result.partial_buyout_amount_50).toBeNull();
      expect(result.partial_buyout_amount_75).toBeNull();
    });
  });

  describe("fmv_override precedence", () => {
    it("uses fmv_override when provided and > 0 instead of computed value", () => {
      const assumptions: ScenarioAssumptions = {
        ...BASE_ASSUMPTIONS,
        fmv_override: 1_500_000,
      };
      const result = computeDeal(BASE_TERMS, assumptions);
      expect(result.current_contract_value).toBe(1_500_000);
    });

    it("uses computed appreciation when fmv_override is not provided", () => {
      const result = computeDeal(BASE_TERMS, BASE_ASSUMPTIONS);
      const expected = roundMoney(
        BASE_TERMS.property_value *
          Math.pow(1 + BASE_ASSUMPTIONS.annual_appreciation, BASE_ASSUMPTIONS.exit_year)
      );
      expect(result.current_contract_value).toBe(expected);
    });

    it("uses computed appreciation when fmv_override is 0", () => {
      const assumptions: ScenarioAssumptions = {
        ...BASE_ASSUMPTIONS,
        fmv_override: 0,
      };
      const resultOverride = computeDeal(BASE_TERMS, assumptions);
      const resultNormal = computeDeal(BASE_TERMS, BASE_ASSUMPTIONS);
      expect(resultOverride.current_contract_value).toBe(
        resultNormal.current_contract_value
      );
    });
  });

  describe("compute_version", () => {
    it("compute_version is present in output", () => {
      const result = computeDeal(BASE_TERMS, BASE_ASSUMPTIONS);
      expect(result.compute_version).toBeDefined();
      expect(typeof result.compute_version).toBe("string");
      expect(result.compute_version.length).toBeGreaterThan(0);
    });

    it("compute_version matches COMPUTE_VERSION constant", () => {
      const result = computeDeal(BASE_TERMS, BASE_ASSUMPTIONS);
      expect(result.compute_version).toBe(COMPUTE_VERSION);
      expect(result.compute_version).toBe("11.0.0");
    });
  });

  describe("deterministic repeated runs", () => {
    it("same inputs produce identical output across 10 runs", () => {
      const results = Array.from({ length: 10 }, () =>
        computeDeal(BASE_TERMS, BASE_ASSUMPTIONS)
      );
      const first = JSON.stringify(results[0]);
      for (let i = 1; i < results.length; i++) {
        expect(JSON.stringify(results[i])).toBe(first);
      }
    });

    it("different exit years produce different outputs", () => {
      const r5 = computeDeal(BASE_TERMS, { ...BASE_ASSUMPTIONS, exit_year: 5 });
      const r8 = computeDeal(BASE_TERMS, { ...BASE_ASSUMPTIONS, exit_year: 8 });
      expect(r5.current_contract_value).not.toBe(r8.current_contract_value);
      expect(r5.current_window).not.toBe(r8.current_window);
    });

    it("output is JSON-serializable", () => {
      const result = computeDeal(BASE_TERMS, BASE_ASSUMPTIONS);
      expect(() => JSON.stringify(result)).not.toThrow();
      const roundTrip = JSON.parse(JSON.stringify(result));
      expect(roundTrip.compute_version).toBe(COMPUTE_VERSION);
    });
  });

  describe("all required output fields are present", () => {
    it("result has all DealResults fields", () => {
      const result = computeDeal(BASE_TERMS, BASE_ASSUMPTIONS);
      const requiredFields: (keyof typeof result)[] = [
        "total_scheduled_buyer_funding",
        "actual_buyer_funding_to_date",
        "funding_completion_factor",
        "scheduled_buyer_appreciation_share",
        "effective_buyer_appreciation_share",
        "buyer_base_capital_component",
        "buyer_appreciation_claim",
        "current_contract_value",
        "current_participation_value",
        "base_buyout_amount",
        "extension_adjusted_buyout_amount",
        "partial_buyout_amount_25",
        "partial_buyout_amount_50",
        "partial_buyout_amount_75",
        "discount_purchase_price",
        "current_window",
        "fractpath_setup_fee_amount",
        "fractpath_revenue_to_date",
        "realtor_fee_total_projected",
        "compute_version",
      ];
      for (const field of requiredFields) {
        expect(result).toHaveProperty(field);
      }
    });
  });

  describe("fractpath fee calculations", () => {
    it("setup fee is clamped between floor and cap", () => {
      const result = computeDeal(BASE_TERMS, BASE_ASSUMPTIONS);
      expect(result.fractpath_setup_fee_amount).toBeGreaterThanOrEqual(
        BASE_TERMS.setup_fee_floor
      );
      expect(result.fractpath_setup_fee_amount).toBeLessThanOrEqual(
        BASE_TERMS.setup_fee_cap
      );
    });

    it("setup fee formula: min(max(total_funding * pct, floor), cap)", () => {
      const result = computeDeal(BASE_TERMS, BASE_ASSUMPTIONS);
      const expected = roundMoney(
        Math.min(
          Math.max(
            result.total_scheduled_buyer_funding * BASE_TERMS.setup_fee_pct,
            BASE_TERMS.setup_fee_floor
          ),
          BASE_TERMS.setup_fee_cap
        )
      );
      expect(result.fractpath_setup_fee_amount).toBe(expected);
    });

    it("revenue_to_date includes setup fee + servicing + payment admin + exit admin", () => {
      const result = computeDeal(BASE_TERMS, BASE_ASSUMPTIONS);
      const exitMonth = Math.floor(BASE_ASSUMPTIONS.exit_year * 12);
      const paymentsMade = Math.min(BASE_TERMS.number_of_payments, exitMonth);
      const expected = roundMoney(
        result.fractpath_setup_fee_amount +
          BASE_TERMS.servicing_fee_monthly * exitMonth +
          BASE_TERMS.payment_admin_fee * paymentsMade +
          BASE_TERMS.exit_admin_fee_amount
      );
      expect(result.fractpath_revenue_to_date).toBe(expected);
    });
  });

  describe("realtor fee", () => {
    it("is 0 when mode is NONE", () => {
      const result = computeDeal(BASE_TERMS, BASE_ASSUMPTIONS);
      expect(BASE_TERMS.realtor_representation_mode).toBe("NONE");
      expect(result.realtor_fee_total_projected).toBe(0);
    });

    it("is 0 when commission_pct is 0", () => {
      const terms: DealTerms = {
        ...BASE_TERMS,
        realtor_representation_mode: "BUYER",
        realtor_commission_pct: 0,
      };
      const result = computeDeal(terms, BASE_ASSUMPTIONS);
      expect(result.realtor_fee_total_projected).toBe(0);
    });

    it("is positive when mode is BUYER and pct > 0", () => {
      const terms: DealTerms = {
        ...BASE_TERMS,
        realtor_representation_mode: "BUYER",
        realtor_commission_pct: 0.03,
      };
      const result = computeDeal(terms, BASE_ASSUMPTIONS);
      expect(result.realtor_fee_total_projected).toBeGreaterThan(0);
    });

    it("fee = (upfront + monthly * paymentsMade) * pct", () => {
      const pct = 0.03;
      const terms: DealTerms = {
        ...BASE_TERMS,
        realtor_representation_mode: "SELLER",
        realtor_commission_pct: pct,
      };
      const result = computeDeal(terms, { ...BASE_ASSUMPTIONS, exit_year: 2 });
      const exitMonth = Math.floor(2 * 12);
      const paymentsMade = Math.min(terms.number_of_payments, exitMonth);
      const expected = roundMoney(
        (terms.upfront_payment + terms.monthly_payment * paymentsMade) * pct
      );
      expect(result.realtor_fee_total_projected).toBe(expected);
    });
  });

  describe("base_buyout_amount", () => {
    it("equals current_participation_value + exit_admin_fee_amount", () => {
      const result = computeDeal(BASE_TERMS, BASE_ASSUMPTIONS);
      const expected = roundMoney(
        result.current_participation_value + BASE_TERMS.exit_admin_fee_amount
      );
      expect(result.base_buyout_amount).toBe(expected);
    });
  });

  describe("monetary rounding", () => {
    it("all money fields are rounded to 2 decimal places", () => {
      const result = computeDeal(BASE_TERMS, BASE_ASSUMPTIONS);
      const moneyFields = [
        "total_scheduled_buyer_funding",
        "actual_buyer_funding_to_date",
        "buyer_base_capital_component",
        "buyer_appreciation_claim",
        "current_contract_value",
        "current_participation_value",
        "base_buyout_amount",
        "extension_adjusted_buyout_amount",
        "fractpath_setup_fee_amount",
        "fractpath_revenue_to_date",
        "realtor_fee_total_projected",
      ] as const;

      for (const field of moneyFields) {
        const val = result[field] as number;
        expect(val).toBe(Math.round(val * 100) / 100);
      }
    });
  });
});
