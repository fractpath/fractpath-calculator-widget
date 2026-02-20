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

export function SimpleBarChart({ bars, width = 480, height = 200 }: SimpleBarChartProps) {
  const maxVal = Math.max(...bars.map((b) => b.value), 1);
  const barWidth = Math.min(80, (width - 40) / bars.length - 20);
  const chartTop = 30;
  const chartBottom = height - 40;
  const chartHeight = chartBottom - chartTop;
  const barSpacing = (width - 20) / bars.length;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: "block", margin: "0 auto" }}
      data-testid="simple-bar-chart"
    >
      {bars.map((bar, i) => {
        const barH = maxVal > 0 ? (bar.value / maxVal) * chartHeight : 0;
        const x = 10 + i * barSpacing + (barSpacing - barWidth) / 2;
        const y = chartBottom - barH;

        const colors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
        const fill = colors[i % colors.length];

        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={Math.max(barH, 1)}
              rx={4}
              fill={fill}
            />
            <text
              x={x + barWidth / 2}
              y={y - 6}
              textAnchor="middle"
              fontSize={10}
              fontWeight={600}
              fill="#374151"
              fontFamily="system-ui, sans-serif"
            >
              {formatCurrency(bar.value)}
            </text>
            <text
              x={x + barWidth / 2}
              y={chartBottom + 14}
              textAnchor="middle"
              fontSize={9}
              fill="#6b7280"
              fontFamily="system-ui, sans-serif"
            >
              {bar.label.length > 18 ? bar.label.slice(0, 16) + "…" : bar.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
