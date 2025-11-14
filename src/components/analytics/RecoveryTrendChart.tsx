import {
  Legend,
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { AnalyticsRecoveryDay } from "@/types/analytics";

export interface RecoveryMetricConfig {
  key: keyof AnalyticsRecoveryDay;
  label: string;
  color: string;
}

interface RecoveryTrendChartProps {
  data: AnalyticsRecoveryDay[];
  metrics: RecoveryMetricConfig[];
}

export function RecoveryTrendChart({ data, metrics }: RecoveryTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: string) => value.slice(5)}
        />
        <YAxis tickLine={false} axisLine={false} domain={[0, 10]} allowDecimals />
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: "1px solid hsl(var(--border))",
            backgroundColor: "hsl(var(--popover))",
          }}
        />
        <Legend wrapperStyle={{ paddingTop: 8 }} />
        {metrics.map((metric) => (
          <Line
            key={metric.key}
            dataKey={metric.key as string}
            name={metric.label}
            stroke={metric.color}
            type="monotone"
            strokeWidth={2}
            dot={false}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
