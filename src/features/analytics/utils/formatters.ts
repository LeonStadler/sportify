import { format as formatDate } from "date-fns";
import type { Locale } from "date-fns";
import type { TFunction } from "i18next";

import type { AnalyticsDelta } from "@/types/analytics";

export interface AnalyticsFormatters {
  formatInteger: (value: number) => string;
  formatDecimal: (value: number, digits?: number) => string;
  formatDurationMinutes: (minutes: number) => string;
  formatRangeDate: (value: string | null) => string;
  formatChange: (
    change?: AnalyticsDelta | null,
    options?: { digits?: number; isDuration?: boolean },
  ) => string | null;
}

interface FormatterOptions {
  language: string;
  locale: Locale;
  t: TFunction;
}

export const createAnalyticsFormatters = ({
  language,
  locale,
  t,
}: FormatterOptions): AnalyticsFormatters => {
  const integerFormatter = new Intl.NumberFormat(language, {
    maximumFractionDigits: 0,
  });

  const decimalFormatters = new Map<number, Intl.NumberFormat>();
  const getDecimalFormatter = (digits: number) => {
    if (!decimalFormatters.has(digits)) {
      decimalFormatters.set(
        digits,
        new Intl.NumberFormat(language, {
          minimumFractionDigits: digits,
          maximumFractionDigits: digits,
        }),
      );
    }
    return decimalFormatters.get(digits)!;
  };

  const formatInteger = (value: number) =>
    integerFormatter.format(Math.round(value));

  const formatDecimal = (value: number, digits = 1) =>
    getDecimalFormatter(digits).format(value);

  const formatDurationMinutes = (minutes: number) => {
    const totalMinutes = Math.round(Math.abs(minutes));
    const hours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    if (hours > 0) {
      return t("training.duration.hours", {
        hours,
        minutes: remainingMinutes,
      });
    }

    return t("training.duration.minutes", {
      minutes: remainingMinutes,
    });
  };

  const formatRangeDate = (value: string | null) => {
    if (!value) return "—";
    return formatDate(new Date(value), "PPP", { locale });
  };

  const formatChange = (
    change?: AnalyticsDelta | null,
    options?: { digits?: number; isDuration?: boolean },
  ) => {
    if (!change) return null;
    const digits = options?.digits ?? 0;
    const isDuration = options?.isDuration ?? false;

    const sign = change.difference > 0 ? "+" : change.difference < 0 ? "-" : "";
    const absoluteDifference = Math.abs(change.difference);

    const differenceText = isDuration
      ? `${sign}${formatDurationMinutes(absoluteDifference)}`
      : `${sign}${digits > 0 ? formatDecimal(absoluteDifference, digits) : formatInteger(absoluteDifference)}`;

    const percent = change.percent;
    const percentText =
      percent !== null && percent !== undefined
        ? ` (${percent > 0 ? "+" : percent < 0 ? "-" : ""}${formatDecimal(Math.abs(percent), 1)}%)`
        : "";

    return `${differenceText}${percentText}`;
  };

  return {
    formatInteger,
    formatDecimal,
    formatDurationMinutes,
    formatRangeDate,
    formatChange,
  };
};
