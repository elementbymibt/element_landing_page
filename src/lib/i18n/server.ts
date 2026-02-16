import { cookies } from "next/headers";

import { defaultLocale, isLocale, type SiteLocale, localeCookieName } from "@/src/lib/i18n/config";

export async function getCurrentLocale(): Promise<SiteLocale> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(localeCookieName)?.value;

  if (isLocale(raw)) {
    return raw;
  }

  return defaultLocale;
}

export function textByLocale<T>(locale: SiteLocale, copy: { sr: T; en: T }): T {
  return locale === "en" ? copy.en : copy.sr;
}
