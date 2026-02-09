TICKET WGT-011 — Chart series + visualization

Objective
Generate chart series from calc engine outputs and render a minimal chart (equity over time + settlement summary).

Non-goals
- No new math beyond transforming outputs into chart-ready data.

Deliverables
- shared/calc/chart.ts buildChartSeries(inputs, outputs)
- client/components/EquityChart.tsx (or equivalent)

Acceptance Criteria
- Chart renders with default inputs
- Shows equity ownership over time
- Shows an "exit year" summary representation (marker/tooltip or secondary series)
