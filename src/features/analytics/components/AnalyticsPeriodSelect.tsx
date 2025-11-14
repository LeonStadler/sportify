import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TFunction } from "i18next";

interface AnalyticsPeriodSelectProps {
  value: string;
  onChange: (value: string) => void;
  t: TFunction;
}

export function AnalyticsPeriodSelect({ value, onChange, t }: AnalyticsPeriodSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="week">{t("stats.thisWeek")}</SelectItem>
        <SelectItem value="month">{t("stats.thisMonth")}</SelectItem>
        <SelectItem value="quarter">{t("stats.thisQuarter")}</SelectItem>
        <SelectItem value="year">{t("stats.thisYear")}</SelectItem>
      </SelectContent>
    </Select>
  );
}
