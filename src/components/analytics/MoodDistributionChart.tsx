import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type { AnalyticsMoodDistributionEntry } from "@/types/analytics";

interface MoodDistributionChartProps {
  data: AnalyticsMoodDistributionEntry[];
}

const COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f97316",
  "#a855f7",
  "#ef4444",
  "#14b8a6",
  "#f59e0b",
  "#6366f1",
];

export function MoodDistributionChart({ data }: MoodDistributionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="percentage"
          nameKey="mood"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={4}
          label={({ payload }) =>
            `${payload.mood}: ${payload.percentage.toFixed(1)}%`
          }
        >
          {data.map((entry, index) => (
            <Cell key={entry.mood} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string) => [
            `${value.toFixed(1)}%`,
            name,
          ]}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid hsl(var(--border))",
            backgroundColor: "hsl(var(--popover))",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
