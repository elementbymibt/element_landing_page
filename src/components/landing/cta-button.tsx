"use client";

import { trackEvent } from "@/src/lib/analytics";
import { publicConfig } from "@/src/lib/public-config";
import { cn } from "@/src/lib/utils";

type CtaButtonProps = {
  className?: string;
  location: "hero" | "bottom";
  children: string;
};

function toCalendly15minUrl(rawUrl: string) {
  const fallback = "https://calendly.com/your-handle/15min";
  const trimmed = rawUrl.trim();

  if (!trimmed || !/calendly\.com/i.test(trimmed)) {
    return fallback;
  }

  return trimmed.replace(/\/30min(?=($|[/?#]))/i, "/15min");
}

export function CtaButton({ className, location, children }: CtaButtonProps) {
  const calendlyUrl = toCalendly15minUrl(publicConfig.bookingUrl);

  return (
    <a
      href={calendlyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex min-h-14 items-center justify-center rounded-md border border-[#B89047] bg-[#C9A35D] px-8 py-4 text-center text-base font-semibold tracking-wide text-[#3E332D] shadow-[0_4px_12px_rgba(201,163,93,0.18)] transition-all hover:-translate-y-[1px] hover:bg-[#B89047] hover:shadow-[0_8px_16px_rgba(201,163,93,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B89047] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F1EA]",
        className,
      )}
      onClick={() => {
        trackEvent("cta_calendly_click", { location, page: "landing_element" });
        trackEvent("booking_click", { location, page: "landing_element" });
        trackEvent("cta_primary_click", { location, page: "landing_element" });
      }}
    >
      {children}
    </a>
  );
}
