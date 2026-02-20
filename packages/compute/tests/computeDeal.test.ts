import { describe, it, expect } from "vitest";
import { computeDeal } from "../src/computeDeal.js";
import { COMPUTE_VERSION } from "../src/version.js";
import { roundMoney } from "../src/rounding.js";
import type { DealTerms, ScenarioAssumptions } from "../src/types.js";

const DEFAULT_TERMS: DealTerms = {
  property_value: 600_000,
  upfront_payment: 60_000,
  monthly_payment: 2_000,
  number_of_payments: 72,
  payback_window_start_year: 4,
  payback_window_end_year: 8,
  timing_factor_early: 0.9,
  timing_factor_late: 1.2,
  floor_multiple: 1.03,
  ceiling_multiple: 3.25,
  downside_mode: "HARD_FLOOR",
  contract_maturity_years: 30,
  liquidity_trigger_year: 13,
  minimum_hold_years: 2,
  platform_fee: 5_000,
  servicing_fee_monthly: 49,
  exit_fee_pct: 0.01,
  realtor_representation_mode: "NONE",
  realtor_commission_pct: 0,
  realtor_commission_payment_mode: "PER_PAYMENT_EVENT",
};

const STANDARD_ASSUMPTIONS: ScenarioAssumptions = {
  annual_appreciation: 0.04,
  closing_cost_pct: 0.02,
  exit_year: 7,
};

const EARLY_ASSUMPTIONS: ScenarioAssumptions = {
  annual_appreciation: 0.04,
  closing_cost_pct: 0.02,
  exit_year: 2,
};

const LATE_ASSUMPTIONS: ScenarioAssumptions = {
  annual_appreciation: 0.04,
  closing_cost_pct: 0.02,
  exit_year: 12,
};

