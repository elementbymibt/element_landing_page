export type HeroVariant = "A" | "B";

const HERO_VARIANT_COOKIE = "element_hero_variant";
const MAX_AGE = 60 * 60 * 24 * 180;

function parseCookieValue(cookieName: string) {
  if (typeof document === "undefined") {
    return null;
  }

  const pair = document.cookie
    .split(";")
    .map((chunk) => chunk.trim())
    .find((chunk) => chunk.startsWith(`${cookieName}=`));

  if (!pair) {
    return null;
  }

  return decodeURIComponent(pair.split("=")[1] || "");
}

export function getOrCreateHeroVariant(): HeroVariant {
  const existing = parseCookieValue(HERO_VARIANT_COOKIE);

  if (existing === "A" || existing === "B") {
    return existing;
  }

  const variant: HeroVariant = Math.random() < 0.5 ? "A" : "B";

  if (typeof document !== "undefined") {
    document.cookie = `${HERO_VARIANT_COOKIE}=${variant}; max-age=${MAX_AGE}; path=/; samesite=lax`;
  }

  return variant;
}
