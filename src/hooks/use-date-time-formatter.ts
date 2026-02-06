import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";

type DateInput = Date | string | number | null | undefined;

const toValidDate = (value: DateInput) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

export const useDateTimeFormatter = () => {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const language =
    user?.languagePreference === "en" || i18n.language === "en" ? "en" : "de";
  const locale = language === "en" ? "en-US" : "de-DE";
  const timeFormat = user?.preferences?.timeFormat === "12h" ? "12h" : "24h";
  const hour12 = timeFormat === "12h";

  const formatDate = (
    value: DateInput,
    options?: Intl.DateTimeFormatOptions
  ) => {
    const date = toValidDate(value);
    if (!date) return "";
    return date.toLocaleDateString(locale, options);
  };

  const formatDateTime = (
    value: DateInput,
    options?: Intl.DateTimeFormatOptions
  ) => {
    const date = toValidDate(value);
    if (!date) return "";
    return date.toLocaleString(locale, { ...options, hour12 });
  };

  const formatTime = (
    value: DateInput,
    options?: Intl.DateTimeFormatOptions
  ) => {
    const date = toValidDate(value);
    if (!date) return "";
    return date.toLocaleTimeString(locale, { ...options, hour12 });
  };

  return { locale, timeFormat, formatDate, formatDateTime, formatTime };
};
