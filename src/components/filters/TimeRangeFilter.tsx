import {
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  endOfYear,
  format as formatDateFns,
  getISOWeek,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
} from "date-fns";
import { de, enUS } from "date-fns/locale";
import type { TFunction } from "i18next";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TimeRangeFilterProps {
  period: string;
  onPeriodChange: (value: string) => void;
  range?: DateRange;
  onRangeChange?: (range: DateRange | undefined) => void;
  /** Offset für die Navigation (0 = aktuell, 1 = vorherige Periode, etc.) */
  offset?: number;
  onOffsetChange?: (offset: number) => void;
  t: TFunction;
  /** Aktuelle Sprache für Datumsformatierung */
  locale?: string;
  presets?: Array<{ value: string; label: string }>;
  formatDate?: (date: Date) => string;
  className?: string;
  disabled?: boolean;
}

/** Gibt einen lesbaren Label für die aktuelle Periode + Offset zurück */
function getPeriodLabel(
  period: string,
  offset: number,
  t: TFunction,
  locale: string
): string {
  const now = new Date();
  const dateLocale = locale === "en" ? enUS : de;

  switch (period) {
    case "week": {
      const baseDate = new Date(now);
      baseDate.setDate(now.getDate() - offset * 7);
      const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(baseDate, { weekStartsOn: 1 });
      const weekNum = getISOWeek(weekStart);

      if (offset === 0) {
        return t("filters.period.currentWeek", "Aktuelle Woche");
      }
      // Format: "KW 48 (25.11. - 01.12.)"
      return `KW ${weekNum} (${formatDateFns(weekStart, "dd.MM.", { locale: dateLocale })} - ${formatDateFns(weekEnd, "dd.MM.", { locale: dateLocale })})`;
    }
    case "month": {
      const baseDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      if (offset === 0) {
        return t("filters.period.currentMonth", "Aktueller Monat");
      }
      // Format: "November 2024"
      return formatDateFns(baseDate, "MMMM yyyy", { locale: dateLocale });
    }
    case "quarter": {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const targetQuarter = currentQuarter - offset;
      const targetYear =
        now.getFullYear() + Math.floor(targetQuarter / 4) * (targetQuarter < 0 ? 1 : 1);
      const adjustedQuarter = ((targetQuarter % 4) + 4) % 4;

      const quarterDate = new Date(targetYear, adjustedQuarter * 3, 1);
      const quarterStart = startOfQuarter(quarterDate);

      if (offset === 0) {
        return t("filters.period.currentQuarter", "Aktuelles Quartal");
      }
      // Format: "Q3 2024"
      const q = Math.floor(quarterStart.getMonth() / 3) + 1;
      return `Q${q} ${quarterStart.getFullYear()}`;
    }
    case "year": {
      const targetYear = now.getFullYear() - offset;
      if (offset === 0) {
        return t("filters.period.currentYear", "Aktuelles Jahr");
      }
      return `${targetYear}`;
    }
    default:
      return t("filters.period.all", "Gesamte Zeit");
  }
}

/** Gibt das Start- und Enddatum für Tooltip zurück */
function getPeriodDateRange(
  period: string,
  offset: number,
  locale: string
): string | null {
  const now = new Date();
  const dateLocale = locale === "en" ? enUS : de;

  let from: Date;
  let to: Date;

  switch (period) {
    case "week": {
      const baseDate = new Date(now);
      baseDate.setDate(now.getDate() - offset * 7);
      from = startOfWeek(baseDate, { weekStartsOn: 1 });
      to = endOfWeek(baseDate, { weekStartsOn: 1 });
      break;
    }
    case "month": {
      const baseDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      from = startOfMonth(baseDate);
      to = endOfMonth(baseDate);
      break;
    }
    case "quarter": {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const targetQuarter = currentQuarter - offset;
      const yearsBack = Math.floor((-targetQuarter + 3) / 4);
      const adjustedQuarter = ((targetQuarter % 4) + 4) % 4;
      const targetYear = now.getFullYear() - yearsBack;

      const quarterDate = new Date(targetYear, adjustedQuarter * 3, 1);
      from = startOfQuarter(quarterDate);
      to = endOfQuarter(quarterDate);
      break;
    }
    case "year": {
      const targetYear = now.getFullYear() - offset;
      from = startOfYear(new Date(targetYear, 0, 1));
      to = endOfYear(new Date(targetYear, 0, 1));
      break;
    }
    default:
      return null;
  }

  return `${formatDateFns(from, "dd.MM.yyyy", { locale: dateLocale })} - ${formatDateFns(to, "dd.MM.yyyy", { locale: dateLocale })}`;
}

