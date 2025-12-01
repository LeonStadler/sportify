import {
  addDays,
  addMonths,
  addQuarters,
  addWeeks,
  addYears,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
} from "date-fns";
import type { DateRange } from "react-day-picker";

export type PresetPeriod = "all" | "week" | "month" | "quarter" | "year" | "custom" | string;

export const toDateParam = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getRangeForPeriod = (
  period: PresetPeriod,
  customRange?: DateRange | null,
  offset = 0
): DateRange | undefined => {
  if (period === "custom") {
    return customRange ?? undefined;
  }

  const now = new Date();

  switch (period) {
    case "week":
      return buildFixedRange(startOfWeek(addWeeks(now, -offset), { weekStartsOn: 1 }), addWeeks);
    case "month":
      return buildFixedRange(startOfMonth(addMonths(now, -offset)), addMonths);
    case "quarter":
      return buildFixedRange(startOfQuarter(addQuarters(now, -offset)), addQuarters);
    case "year":
      return buildFixedRange(startOfYear(addYears(now, -offset)), addYears);
    default:
      return undefined;
  }
};

const buildFixedRange = (
  start: Date,
  addFn: (date: Date, amount: number) => Date
): DateRange => {
  const from = start;
  const to = addFn(start, 1);
  return { from, to: addDays(to, -1) };
};

export const getNormalizedRange = (range?: DateRange | null): DateRange | undefined => {
  if (!range?.from || !range?.to) return undefined;
  const from = range.from < range.to ? range.from : range.to;
  const to = range.to > range.from ? range.to : range.from;
  return { from, to };
};
