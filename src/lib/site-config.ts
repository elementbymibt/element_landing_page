const defaultBaseUrl = "https://landing.elementbymibt.com";

function normalizeBaseUrl(input?: string) {
  if (!input) {
    return defaultBaseUrl;
  }

  const trimmed = input.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    return new URL(withProtocol).toString().replace(/\/$/, "");
  } catch {
    return defaultBaseUrl;
  }
}

export const siteConfig = {
  name: "ÉLÉMENT",
  legalName: "ÉLÉMENT (by M·I·B·T)",
  description:
    "Premium konsultacije i idejni dizajn enterijera. Rezervišite besplatne konsultacije i dobijte konkretne smernice za svoj prostor.",
  baseUrl: normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL),
  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL?.trim() || "https://calendly.com",
  contactEmail: process.env.CONTACT_EMAIL_TO?.trim() || "",
};
