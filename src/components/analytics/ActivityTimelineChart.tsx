import {
  Bar,
  BarChart,
  CartesianGrid,
  Brush,
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
  stacked?: boolean;
  formatDate?: (value: string) => string;
  formatValue?: (key: ActivityMetricConfig["key"], value: number) => string;
}

export function ActivityTimelineChart({
  data,
  metrics,
  stacked = true,
  formatDate,
  formatValue,
}: ActivityTimelineChartProps) {
  const formatLabel = (value: string) => {
    if (formatDate) return formatDate(value);
    return value.slice(5);
  };

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickFormatter={formatLabel}
        />
        <YAxis tickLine={false} axisLine={false} allowDecimals />
        <Tooltip
          cursor={{ fill: "hsl(var(--muted) / 0.35)" }}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid hsl(var(--border))",
            backgroundColor: "hsl(var(--popover))",
          }}
          labelFormatter={formatLabel}
          formatter={(value: number, key: string) => {
            const metric = metrics.find((option) => option.key === key);
            const formattedValue = metric && formatValue ? formatValue(metric.key, value) : value;
            return [formattedValue, metric?.label ?? key];
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
            stackId={stacked ? "activity" : undefined}
          />
        ))}
        <Brush height={20} travellerWidth={12} stroke="hsl(var(--primary))" />
      </BarChart>
    </ResponsiveContainer>
  );
}
