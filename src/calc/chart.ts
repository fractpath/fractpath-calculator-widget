import type { ScenarioOutputs } from "./types.js";

export type ChartPoint = {
  year: number;
  label: string;
  contractValue: number;
  participationValue: number;
  buyoutAmount: number;
  discountPurchasePrice: number | null;
};

export type SettlementMarker = {
  timing: "early" | "standard" | "late";
  year: number;
  buyoutAmount: number;
};

export type ChartSeries = {
  points: ChartPoint[];
  markers: SettlementMarker[];
};

/**
 * Pure transformer: converts ScenarioOutputs (v11-backed) into v11 milestone chart points.
 * Uses the three settlement scenarios (early / standard / late) as the milestone years.
 */
export function buildChartSeries(outputs: ScenarioOutputs): ChartSeries {
  const { early, standard, late } = outputs.settlements;

  const originPoint: ChartPoint = {
    year: 0,
    label: "Start",
    contractValue: 0,
    participationValue: 0,
    buyoutAmount: 0,
    discountPurchasePrice: null,
  };

  function settlementToPoint(
    s: typeof standard,
    label: string,
  ): ChartPoint {
    const year = Math.round((s.settlementMonth / 12) * 10) / 10;
    return {
      year,
      label,
      contractValue: s.rawPayout,
      participationValue: s.rawPayout,
      buyoutAmount: s.netPayout,
      discountPurchasePrice: null,
    };
  }

  const points: ChartPoint[] = [
    originPoint,
    settlementToPoint(early, "Early exit"),
    settlementToPoint(standard, "Target exit"),
    settlementToPoint(late, "Late exit"),
  ];

  const markers: SettlementMarker[] = [
    {
      timing: "early",
      year: Math.round((early.settlementMonth / 12) * 10) / 10,
      buyoutAmount: early.netPayout,
    },
    {
      timing: "standard",
      year: Math.round((standard.settlementMonth / 12) * 10) / 10,
      buyoutAmount: standard.netPayout,
    },
    {
      timing: "late",
      year: Math.round((late.settlementMonth / 12) * 10) / 10,
      buyoutAmount: late.netPayout,
    },
  ];

  return { points, markers };
}