describe("computeDeal", () => {
  describe("Standard scenario (exit year 7, within window)", () => {
    const result = computeDeal(DEFAULT_TERMS, STANDARD_ASSUMPTIONS);

    it("includes compute_version", () => {
      expect(result.compute_version).toBe(COMPUTE_VERSION);
      expect(result.compute_version).toBe("10.2.0");
    });

    it("computes IBA correctly", () => {
      expect(result.invested_capital_total).toBe(204_000);
    });

    it("computes FMV with 4% appreciation over 7 years", () => {
      const expected = roundMoney(600_000 * Math.pow(1.04, 7));
      expect(result.projected_fmv).toBe(expected);
    });

    it("vested_equity_percentage is between 0 and 1", () => {
      expect(result.vested_equity_percentage).toBeGreaterThan(0);
      expect(result.vested_equity_percentage).toBeLessThanOrEqual(1);
    });

    it("base_equity_value equals FMV * vested_equity", () => {
      expect(result.base_equity_value).toBe(
        roundMoney(result.projected_fmv * result.vested_equity_percentage)
      );
    });

    it("gain_above_capital is base_equity - IBA", () => {
      expect(result.gain_above_capital).toBe(
        roundMoney(result.base_equity_value - result.invested_capital_total)
      );
    });

    it("timing factor is 1 (within window)", () => {
      expect(result.isa_pre_floor_cap).toBe(
        roundMoney(result.invested_capital_total + result.gain_above_capital * 1)
      );
    });

    it("floor and ceiling are correct multiples of IBA", () => {
      expect(result.floor_amount).toBe(roundMoney(204_000 * 1.03));
      expect(result.ceiling_amount).toBe(roundMoney(204_000 * 3.25));
    });

    it("ISA settlement is clamped within floor and ceiling (HARD_FLOOR)", () => {
      expect(result.isa_settlement).toBeGreaterThanOrEqual(result.floor_amount);
      expect(result.isa_settlement).toBeLessThanOrEqual(result.ceiling_amount);
    });

    it("profit = ISA - IBA", () => {
      expect(result.investor_profit).toBe(
        roundMoney(result.isa_settlement - result.invested_capital_total)
      );
    });

    it("multiple = ISA / IBA", () => {
      expect(result.investor_multiple).toBe(
        roundMoney(result.isa_settlement / result.invested_capital_total)
      );
    });

    it("IRR is a finite number", () => {
      expect(Number.isFinite(result.investor_irr_annual)).toBe(true);
    });

    it("all monetary values are rounded to 2 decimal places", () => {
      const moneyFields: (keyof typeof result)[] = [
        "invested_capital_total",
        "projected_fmv",
        "base_equity_value",
        "gain_above_capital",
        "isa_pre_floor_cap",
        "floor_amount",
        "ceiling_amount",
        "isa_settlement",
        "investor_profit",
        "investor_multiple",
        "timing_factor_applied",
        "isa_standard_pre_dyf",
        "realtor_fee_total_projected",
        "realtor_fee_upfront_projected",
        "realtor_fee_installments_projected",
        "buyer_realtor_fee_total_projected",
        "seller_realtor_fee_total_projected",
      ];
      for (const field of moneyFields) {
        const val = result[field] as number;
        const rounded = Math.round(val * 100) / 100;
        expect(val).toBe(rounded);
      }
    });
  });

  describe("Early exit scenario (exit year 2, before window)", () => {
    const result = computeDeal(DEFAULT_TERMS, EARLY_ASSUMPTIONS);

    it("IBA reflects only 24 monthly payments", () => {
      expect(result.invested_capital_total).toBe(
        roundMoney(60_000 + 24 * 2_000)
      );
    });

    it("timing factor is early (0.9)", () => {
      const expectedPre = roundMoney(
        result.invested_capital_total + result.gain_above_capital * 0.9
      );
      expect(result.isa_pre_floor_cap).toBe(expectedPre);
    });

    it("ISA settlement respects floor under HARD_FLOOR", () => {
      expect(result.isa_settlement).toBeGreaterThanOrEqual(result.floor_amount);
    });

    it("compute_version is 10.0.0", () => {
      expect(result.compute_version).toBe("10.2.0");
    });
  });

  describe("Late exit scenario (exit year 12, after window)", () => {
    const result = computeDeal(DEFAULT_TERMS, LATE_ASSUMPTIONS);

    it("IBA reflects all 72 payments (capped at number_of_payments)", () => {
      expect(result.invested_capital_total).toBe(204_000);
    });

    it("timing factor is late (1.2) applied to gain only", () => {
      const expectedPre = roundMoney(
        result.invested_capital_total + result.gain_above_capital * 1.2
      );
      expect(result.isa_pre_floor_cap).toBe(expectedPre);
    });

    it("FMV is higher than standard (more appreciation)", () => {
      const stdFmv = roundMoney(600_000 * Math.pow(1.04, 7));
      expect(result.projected_fmv).toBeGreaterThan(stdFmv);
    });
  });

  describe("Ceiling binding case", () => {
    const terms: DealTerms = {
      ...DEFAULT_TERMS,
      ceiling_multiple: 1.5,
      floor_multiple: 1.0,
    };
    const assumptions: ScenarioAssumptions = {
      annual_appreciation: 0.10,
      closing_cost_pct: 0.02,
      exit_year: 10,
    };
    const result = computeDeal(terms, assumptions);

    it("ISA settlement equals ceiling amount", () => {
      expect(result.isa_settlement).toBe(result.ceiling_amount);
    });

    it("isa_pre_floor_cap exceeds ceiling", () => {
      expect(result.isa_pre_floor_cap).toBeGreaterThan(result.ceiling_amount);
    });

    it("ceiling_amount = IBA * ceiling_multiple", () => {
      expect(result.ceiling_amount).toBe(
        roundMoney(result.invested_capital_total * 1.5)
      );
    });
  });

  describe("HARD_FLOOR enforcement case", () => {
    const terms: DealTerms = {
      ...DEFAULT_TERMS,
      floor_multiple: 1.03,
      downside_mode: "HARD_FLOOR",
    };
    const assumptions: ScenarioAssumptions = {
      annual_appreciation: -0.05,
      closing_cost_pct: 0.02,
      exit_year: 5,
    };
    const result = computeDeal(terms, assumptions);

    it("gain_above_capital is negative (depreciation)", () => {
      expect(result.gain_above_capital).toBeLessThan(0);
    });

    it("ISA settlement equals floor (HARD_FLOOR protects investor)", () => {
      expect(result.isa_settlement).toBe(result.floor_amount);
    });

    it("floor_amount = IBA * floor_multiple", () => {
      expect(result.floor_amount).toBe(
        roundMoney(result.invested_capital_total * 1.03)
      );
    });
  });

  describe("NO_FLOOR negative loss case", () => {
    const terms: DealTerms = {
      ...DEFAULT_TERMS,
      downside_mode: "NO_FLOOR",
    };
    const assumptions: ScenarioAssumptions = {
      annual_appreciation: -0.10,
      closing_cost_pct: 0.02,
      exit_year: 5,
    };
    const result = computeDeal(terms, assumptions);

    it("ISA may be less than IBA (true loss sharing)", () => {
      expect(result.isa_settlement).toBeLessThan(result.invested_capital_total);
    });

    it("investor_profit is negative", () => {
      expect(result.investor_profit).toBeLessThan(0);
    });

    it("investor_multiple is less than 1", () => {
      expect(result.investor_multiple).toBeLessThan(1);
    });

    it("settlement is NOT clamped to floor", () => {
      expect(result.isa_settlement).toBeLessThan(result.floor_amount);
    });
  });

  describe("Zero appreciation case", () => {
    const assumptions: ScenarioAssumptions = {
      annual_appreciation: 0,
      closing_cost_pct: 0.02,
      exit_year: 7,
    };
    const result = computeDeal(DEFAULT_TERMS, assumptions);

    it("FMV equals property_value (no growth)", () => {
      expect(result.projected_fmv).toBe(600_000);
    });

    it("gain may be negative due to equity fraction vs IBA", () => {
      expect(Number.isFinite(result.gain_above_capital)).toBe(true);
    });

    it("ISA respects floor under HARD_FLOOR", () => {
      expect(result.isa_settlement).toBeGreaterThanOrEqual(result.floor_amount);
    });
  });

  describe("FMV override", () => {
    const assumptions: ScenarioAssumptions = {
      annual_appreciation: 0.04,
      closing_cost_pct: 0.02,
      exit_year: 7,
      fmv_override: 1_000_000,
    };
    const result = computeDeal(DEFAULT_TERMS, assumptions);

    it("uses fmv_override instead of computed FMV", () => {
      expect(result.projected_fmv).toBe(1_000_000);
    });
  });

  describe("Determinism invariant", () => {
    it("same inputs produce identical outputs across multiple runs", () => {
      const results = Array.from({ length: 10 }, () =>
        computeDeal(DEFAULT_TERMS, STANDARD_ASSUMPTIONS)
      );
      const first = JSON.stringify(results[0]);
      for (let i = 1; i < results.length; i++) {
        expect(JSON.stringify(results[i])).toBe(first);
      }
    });

    it("different exit years produce different outputs", () => {
      const r7 = computeDeal(DEFAULT_TERMS, { ...STANDARD_ASSUMPTIONS, exit_year: 7 });
      const r5 = computeDeal(DEFAULT_TERMS, { ...STANDARD_ASSUMPTIONS, exit_year: 5 });
      expect(r7.projected_fmv).not.toBe(r5.projected_fmv);
    });
  });

  describe("Golden fixture — spreadsheet default scenario (standard exit year 7)", () => {
    const result = computeDeal(DEFAULT_TERMS, STANDARD_ASSUMPTIONS);

    it("IBA = 204,000.00", () => {
      expect(result.invested_capital_total).toBe(204_000.00);
    });

    it("FMV = 600000 * 1.04^7", () => {
      expect(result.projected_fmv).toBe(roundMoney(600_000 * Math.pow(1.04, 7)));
    });

    it("floor = 204000 * 1.03 = 210120.00", () => {
      expect(result.floor_amount).toBe(210_120.00);
    });

    it("ceiling = 204000 * 3.25 = 663000.00", () => {
      expect(result.ceiling_amount).toBe(663_000.00);
    });

    it("investor_multiple > 1 (profitable deal)", () => {
      expect(result.investor_multiple).toBeGreaterThan(1);
    });

    it("investor_irr_annual is positive", () => {
      expect(result.investor_irr_annual).toBeGreaterThan(0);
    });

    it("ISA is within [floor, ceiling]", () => {
      expect(result.isa_settlement).toBeGreaterThanOrEqual(210_120.00);
      expect(result.isa_settlement).toBeLessThanOrEqual(663_000.00);
    });

    it("DYF is not applied when not configured", () => {
      expect(result.dyf_applied).toBe(false);
      expect(result.dyf_floor_amount).toBe(null);
    });

    it("all output fields are present", () => {
      const requiredFields: (keyof typeof result)[] = [
        "invested_capital_total",
        "vested_equity_percentage",
        "projected_fmv",
        "base_equity_value",
        "gain_above_capital",
        "timing_factor_applied",
        "isa_pre_floor_cap",
        "floor_amount",
        "ceiling_amount",
        "isa_standard_pre_dyf",
        "isa_settlement",
        "dyf_floor_amount",
        "dyf_applied",
        "investor_profit",
        "investor_multiple",
        "investor_irr_annual",
        "realtor_fee_total_projected",
        "realtor_fee_upfront_projected",
        "realtor_fee_installments_projected",
        "buyer_realtor_fee_total_projected",
        "seller_realtor_fee_total_projected",
        "investor_irr_annual_net",
        "compute_version",
      ];
      for (const f of requiredFields) {
        expect(result).toHaveProperty(f);
      }
    });
  });

  describe("Duration Yield Floor (DYF)", () => {
    const DYF_TERMS: DealTerms = {
      ...DEFAULT_TERMS,
      ceiling_multiple: 1.5,
      duration_yield_floor_enabled: true,
      duration_yield_floor_start_year: 15,
      duration_yield_floor_min_multiple: 1.5,
    };

    describe("DYF disabled → no change to settlement", () => {
      const baseTerms: DealTerms = {
        ...DEFAULT_TERMS,
        ceiling_multiple: 1.5,
      };

      const termsWithDyfDisabled: DealTerms = {
        ...baseTerms,
        duration_yield_floor_enabled: false,
        duration_yield_floor_start_year: 10,
        duration_yield_floor_min_multiple: 2.0,
      };

      const assumptions: ScenarioAssumptions = { ...LATE_ASSUMPTIONS, exit_year: 15 };

      const baseline = computeDeal(baseTerms, assumptions);
      const result = computeDeal(termsWithDyfDisabled, assumptions);

      it("dyf_applied is false", () => {
        expect(result.dyf_applied).toBe(false);
      });

      it("dyf_floor_amount is null", () => {
        expect(result.dyf_floor_amount).toBe(null);
      });

      it("settlement matches baseline when DYF is disabled", () => {
        expect(result.isa_settlement).toBe(baseline.isa_settlement);
      });
    });

    describe("DYF enabled but exit_year < start_year → no change", () => {
      const result = computeDeal(DYF_TERMS, {
        annual_appreciation: 0.02,
        closing_cost_pct: 0.02,
        exit_year: 10,
      });

      it("dyf_applied is false", () => {
        expect(result.dyf_applied).toBe(false);
      });

      it("dyf_floor_amount is computed but not applied", () => {
        expect(result.dyf_floor_amount).toBe(
          roundMoney(result.invested_capital_total * 1.5)
        );
      });
    });

    describe("DYF enabled, exit_year >= start_year, ISA_standard < DYF floor → raised", () => {
      const terms: DealTerms = {
        ...DEFAULT_TERMS,
        ceiling_multiple: 1.2,
        timing_factor_late: 1.0,
        duration_yield_floor_enabled: true,
        duration_yield_floor_start_year: 15,
        duration_yield_floor_min_multiple: 1.5,
      };
      const result = computeDeal(terms, {
        annual_appreciation: 0.01,
        closing_cost_pct: 0.02,
        exit_year: 20,
      });

      it("dyf_applied is true", () => {
        expect(result.dyf_applied).toBe(true);
      });

      it("settlement equals DYF floor amount", () => {
        expect(result.isa_settlement).toBe(result.dyf_floor_amount);
      });

      it("DYF floor = IBA * min_multiple", () => {
        expect(result.dyf_floor_amount).toBe(
          roundMoney(result.invested_capital_total * 1.5)
        );
      });

      it("DYF floor exceeds ceiling (that is the point)", () => {
        expect(result.isa_settlement).toBeGreaterThan(result.ceiling_amount);
      });
    });

    describe("DYF enabled, exit_year >= start_year, ISA_standard >= DYF floor → unchanged", () => {
      const terms: DealTerms = {
        ...DEFAULT_TERMS,
        ceiling_multiple: 3.25,
        duration_yield_floor_enabled: true,
        duration_yield_floor_start_year: 10,
        duration_yield_floor_min_multiple: 1.2,
      };
      const result = computeDeal(terms, {
        annual_appreciation: 0.06,
        closing_cost_pct: 0.02,
        exit_year: 12,
      });

      it("dyf_applied is false (standard settlement already exceeds DYF)", () => {
        expect(result.dyf_applied).toBe(false);
      });

      it("settlement is standard (not raised)", () => {
        expect(result.dyf_floor_amount).not.toBeNull();
        expect(result.isa_settlement).toBeGreaterThanOrEqual(result.dyf_floor_amount!);
      });
    });

    describe("DYF works under HARD_FLOOR mode", () => {
      const terms: DealTerms = {
        ...DEFAULT_TERMS,
        downside_mode: "HARD_FLOOR",
        ceiling_multiple: 1.1,
        duration_yield_floor_enabled: true,
        duration_yield_floor_start_year: 15,
        duration_yield_floor_min_multiple: 1.5,
      };
      const result = computeDeal(terms, {
        annual_appreciation: 0.01,
        closing_cost_pct: 0.02,
        exit_year: 20,
      });

      it("DYF is applied and exceeds ceiling", () => {
        expect(result.dyf_applied).toBe(true);
        expect(result.isa_settlement).toBe(result.dyf_floor_amount);
        expect(result.isa_settlement).toBeGreaterThan(result.ceiling_amount);
      });
    });

    describe("DYF works under NO_FLOOR mode", () => {
      const terms: DealTerms = {
        ...DEFAULT_TERMS,
        downside_mode: "NO_FLOOR",
        ceiling_multiple: 1.1,
        duration_yield_floor_enabled: true,
        duration_yield_floor_start_year: 15,
        duration_yield_floor_min_multiple: 1.5,
      };
      const result = computeDeal(terms, {
        annual_appreciation: 0.01,
        closing_cost_pct: 0.02,
        exit_year: 20,
      });

      it("DYF is applied under NO_FLOOR", () => {
        expect(result.dyf_applied).toBe(true);
        expect(result.isa_settlement).toBe(result.dyf_floor_amount);
      });
    });

    describe("DYF IRR reflects updated settlement", () => {
      const termsNoDyf: DealTerms = {
        ...DEFAULT_TERMS,
        ceiling_multiple: 1.1,
      };
      const termsDyf: DealTerms = {
        ...termsNoDyf,
        duration_yield_floor_enabled: true,
        duration_yield_floor_start_year: 15,
        duration_yield_floor_min_multiple: 1.5,
      };
      const assumptions: ScenarioAssumptions = {
        annual_appreciation: 0.01,
        closing_cost_pct: 0.02,
        exit_year: 20,
      };

      it("IRR is higher when DYF raises settlement", () => {
        const withoutDyf = computeDeal(termsNoDyf, assumptions);
        const withDyf = computeDeal(termsDyf, assumptions);
        expect(withDyf.isa_settlement).toBeGreaterThan(withoutDyf.isa_settlement);
        expect(withDyf.investor_irr_annual).toBeGreaterThan(withoutDyf.investor_irr_annual);
      });
    });

    describe("DYF determinism", () => {
      it("same DYF inputs produce identical outputs", () => {
        const terms: DealTerms = {
          ...DEFAULT_TERMS,
          duration_yield_floor_enabled: true,
          duration_yield_floor_start_year: 15,
          duration_yield_floor_min_multiple: 1.5,
        };
        const assumptions: ScenarioAssumptions = {
          annual_appreciation: 0.02,
          closing_cost_pct: 0.02,
          exit_year: 20,
        };
        const results = Array.from({ length: 5 }, () => computeDeal(terms, assumptions));
        const first = JSON.stringify(results[0]);
        for (let i = 1; i < results.length; i++) {
          expect(JSON.stringify(results[i])).toBe(first);
        }
      });
    });
  });

  describe("Realtor commission computation", () => {
    describe("NONE mode returns all zeros", () => {
      const terms: DealTerms = {
        ...DEFAULT_TERMS,
        realtor_representation_mode: "NONE",
        realtor_commission_pct: 0.03,
        realtor_commission_payment_mode: "PER_PAYMENT_EVENT",
      };
      const result = computeDeal(terms, STANDARD_ASSUMPTIONS);

      it("realtor_fee_total_projected is 0", () => {
        expect(result.realtor_fee_total_projected).toBe(0);
      });

      it("realtor_fee_upfront_projected is 0", () => {
        expect(result.realtor_fee_upfront_projected).toBe(0);
      });

      it("realtor_fee_installments_projected is 0", () => {
        expect(result.realtor_fee_installments_projected).toBe(0);
      });

      it("buyer_realtor_fee_total_projected is 0", () => {
        expect(result.buyer_realtor_fee_total_projected).toBe(0);
      });

      it("seller_realtor_fee_total_projected is 0", () => {
        expect(result.seller_realtor_fee_total_projected).toBe(0);
      });
    });

    describe("BUYER mode computes correct totals", () => {
      const terms: DealTerms = {
        ...DEFAULT_TERMS,
        realtor_representation_mode: "BUYER",
        realtor_commission_pct: 0.03,
        realtor_commission_payment_mode: "PER_PAYMENT_EVENT",
      };
      const result = computeDeal(terms, STANDARD_ASSUMPTIONS);

      it("total = upfront + installments (Section 6C)", () => {
        expect(result.realtor_fee_total_projected).toBe(
          roundMoney(result.realtor_fee_upfront_projected + result.realtor_fee_installments_projected)
        );
      });

      it("upfront = upfront_payment * commission_pct", () => {
        expect(result.realtor_fee_upfront_projected).toBe(
          roundMoney(DEFAULT_TERMS.upfront_payment * 0.03)
        );
      });

      it("buyer + seller splits sum to total (Section 6D)", () => {
        expect(
          roundMoney(result.buyer_realtor_fee_total_projected + result.seller_realtor_fee_total_projected)
        ).toBe(result.realtor_fee_total_projected);
      });

      it("total is positive", () => {
        expect(result.realtor_fee_total_projected).toBeGreaterThan(0);
      });
    });

    describe("SELLER mode computes correct totals", () => {
      const terms: DealTerms = {
        ...DEFAULT_TERMS,
        realtor_representation_mode: "SELLER",
        realtor_commission_pct: 0.025,
        realtor_commission_payment_mode: "PER_PAYMENT_EVENT",
      };
      const result = computeDeal(terms, STANDARD_ASSUMPTIONS);

      it("total = upfront + installments", () => {
        expect(result.realtor_fee_total_projected).toBe(
          roundMoney(result.realtor_fee_upfront_projected + result.realtor_fee_installments_projected)
        );
      });

      it("buyer + seller splits sum to total", () => {
        expect(
          roundMoney(result.buyer_realtor_fee_total_projected + result.seller_realtor_fee_total_projected)
        ).toBe(result.realtor_fee_total_projected);
      });
    });

    describe("DUAL mode computes correct totals", () => {
      const terms: DealTerms = {
        ...DEFAULT_TERMS,
        realtor_representation_mode: "DUAL",
        realtor_commission_pct: 0.05,
        realtor_commission_payment_mode: "PER_PAYMENT_EVENT",
      };
      const result = computeDeal(terms, STANDARD_ASSUMPTIONS);

      it("total = upfront + installments", () => {
        expect(result.realtor_fee_total_projected).toBe(
          roundMoney(result.realtor_fee_upfront_projected + result.realtor_fee_installments_projected)
        );
      });

      it("buyer + seller splits sum to total", () => {
        expect(
          roundMoney(result.buyer_realtor_fee_total_projected + result.seller_realtor_fee_total_projected)
        ).toBe(result.realtor_fee_total_projected);
      });

      it("total is positive", () => {
        expect(result.realtor_fee_total_projected).toBeGreaterThan(0);
      });
    });

    describe("Section 6D — explicit equity-weighted attribution numerics", () => {
      const pct = 0.03;
      const terms: DealTerms = {
        property_value: 500_000,
        upfront_payment: 50_000,
        monthly_payment: 1_000,
        number_of_payments: 120,
        payback_window_start_year: 3,
        payback_window_end_year: 10,
        timing_factor_early: 1,
        timing_factor_late: 1,
        floor_multiple: 1,
        ceiling_multiple: 3,
        downside_mode: "HARD_FLOOR",
        contract_maturity_years: 30,
        liquidity_trigger_year: 12,
        minimum_hold_years: 3,
        platform_fee: 0,
        servicing_fee_monthly: 0,
        exit_fee_pct: 0,
        realtor_representation_mode: "BUYER",
        realtor_commission_pct: pct,
        realtor_commission_payment_mode: "PER_PAYMENT_EVENT",
      };
      const appreciation = 0.04;
      const assumptions: ScenarioAssumptions = {
        annual_appreciation: appreciation,
        closing_cost_pct: 0,
        exit_year: 0.25,
      };
      const result = computeDeal(terms, assumptions);

      it("upfront attribution uses vested equity AFTER upfront payment", () => {
        const vestedAfterUpfront = terms.upfront_payment / terms.property_value;
        const upfrontCommission = terms.upfront_payment * pct;
        const expectedBuyerUpfront = roundMoney(upfrontCommission * vestedAfterUpfront);
        const expectedSellerUpfront = roundMoney(upfrontCommission * (1 - vestedAfterUpfront));

        let buyerManual = expectedBuyerUpfront;
        let sellerManual = expectedSellerUpfront;

        const exitMonth = Math.floor(assumptions.exit_year * 12);
        const paymentsMade = Math.min(terms.number_of_payments, exitMonth);

        let cumulativeEquity = vestedAfterUpfront;
        for (let m = 1; m <= paymentsMade; m++) {
          const pvAtMonth = terms.property_value * Math.pow(1 + appreciation, m / 12);
          cumulativeEquity += terms.monthly_payment / pvAtMonth;
          const monthCommission = terms.monthly_payment * pct;
          buyerManual += monthCommission * cumulativeEquity;
          sellerManual += monthCommission * (1 - cumulativeEquity);
        }

        expect(result.buyer_realtor_fee_total_projected).toBe(roundMoney(buyerManual));
        expect(result.seller_realtor_fee_total_projected).toBe(roundMoney(sellerManual));
      });

      it("upfront buyer share equals upfront_commission * (upfront/property_value)", () => {
        const vestedAfterUpfront = terms.upfront_payment / terms.property_value;
        const upfrontCommission = terms.upfront_payment * pct;
        expect(result.buyer_realtor_fee_total_projected).toBeGreaterThanOrEqual(
          roundMoney(upfrontCommission * vestedAfterUpfront)
        );
      });

      it("seller share is always positive when vested equity < 100%", () => {
        expect(result.seller_realtor_fee_total_projected).toBeGreaterThan(0);
      });

      it("buyer share grows relative to seller as equity vests", () => {
        const shortResult = computeDeal(terms, { ...assumptions, exit_year: 0.25 });
        const longResult = computeDeal(terms, { ...assumptions, exit_year: 5 });

        const shortBuyerRatio = shortResult.buyer_realtor_fee_total_projected /
          (shortResult.buyer_realtor_fee_total_projected + shortResult.seller_realtor_fee_total_projected);
        const longBuyerRatio = longResult.buyer_realtor_fee_total_projected /
          (longResult.buyer_realtor_fee_total_projected + longResult.seller_realtor_fee_total_projected);

        expect(longBuyerRatio).toBeGreaterThan(shortBuyerRatio);
      });
    });
  });
});
