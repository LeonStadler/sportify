import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { AnalyticsBalanceDay } from "@/types/analytics";

interface ReadinessTrendChartProps {
  data: AnalyticsBalanceDay[];
  readinessLabel: string;
  pointsLabel: string;
}

export function ReadinessTrendChart({
  data,
  readinessLabel,
  pointsLabel,
}: ReadinessTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: string) => value.slice(5)}
        />
        <YAxis yAxisId="points" orientation="left" tickLine={false} axisLine={false} />
        <YAxis
          yAxisId="readiness"
          orientation="right"
          tickLine={false}
          axisLine={false}
          domain={[0, 100]}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: "1px solid hsl(var(--border))",
            backgroundColor: "hsl(var(--popover))",
          }}
        />
        <Legend wrapperStyle={{ paddingTop: 8 }} />
        <Bar
          yAxisId="points"
          dataKey="points"
          name={pointsLabel}
          fill="hsl(var(--muted-foreground))"
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
        />
        <Line
          yAxisId="readiness"
          type="monotone"
          dataKey="readinessScore"
          name={readinessLabel}
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ r: 2.5 }}
          activeDot={{ r: 4 }}
          connectNulls
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
