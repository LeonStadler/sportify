import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { AnalyticsWorkoutDay } from "@/types/analytics";

export interface ActivityMetricConfig {
  key: keyof AnalyticsWorkoutDay;
  label: string;
  color: string;
}

interface ActivityTimelineChartProps {
  data: AnalyticsWorkoutDay[];
  metrics: ActivityMetricConfig[];
}

export function ActivityTimelineChart({ data, metrics }: ActivityTimelineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: string) => value.slice(5)}
        />
        <YAxis tickLine={false} axisLine={false} allowDecimals />
        <Tooltip
          cursor={{ fill: "hsl(var(--muted) / 0.35)" }}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid hsl(var(--border))",
            backgroundColor: "hsl(var(--popover))",
          }}
        />
        <Legend wrapperStyle={{ paddingTop: 8 }} />
        {metrics.map((metric) => (
          <Bar
            key={metric.key}
            dataKey={metric.key as string}
            name={metric.label}
            fill={metric.color}
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
