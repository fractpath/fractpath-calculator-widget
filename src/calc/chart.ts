import type { ScenarioOutputs, SettlementTiming, TimePoint } from "./types.js";

export type ChartPoint = {
  month: number;
  year: number;
  homeValue: number;
  equityPct: number;
  equityDollarValue: number;
};

export type ExitSummary = {
  timing: SettlementTiming;
  label: string;
  month: number;
  year: number;
  homeValueAtSettlement: number;
  equityPctAtSettlement: number;
  rawPayout: number;
  clampedPayout: number;
  netPayout: number;
  transferFeeAmount: number;
  transferFeeRate: number;
  clampApplied: "none" | "floor" | "cap";
  equityConstrained: boolean;
};

export type SettlementMarker = {
  timing: SettlementTiming;
  month: number;
  year: number;
  homeValueAtSettlement: number;
  equityPctAtSettlement: number;
  netPayout: number;
};

export type ChartSeriesV1 = {
  points: ChartPoint[];
  exits: ExitSummary[];
};

export type ChartSeries = {
  points: ChartPoint[];
  markers: SettlementMarker[];
};

const EXIT_LABELS: Record<SettlementTiming, string> = {
  early: "Early Exit",
  standard: "Standard Exit",
  late: "Late Exit",
};

export function buildChartSeriesV1(outputs: ScenarioOutputs): ChartSeriesV1 {
  const points: ChartPoint[] = outputs.series.map((p: TimePoint) => ({
    month: p.month,
    year: p.year,
    homeValue: p.homeValue,
    equityPct: p.equityPct,
    equityDollarValue: p.homeValue * p.equityPct,
  }));

  const exits: ExitSummary[] = (["early", "standard", "late"] as const).map((timing) => {
    const s = outputs.settlements[timing];
    return {
      timing,
      label: EXIT_LABELS[timing],
      month: s.settlementMonth,
      year: s.settlementMonth / 12,
      homeValueAtSettlement: s.homeValueAtSettlement,
      equityPctAtSettlement: s.equityPctAtSettlement,
      rawPayout: s.rawPayout,
      clampedPayout: s.clampedPayout,
      netPayout: s.netPayout,
      transferFeeAmount: s.transferFeeAmount,
      transferFeeRate: s.transferFeeRate,
      clampApplied: s.clamp.applied,
      equityConstrained: s.equityAvailability.constrained,
    };
  });

  return { points, exits };
}

export function buildChartSeries(outputs: ScenarioOutputs): ChartSeries {
  const v1 = buildChartSeriesV1(outputs);

  const points: ChartPoint[] = v1.points;

  const markers: SettlementMarker[] = v1.exits.map((e) => ({
    timing: e.timing,
    month: e.month,
    year: e.year,
    homeValueAtSettlement: e.homeValueAtSettlement,
    equityPctAtSettlement: e.equityPctAtSettlement,
    netPayout: e.netPayout,
  }));

  return { points, markers };
}
