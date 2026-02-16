export type UtmPayload = {
  campaign: string;
  content: string;
  term: string;
};

export type MessageMatchVariant = {
  key: string;
  subheadline: string;
};

const UTM_COOKIE = "element_utm_capture";
const MAX_AGE = 60 * 60 * 24 * 30;

function readParam(params: URLSearchParams, key: string) {
  return (params.get(key) ?? "").trim();
}

export function readUtmFromSearch(params: URLSearchParams): UtmPayload {
  return {
    campaign: readParam(params, "utm_campaign"),
    content: readParam(params, "utm_content"),
    term: readParam(params, "utm_term"),
  };
}

export function persistUtmCookie(utm: UtmPayload) {
  if (typeof document === "undefined") {
    return;
  }

  const hasAny = utm.campaign || utm.content || utm.term;

  if (!hasAny) {
    return;
  }

  const value = encodeURIComponent(JSON.stringify(utm));
  document.cookie = `${UTM_COOKIE}=${value}; max-age=${MAX_AGE}; path=/; samesite=lax`;
}

const rules: Array<{ key: string; pattern: RegExp; subheadline: string }> = [
  {
    key: "kitchen",
    pattern: /kitchen|kuhinj/i,
    subheadline: "Kuhinja koja radi savrseno svaki dan - bez gresaka u rasporedu.",
  },
  {
    key: "apartment",
    pattern: /apartment|stan\b|flat\b/i,
    subheadline: "Stan koji izgleda luksuzno i funkcionise bez kompromisa.",
  },
  {
    key: "office",
    pattern: /office|kancelar|poslovn/i,
    subheadline: "Poslovni prostor koji podize utisak i ubrzava svakodnevni rad.",
  },
  {
    key: "small_space",
    pattern: /55m2|\b[0-9]{2}m2\b|small|mali\s+stan/i,
    subheadline: "Pametan raspored i premium osecaj cak i u manjoj kvadraturi.",
  },
];

export function resolveMessageMatch(term: string, fallbackSubheadline: string): MessageMatchVariant {
  const normalized = term.trim();

  for (const rule of rules) {
    if (rule.pattern.test(normalized)) {
      return {
        key: rule.key,
        subheadline: rule.subheadline,
      };
    }
  }

  return {
    key: "default",
    subheadline: fallbackSubheadline,
  };
}

export function getUtmCookieName() {
  return UTM_COOKIE;
}

export function parseUtmCookieValue(raw: string | undefined): UtmPayload | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<UtmPayload>;
    return {
      campaign: typeof parsed.campaign === "string" ? parsed.campaign : "",
      content: typeof parsed.content === "string" ? parsed.content : "",
      term: typeof parsed.term === "string" ? parsed.term : "",
    };
  } catch {
    return null;
  }
}
