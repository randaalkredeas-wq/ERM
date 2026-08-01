import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number, locale: string = "en-US") {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Manual compact-number formatting instead of Intl's `notation: "compact"` —
 * that option can render a different string on the server (Node's ICU) than
 * on the client (the browser's ICU), causing a hydration mismatch.
 */
export function formatCurrency(value: number, locale: string = "en-US") {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);

  let abbreviated: string;
  if (abs >= 1_000_000_000) {
    abbreviated = `${formatNumber(Math.round((abs / 1_000_000_000) * 10) / 10, locale)}B`;
  } else if (abs >= 1_000_000) {
    abbreviated = `${formatNumber(Math.round((abs / 1_000_000) * 10) / 10, locale)}M`;
  } else if (abs >= 1_000) {
    abbreviated = `${formatNumber(Math.round((abs / 1_000) * 10) / 10, locale)}K`;
  } else {
    abbreviated = formatNumber(Math.round(abs), locale);
  }

  return `SAR ${sign}${abbreviated}`;
}

export function formatDate(
  value: string | Date,
  locale: string = "en-US",
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  },
) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
