import { CalendarIcon } from "lucide-react";
import type { TFunction } from "i18next";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AnalyticsPeriodSelectProps {
  value: string;
  range?: DateRange;
  onPeriodChange: (value: string) => void;
  onRangeChange: (range: DateRange | undefined) => void;
  formatDate: (date: Date) => string;
  t: TFunction;
}

export function AnalyticsPeriodSelect({
  value,
  range,
  onPeriodChange,
  onRangeChange,
  formatDate,
  t,
}: AnalyticsPeriodSelectProps) {
  const rangeLabel = range?.from && range?.to ? `${formatDate(range.from)} → ${formatDate(range.to)}` : null;

  return (
    <div className="flex flex-wrap gap-2">
      <Select value={value} onValueChange={onPeriodChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder={t("stats.thisWeek", "This week")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="week">{t("stats.thisWeek", "This week")}</SelectItem>
          <SelectItem value="month">{t("stats.thisMonth", "This month")}</SelectItem>
          <SelectItem value="quarter">{t("stats.thisQuarter", "This quarter")}</SelectItem>
          <SelectItem value="year">{t("stats.thisYear", "This year")}</SelectItem>
          <SelectItem value="custom">{t("stats.customRange", "Custom range")}</SelectItem>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2" disabled={value !== "custom"}>
            <CalendarIcon className="h-4 w-4" />
            {rangeLabel ?? t("stats.pickRange", "Select dates")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            selected={range}
            onSelect={onRangeChange}
            numberOfMonths={2}
            disabled={(date) => date > new Date()}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
