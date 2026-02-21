"use client";

import type { ReactNode } from "react";

import { trackEvent } from "@/src/lib/analytics";
import { toCalendly15minUrl } from "@/src/lib/calendly";
import { publicConfig } from "@/src/lib/public-config";
import { cn } from "@/src/lib/utils";

type CalendlyLinkProps = {
  children: ReactNode;
  className?: string;
  location: "hero" | "bottom" | "price" | "booking";
  ariaLabel?: string;
  url?: string;
};

export function CalendlyLink({ children, className, location, ariaLabel, url }: CalendlyLinkProps) {
  const calendlyUrl = toCalendly15minUrl(url || publicConfig.bookingUrl);

  return (
    <a
      href={calendlyUrl}
      aria-label={ariaLabel}
      className={cn(className)}
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
