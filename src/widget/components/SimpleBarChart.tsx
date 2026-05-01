import { formatCurrency } from "../format.js";

export type SimpleBar = {
  label: string;
  value: number;
};

type SimpleBarChartProps = {
  bars: SimpleBar[];
  width?: number;
  height?: number;
};

const CHART_COLORS = [
  "#16A34A", // Cash paid / cash unlocked
  "#F97316", // Buyout payout / exit cost
  "#EAB308", // Projected home value
  "#71717A", // Neutral fallback
  "#18181B", // Strong neutral fallback
];

export function SimpleBarChart({ bars, width = 400, height = 220 }: SimpleBarChartProps) {
  const maxVal = Math.max(...bars.map((b) => b.value), 1);
  const barWidth = Math.min(80, (width - 60) / bars.length - 20);
  const chartTop = 36;
  const chartBottom = height - 44;
  const chartHeight = chartBottom - chartTop;
  const barSpacing = (width - 40) / bars.length;

  const uniqueId = `bar-anim-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: "block" }}
      role="img"
      aria-label="Scenario comparison chart"
      data-testid="simple-bar-chart"
    >
      <style>{`
        @keyframes ${uniqueId} {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
      `}</style>
      <line
        x1={20}
        x2={width - 20}
        y1={chartBottom}
        y2={chartBottom}
        stroke="#e5e7eb"
        strokeWidth={1}
      />
      {bars.map((bar, i) => {
        const barH = maxVal > 0 ? (bar.value / maxVal) * chartHeight : 0;
        const x = 20 + i * barSpacing + (barSpacing - barWidth) / 2;
        const y = chartBottom - barH;
        const fill = CHART_COLORS[i % CHART_COLORS.length];

        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(barH, 2)}
              rx={6}
              ry={6}
              fill={fill}
              style={{
                transformOrigin: `${x + barWidth / 2}px ${chartBottom}px`,
                animation: `${uniqueId} 0.5s ease-out ${i * 0.1}s both`,
              }}
            />
            <text
              x={x + barWidth / 2}
              y={y - 10}
              textAnchor="middle"
              fontSize={11}
              fontWeight={600}
              fill="#111827"
              fontFamily="system-ui, sans-serif"
            >
              {formatCurrency(bar.value)}
            </text>
            <text
              x={x + barWidth / 2}
              y={chartBottom + 18}
              textAnchor="middle"
              fontSize={10}
              fill="#6b7280"
              fontFamily="system-ui, sans-serif"
            >
              {bar.label.length > 20 ? bar.label.slice(0, 18) + "\u2026" : bar.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
