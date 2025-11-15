import { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";

export interface AnalyticsStatCardChange {
  trend: "up" | "down" | "neutral";
  label: string;
  value: string;
}

interface AnalyticsStatCardProps {
  title: string;
  value: string;
  icon?: ReactNode;
  description?: string;
  change?: AnalyticsStatCardChange | null;
  className?: string;
}

export function AnalyticsStatCard({
  title,
  value,
  icon,
  description,
  change,
  className,
}: AnalyticsStatCardProps) {
  const ChangeIcon =
    change?.trend === "up"
      ? ArrowUpRight
      : change?.trend === "down"
        ? ArrowDownRight
        : ArrowRight;

  const changeColor =
    change?.trend === "up"
      ? "text-emerald-600 dark:text-emerald-400"
      : change?.trend === "down"
        ? "text-red-600 dark:text-red-400"
        : "text-muted-foreground";

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
        {description ? (
          <p className="text-sm text-muted-foreground leading-snug">{description}</p>
        ) : null}
        {change ? (
          <div className={cn("flex items-center text-sm font-medium", changeColor)}>
            <ChangeIcon className="mr-1 h-4 w-4" />
            <span className="mr-2">{change.value}</span>
            <span className="text-muted-foreground dark:text-muted-foreground/80">{change.label}</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
