import {
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { AnalyticsCorrelationSeries } from "@/types/analytics";

interface CorrelationScatterChartProps {
  data: AnalyticsCorrelationSeries;
  xLabel: string;
  yLabel: string;
}

export function CorrelationScatterChart({ data, xLabel, yLabel }: CorrelationScatterChartProps) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <ScatterChart margin={{ left: 12, right: 12, top: 16, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="x"
          name={xLabel}
          type="number"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          dataKey="y"
          name={yLabel}
          type="number"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
          width={36}
        />
        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid hsl(var(--border))",
            backgroundColor: "hsl(var(--popover))",
          }}
          formatter={(value: number, name: string) => [value, name]}
          labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ""}
        />
        <Legend wrapperStyle={{ paddingTop: 8 }} />
        <ReferenceLine x={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
        <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
        <Scatter
          name={`${xLabel} ↔ ${yLabel}`}
          data={data.pairs}
          fill="hsl(var(--primary))"
          shape="circle"
          r={5}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
