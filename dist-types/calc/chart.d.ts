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
export declare function buildChartSeries(outputs: ScenarioOutputs): ChartSeries;
//# sourceMappingURL=chart.d.ts.map