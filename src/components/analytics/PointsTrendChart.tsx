import {
  Area,
  AreaChart,
  Brush,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { AnalyticsWorkoutDay } from "@/types/analytics";

interface PointsTrendChartProps {
  data: AnalyticsWorkoutDay[];
  areaLabel: string;
  formatDate?: (value: string) => string;
  formatValue?: (value: number) => string;
}

export function PointsTrendChart({ data, areaLabel, formatDate, formatValue }: PointsTrendChartProps) {
  const formatLabel = (value: string) => {
    if (formatDate) return formatDate(value);
    return value.slice(5);
  };

  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data} margin={{ left: -16 }}>
        <defs>
          <linearGradient id="pointsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickFormatter={formatLabel}
        />
        <YAxis tickLine={false} axisLine={false} allowDecimals />
        <Tooltip
          cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1 }}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid hsl(var(--border))",
            backgroundColor: "hsl(var(--popover))",
          }}
          labelFormatter={formatLabel}
          formatter={(value: number) => (formatValue ? formatValue(value) : value)}
        />
        <Area
          type="monotone"
          dataKey="points"
          name={areaLabel}
          stroke="hsl(var(--primary))"
          fill="url(#pointsGradient)"
          strokeWidth={2}
          dot={{ r: 2.5 }}
          activeDot={{ r: 4 }}
          connectNulls
        />
        <Brush height={20} travellerWidth={12} stroke="hsl(var(--primary))" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
