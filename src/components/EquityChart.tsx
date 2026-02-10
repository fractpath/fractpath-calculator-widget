import { useState } from "react";
import type { ChartSeriesV1, ExitSummary } from "../calc/chart.js";

type Props = {
  series: ChartSeriesV1;
  width?: number;
  height?: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function fmtPct(x: number) {
  return `${(x * 100).toFixed(1)}%`;
}

function fmtYear(y: number) {
  return `${Math.round(y * 10) / 10}y`;
}

function fmtCurrency(v: number) {
  return v.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

const TIMING_COLORS: Record<string, string> = {
  early: "#ef4444",
  standard: "#2563eb",
  late: "#16a34a",
};

const TIMING_BG: Record<string, string> = {
  early: "#fef2f2",
  standard: "#eff6ff",
  late: "#f0fdf4",
};

function ExitTooltip({ exit, x, chartTop }: { exit: ExitSummary; x: number; chartTop: number }) {
  const color = TIMING_COLORS[exit.timing] ?? "#374151";
  const bg = TIMING_BG[exit.timing] ?? "#f9fafb";

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: chartTop - 8,
        transform: "translate(-50%, -100%)",
        background: bg,
        border: `1px solid ${color}`,
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 12,
        fontFamily: "system-ui, sans-serif",
        color: "#1f2937",
        whiteSpace: "nowrap",
        pointerEvents: "none",
        zIndex: 10,
        boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
        minWidth: 180,
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 13, color, marginBottom: 6 }}>
        {exit.label}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "auto auto", gap: "3px 12px" }}>
        <span style={{ color: "#6b7280" }}>When:</span>
        <span>{fmtYear(exit.year)}</span>
        <span style={{ color: "#6b7280" }}>Home Value:</span>
        <span>{fmtCurrency(exit.homeValueAtSettlement)}</span>
        <span style={{ color: "#6b7280" }}>Equity:</span>
        <span>{fmtPct(exit.equityPctAtSettlement)}</span>
        <span style={{ color: "#6b7280" }}>Net Payout:</span>
        <span style={{ fontWeight: 700 }}>{fmtCurrency(exit.netPayout)}</span>
        <span style={{ color: "#6b7280" }}>Transfer Fee:</span>
        <span>
          {fmtCurrency(exit.transferFeeAmount)} ({fmtPct(exit.transferFeeRate)})
        </span>
        {exit.clampApplied !== "none" && (
          <>
            <span style={{ color: "#6b7280" }}>Clamp:</span>
            <span>{exit.clampApplied === "floor" ? "Floor applied" : "Cap applied"}</span>
          </>
        )}
        {exit.equityConstrained && (
          <>
            <span style={{ color: "#b91c1c" }}>Constraint:</span>
            <span style={{ color: "#b91c1c" }}>Equity limited</span>
          </>
        )}
      </div>
    </div>
  );
}

export function EquityChart({ series, width = 640, height = 260 }: Props) {
  const { points, exits } = series;
  const [hoveredExit, setHoveredExit] = useState<ExitSummary | null>(null);

  if (!points.length) {
    return <div style={{ fontFamily: "system-ui, sans-serif" }}>No data</div>;
  }

  const padding = { top: 20, right: 20, bottom: 32, left: 52 };

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

  const areaD =
    pathD +
    ` L ${xScale(xMax).toFixed(2)} ${yScale(0).toFixed(2)}` +
    ` L ${xScale(xMin).toFixed(2)} ${yScale(0).toFixed(2)} Z`;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((v) => ({
    v,
    y: yScale(v),
    label: `${Math.round(v * 100)}%`,
  }));

  const xTickCount = 5;
  const xTicks: { m: number; x: number; label: string }[] = [];
  for (let i = 0; i <= xTickCount; i++) {
    const m = Math.round(xMin + (i / xTickCount) * (xMax - xMin));
    xTicks.push({ m, x: xScale(m), label: fmtYear(m / 12) });
  }

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <svg
        width={width}
        height={height}
        role="img"
        aria-label="Equity ownership over time"
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient id="equity-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
          </linearGradient>
        </defs>

        <rect x={0} y={0} width={width} height={height} fill="#fafbfc" rx={6} />

        {yTicks.map((t) => (
          <g key={t.v}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={t.y}
              y2={t.y}
              stroke="#e5e7eb"
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
          stroke="#d1d5db"
          strokeWidth={1}
        />

        {xTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={t.x}
              x2={t.x}
              y1={padding.top + innerH}
              y2={padding.top + innerH + 5}
              stroke="#9ca3af"
              strokeWidth={1}
            />
            <text
              x={t.x}
              y={padding.top + innerH + 20}
              fontSize={11}
              textAnchor="middle"
              fill="#9ca3af"
              fontFamily="system-ui, sans-serif"
            >
              {t.label}
            </text>
          </g>
        ))}

        <path d={areaD} fill="url(#equity-fill)" />
        <path d={pathD} fill="none" stroke="#2563eb" strokeWidth={2.5} strokeLinejoin="round" />

        {exits.map((exit) => {
          const x = xScale(exit.month);
          const y = yScale(exit.equityPctAtSettlement);
          const color = TIMING_COLORS[exit.timing] ?? "#374151";
          const isHovered = hoveredExit?.timing === exit.timing;

          return (
            <g key={exit.timing}>
              <line
                x1={x}
                x2={x}
                y1={padding.top}
                y2={padding.top + innerH}
                stroke={color}
                strokeWidth={1}
                strokeDasharray="6 4"
                opacity={isHovered ? 0.8 : 0.35}
              />

              <circle
                cx={x}
                cy={y}
                r={isHovered ? 7 : 5}
                fill="white"
                stroke={color}
                strokeWidth={2.5}
                style={{ transition: "r 0.15s ease" }}
              />

              <text
                x={x}
                y={padding.top + innerH + 28}
                fontSize={10}
                textAnchor="middle"
                fill={color}
                fontWeight={600}
                fontFamily="system-ui, sans-serif"
              >
                {exit.timing === "standard" ? "Std" : exit.timing === "early" ? "Early" : "Late"}
              </text>

              <rect
                x={x - 20}
                y={padding.top}
                width={40}
                height={innerH}
                fill="transparent"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoveredExit(exit)}
                onMouseLeave={() => setHoveredExit(null)}
              />
            </g>
          );
        })}

        <text
          x={padding.left}
          y={14}
          fontSize={12}
          fontWeight={600}
          fill="#374151"
          fontFamily="system-ui, sans-serif"
        >
          Equity Ownership Over Time
        </text>
      </svg>

      {hoveredExit && (
        <ExitTooltip
          exit={hoveredExit}
          x={xScale(hoveredExit.month)}
          chartTop={padding.top}
        />
      )}
    </div>
  );
}
