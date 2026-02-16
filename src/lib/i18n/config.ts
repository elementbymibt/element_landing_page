export const localeOptions = ["sr", "en"] as const;
export type SiteLocale = (typeof localeOptions)[number];

export const defaultLocale: SiteLocale = "sr";
export const localeCookieName = "element_locale";

export function isLocale(value: unknown): value is SiteLocale {
  return typeof value === "string" && localeOptions.includes(value as SiteLocale);
}
