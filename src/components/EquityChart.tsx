import { useMemo } from "react";
import type { ChartSeries, SettlementMarker } from "../calc/chart.js";

type Props = {
  series: ChartSeries;
  width?: number;
  height?: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function formatK(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${Math.round(v / 1_000)}k`;
  return `$${Math.round(v)}`;
}

function formatYear(y: number) {
  return `Yr ${Math.round(y)}`;
}

function markerLabel(m: SettlementMarker) {
  if (m.timing === "early") return "Early";
  if (m.timing === "late") return "Late";
  return "Std";
}

const MARKER_COLORS: Record<string, string> = {
  early: "#ca8a04",
  standard: "#0891b2",
  late: "#c026d3",
};

export function EquityChart({ series, width = 640, height = 260 }: Props) {
  const { points, markers } = series;

  const uniqueId = useMemo(
    () => `cv-${Math.random().toString(36).slice(2, 8)}`,
    [],
  );

  if (!points.length) {
    return <div style={{ fontFamily: "system-ui, sans-serif" }}>No data</div>;
  }

  const padding = { top: 24, right: 24, bottom: 40, left: 64 };

  const innerW = Math.max(10, width - padding.left - padding.right);
  const innerH = Math.max(10, height - padding.top - padding.bottom);

  const allYears = points.map((p) => p.year);
  const xMin = Math.min(...allYears);
  const xMax = Math.max(...allYears);

  const allValues = points.flatMap((p) => [p.buyoutAmount, p.contractValue]);
  const yMin = 0;
  const yMax = Math.max(...allValues, 1);

  const xScale = (year: number) => {
    if (xMax === xMin) return padding.left;
    return padding.left + ((year - xMin) / (xMax - xMin)) * innerW;
  };

  const yScale = (value: number) => {
    const v = clamp(value, yMin, yMax);
    return padding.top + (1 - (v - yMin) / (yMax - yMin)) * innerH;
  };

  const buyoutPathD = points
    .map((p, i) => {
      const x = xScale(p.year);
      const y = yScale(p.buyoutAmount);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  const pathLength = points.length * 40;

  const yTickCount = 4;
  const yTicks = Array.from({ length: yTickCount + 1 }, (_, i) => {
    const v = (yMax * i) / yTickCount;
    return { v, y: yScale(v), label: formatK(v) };
  });

  const xTicks = points.map((p) => ({
    year: p.year,
    x: xScale(p.year),
    label: p.label,
  }));

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Contract value over time"
      style={{ display: "block" }}
    >
      <style>{`
        @keyframes ${uniqueId}-draw {
          from { stroke-dashoffset: ${pathLength}; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>
      <rect x={0} y={0} width={width} height={height} fill="white" rx={8} />

      {yTicks.map((t, i) => (
        <g key={i}>
          <line
            x1={padding.left}
            x2={width - padding.right}
            y1={t.y}
            y2={t.y}
            stroke="#f3f4f6"
            strokeWidth={1}
          />
          <text
            x={padding.left - 8}
            y={t.y + 4}
            fontSize={11}
            textAnchor="end"
            fill="#9ca3af"
            fontFamily="system-ui, sans-serif"
          >
            {t.label}
          </text>
        </g>
      ))}

      <line
        x1={padding.left}
        x2={width - padding.right}
        y1={padding.top + innerH}
        y2={padding.top + innerH}
        stroke="#e5e7eb"
        strokeWidth={1}
      />

      {xTicks.map((t) => (
        <g key={t.year}>
          <line
            x1={t.x}
            x2={t.x}
            y1={padding.top + innerH}
            y2={padding.top + innerH + 5}
            stroke="#d1d5db"
            strokeWidth={1}
          />
          <text
            x={t.x}
            y={padding.top + innerH + 20}
            fontSize={10}
            textAnchor="middle"
            fill="#9ca3af"
            fontFamily="system-ui, sans-serif"
          >
            {t.label}
          </text>
          <text
            x={t.x}
            y={padding.top + innerH + 33}
            fontSize={9}
            textAnchor="middle"
            fill="#d1d5db"
            fontFamily="system-ui, sans-serif"
          >
            {formatYear(t.year)}
          </text>
        </g>
      ))}

      {markers.map((m) => {
        const x = xScale(m.year);
        const color = MARKER_COLORS[m.timing] || "#d1d5db";
        return (
          <g key={m.timing}>
            <line
              x1={x}
              x2={x}
              y1={padding.top}
              y2={padding.top + innerH}
              stroke={color}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            <rect
              x={x - 20}
              y={padding.top - 4}
              width={40}
              height={18}
              rx={9}
              fill="#f9fafb"
              stroke={color}
              strokeWidth={1}
            />
            <text
              x={x}
              y={padding.top + 10}
              fontSize={10}
              textAnchor="middle"
              fill={color}
              fontFamily="system-ui, sans-serif"
              fontWeight={600}
            >
              {markerLabel(m)}
            </text>
          </g>
        );
      })}

      <path
        d={buyoutPathD}
        fill="none"
        stroke="#0891b2"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={pathLength}
        strokeDashoffset={0}
        style={{
          animation: `${uniqueId}-draw 1s ease-out forwards`,
        }}
      />

      {points.slice(1).map((p) => (
        <circle
          key={p.year}
          cx={xScale(p.year)}
          cy={yScale(p.buyoutAmount)}
          r={4}
          fill="#0891b2"
          stroke="white"
          strokeWidth={2}
        />
      ))}

      <text
        x={padding.left}
        y={14}
        fontSize={12}
        fill="#6b7280"
        fontFamily="system-ui, sans-serif"
        fontWeight={500}
      >
        Contract Value Over Time
      </text>
    </svg>
  );
}