export function TimeRangeFilter({
  period,
  onPeriodChange,
  range,
  onRangeChange,
  offset = 0,
  onOffsetChange,
  t,
  locale = "de",
  presets,
  formatDate,
  className,
  disabled,
}: TimeRangeFilterProps) {
  const presetOptions = presets ?? [
    { value: "all", label: t("filters.period.all", "Gesamte Zeit") },
    { value: "week", label: t("filters.period.week", "Woche") },
    { value: "month", label: t("filters.period.month", "Monat") },
    { value: "quarter", label: t("filters.period.quarter", "Quartal") },
    { value: "year", label: t("filters.period.year", "Jahr") },
    { value: "custom", label: t("filters.period.custom", "Benutzerdefiniert") },
  ];

  const format = formatDate ?? ((date: Date) => date.toLocaleDateString());
  const rangeLabel =
    range?.from && range?.to
      ? `${format(range.from)} → ${format(range.to)}`
      : t("filters.rangePlaceholder", "Zeitraum wählen");

  const isCustom = period === "custom";
  const isAll = period === "all";
  const canNavigate = !isCustom && !isAll && onOffsetChange;
  const [isCalendarOpen, setIsCalendarOpen] = useState(isCustom);

  const handlePrevious = () => {
    if (onOffsetChange) {
      onOffsetChange(offset + 1);
    }
  };

  const handleNext = () => {
    if (onOffsetChange && offset > 0) {
      onOffsetChange(offset - 1);
    }
  };

  const handlePeriodChange = (value: string) => {
    onPeriodChange(value);
    // Reset offset when changing period
    if (onOffsetChange) {
      onOffsetChange(0);
    }
    if (value === "custom") {
      setIsCalendarOpen(true);
    } else {
      setIsCalendarOpen(false);
    }
  };

  const handleRangeChange = (value: DateRange | undefined) => {
    onRangeChange?.(value);
    if (value?.from && value?.to) {
      setIsCalendarOpen(false);
    }
  };

  const periodLabel = canNavigate
    ? getPeriodLabel(period, offset, t, locale)
    : null;
  const dateRangeTooltip = canNavigate
    ? getPeriodDateRange(period, offset, locale)
    : null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {/* Period Selector */}
      <Select
        value={period}
        onValueChange={handlePeriodChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-auto min-w-[120px]">
          <SelectValue aria-label={t("filters.periodLabel", "Zeitraum")} />
        </SelectTrigger>
        <SelectContent>
          {presetOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Navigation Controls */}
      {canNavigate && (
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handlePrevious}
                disabled={disabled}
                aria-label={t("filters.previous", "Vorherige")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {t("filters.previousPeriod", "Vorherige Periode")}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="px-2 py-1 min-w-[140px] text-center">
                <span className="text-sm font-medium">{periodLabel}</span>
              </div>
            </TooltipTrigger>
            {dateRangeTooltip && (
              <TooltipContent>{dateRangeTooltip}</TooltipContent>
            )}
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleNext}
                disabled={disabled || offset === 0}
                aria-label={t("filters.next", "Nächste")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {offset === 0
                ? t("filters.alreadyCurrent", "Bereits aktuell")
                : t("filters.nextPeriod", "Nächste Periode")}
            </TooltipContent>
          </Tooltip>

          <Button
            variant="outline"
            size="sm"
            className="ml-1"
            onClick={() => onOffsetChange?.(0)}
            disabled={disabled || offset === 0}
          >
            {t("filters.current", "Aktuell")}
          </Button>
        </div>
      )}

      {/* Custom Date Range Picker */}
      {onRangeChange && isCustom && (
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              disabled={disabled}
            >
              <CalendarIcon className="h-4 w-4" />
              <span>{rangeLabel}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              selected={range}
              onSelect={handleRangeChange}
              numberOfMonths={2}
              disabled={(date) => date > new Date()}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
