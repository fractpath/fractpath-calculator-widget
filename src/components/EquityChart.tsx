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

function formatPct(x: number) {
  return `${Math.round(x * 100)}%`;
}

function formatYear(y: number) {
  return `${Math.round(y * 10) / 10}y`;
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
    () => `eq-${Math.random().toString(36).slice(2, 8)}`,
    [],
  );

  if (!points.length) {
    return <div style={{ fontFamily: "system-ui, sans-serif" }}>No data</div>;
  }

  const padding = { top: 20, right: 24, bottom: 36, left: 50 };

  const innerW = Math.max(10, width - padding.left - padding.right);
  const innerH = Math.max(10, height - padding.top - padding.bottom);

  const xMin = points[0].month;
  const xMax = points[points.length - 1].month;

  const yMin = 0;
  const yMax = 1;

  const xScale = (month: number) => {
    if (xMax === xMin) return padding.left;
    return padding.left + ((month - xMin) / (xMax - xMin)) * innerW;
  };

  const yScale = (equityPct: number) => {
    const v = clamp(equityPct, yMin, yMax);
    return padding.top + (1 - (v - yMin) / (yMax - yMin)) * innerH;
  };

  const pathD = points
    .map((p, i) => {
      const x = xScale(p.month);
      const y = yScale(p.equityPct);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  const pathLength = points.length * 20;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((v) => ({
    v,
    y: yScale(v),
    label: formatPct(v),
  }));

  const midMonth = Math.round((xMin + xMax) / 2);
  const xTicks = [xMin, midMonth, xMax].map((m) => ({
    m,
    x: xScale(m),
    label: formatYear(m / 12),
  }));

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Equity over time"
      style={{ display: "block" }}
    >
      <style>{`
        @keyframes ${uniqueId}-draw {
          from { stroke-dashoffset: ${pathLength}; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>
      <rect x={0} y={0} width={width} height={height} fill="white" rx={8} />

      {yTicks.map((t) => (
        <g key={t.v}>
          <line
            x1={padding.left}
            x2={width - padding.right}
            y1={t.y}
            y2={t.y}
            stroke="#f3f4f6"
            strokeWidth={1}
          />
          <text
            x={padding.left - 10}
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
        <g key={t.m}>
          <line
            x1={t.x}
            x2={t.x}
            y1={padding.top + innerH}
            y2={padding.top + innerH + 6}
            stroke="#d1d5db"
            strokeWidth={1}
          />
          <text
            x={t.x}
            y={padding.top + innerH + 24}
            fontSize={11}
            textAnchor="middle"
            fill="#9ca3af"
            fontFamily="system-ui, sans-serif"
          >
            {t.label}
          </text>
        </g>
      ))}

      {markers.map((m) => {
        const x = xScale(m.month);
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
              x={x - 18}
              y={padding.top - 4}
              width={36}
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
        d={pathD}
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

      <text
        x={padding.left}
        y={14}
        fontSize={12}
        fill="#6b7280"
        fontFamily="system-ui, sans-serif"
        fontWeight={500}
      >
        Equity ownership over time
      </text>
    </svg>
  );
}
