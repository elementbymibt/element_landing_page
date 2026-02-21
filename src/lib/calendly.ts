const CALENDLY_FALLBACK = "https://calendly.com/your-handle/15min";

export function toCalendly15minUrl(rawUrl: string | undefined | null) {
  const trimmed = String(rawUrl ?? "").trim();

  if (!trimmed || !/calendly\.com/i.test(trimmed)) {
    return CALENDLY_FALLBACK;
  }

  return trimmed.replace(/\/30min(?=($|[/?#]))/i, "/15min");
}

