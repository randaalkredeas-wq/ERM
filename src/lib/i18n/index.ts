import ar from "./ar";
import en from "./en";
import type { Dictionary, Locale } from "./types";

export const dictionaries: Record<Locale, Dictionary> = { en, ar };

export const locales: Locale[] = ["en", "ar"];

export const localeDirections: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  ar: "rtl",
};

export type { Dictionary, Locale };
