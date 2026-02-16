"use client";

import { createContext, useContext, useMemo, useState } from "react";

import { defaultLocale, isLocale, type SiteLocale } from "@/src/lib/i18n/config";

type LocaleContextValue = {
  locale: SiteLocale;
  setLocale: (next: SiteLocale) => Promise<void>;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: SiteLocale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<SiteLocale>(initialLocale);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale: async (next) => {
        if (!isLocale(next) || next === locale) {
          return;
        }

        const response = await fetch("/api/locale", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ locale: next }),
        });

        if (!response.ok) {
          return;
        }

        setLocaleState(next);
        window.location.reload();
      },
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    return {
      locale: defaultLocale,
      setLocale: async () => {},
    };
  }

  return context;
}
