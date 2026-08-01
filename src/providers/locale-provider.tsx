"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";

import { useStoredValue } from "@/hooks/useStoredValue";
import {
  dictionaries,
  localeDirections,
  type Dictionary,
  type Locale,
} from "@/lib/i18n";

const STORAGE_KEY = "erm-locale";

interface LocaleContextValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  dict: Dictionary;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useStoredValue(STORAGE_KEY, "en");
  const locale: Locale = stored === "ar" ? "ar" : "en";

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = localeDirections[locale];
  }, [locale]);

  const setLocale = useCallback((next: Locale) => setStored(next), [setStored]);

  const toggleLocale = useCallback(() => {
    setStored(locale === "en" ? "ar" : "en");
  }, [locale, setStored]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      dir: localeDirections[locale],
      dict: dictionaries[locale],
      setLocale,
      toggleLocale,
    }),
    [locale, setLocale, toggleLocale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return ctx;
}
