import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TFunction } from "i18next";

import { ReadinessTrendChart } from "@/components/analytics/ReadinessTrendChart";
import type { AnalyticsBalanceDay } from "@/types/analytics";

import type { AnalyticsFormatters } from "../utils/formatters";

interface AnalyticsBalanceTabProps {
  balanceData: AnalyticsBalanceDay[];
  formatters: AnalyticsFormatters;
  t: TFunction;
}

export function AnalyticsBalanceTab({ balanceData, formatters, t }: AnalyticsBalanceTabProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("stats.readinessTrend")}</CardTitle>
        </CardHeader>
        <CardContent>
          {balanceData.length ? (
            <ReadinessTrendChart
              data={balanceData}
              readinessLabel={t("stats.readinessLabel")}
              pointsLabel={t("stats.points")}
              formatDate={(value) => formatters.formatRangeDate(value)}
              formatPoints={(value) => formatters.formatInteger(Math.round(value))}
              formatReadiness={(value) => formatters.formatDecimal(value, 1)}
            />
          ) : (
            <p className="text-sm text-muted-foreground">{t("stats.noBalanceData")}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("stats.balanceSummary")}</CardTitle>
        </CardHeader>
        <CardContent>
          {balanceData.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-muted-foreground">
                  <tr className="text-left">
                    <th className="py-2 pr-4 font-medium">{t("stats.date")}</th>
                    <th className="py-2 pr-4 font-medium">{t("stats.points")}</th>
                    <th className="py-2 pr-4 font-medium">{t("stats.totalWorkouts")}</th>
                    <th className="py-2 pr-4 font-medium">{t("stats.readinessLabel")}</th>
                  </tr>
                </thead>
                <tbody>
                  {balanceData.map((entry) => (
                    <tr key={entry.date} className="border-t border-border/40">
                      <td className="py-2 pr-4">{formatters.formatRangeDate(entry.date)}</td>
                      <td className="py-2 pr-4">{formatters.formatInteger(entry.points)}</td>
                      <td className="py-2 pr-4">{formatters.formatInteger(entry.workouts)}</td>
                      <td className="py-2 pr-4">
                        {entry.readinessScore !== null && entry.readinessScore !== undefined
                          ? formatters.formatDecimal(entry.readinessScore, 1)
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("stats.noRecoveryData")}</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
