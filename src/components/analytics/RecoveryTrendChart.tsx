import {
  Brush,
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
  formatDate?: (value: string) => string;
  formatValue?: (key: RecoveryMetricConfig["key"], value: number) => string;
}

export function RecoveryTrendChart({ data, metrics, formatDate, formatValue }: RecoveryTrendChartProps) {
  const formatLabel = (value: string) => {
    if (formatDate) return formatDate(value);
    return value.slice(5);
  };

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickFormatter={formatLabel}
        />
        <YAxis tickLine={false} axisLine={false} domain={[0, 10]} allowDecimals />
        <Tooltip
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
        <Brush height={20} travellerWidth={12} stroke="hsl(var(--primary))" />
      </LineChart>
    </ResponsiveContainer>
  );
}
