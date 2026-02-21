"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

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

declare global {
  interface Window {
    Calendly?: {
      initPopupWidget: (options: { url: string }) => void;
    };
    __elementCalendlyListenerBound?: boolean;
  }
}

function isCalendlyOrigin(origin: string) {
  return /^https:\/\/([a-z0-9-]+\.)?calendly\.com$/i.test(origin);
}

function getThankYouUrl() {
  const configured = process.env.NEXT_PUBLIC_CALENDLY_THANK_YOU_URL?.trim();
  if (configured) {
    return configured;
  }

  if (typeof window !== "undefined") {
    return `${window.location.origin}/thank-you`;
  }

  return "/thank-you";
}

export function CalendlyLink({ children, className, location, ariaLabel, url }: CalendlyLinkProps) {
  const calendlyUrl = toCalendly15minUrl(url || publicConfig.bookingUrl);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!window.Calendly && !document.getElementById("calendly-widget-script")) {
      const script = document.createElement("script");
      script.id = "calendly-widget-script";
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      document.body.appendChild(script);
    }

    if (!window.__elementCalendlyListenerBound) {
      window.addEventListener("message", (event) => {
        if (!isCalendlyOrigin(event.origin)) {
          return;
        }

        const payload = event.data as { event?: string } | undefined;
        if (payload?.event === "calendly.event_scheduled") {
          window.location.replace(getThankYouUrl());
        }
      });
      window.__elementCalendlyListenerBound = true;
    }
  }, []);

  return (
    <a
      href={calendlyUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className={cn(className)}
      onClick={(event) => {
        trackEvent("cta_calendly_click", { location, page: "landing_element" });
        trackEvent("booking_click", { location, page: "landing_element" });
        trackEvent("cta_primary_click", { location, page: "landing_element" });

        if (typeof window === "undefined") {
          return;
        }

        if (typeof window.Calendly?.initPopupWidget === "function") {
          try {
            event.preventDefault();
            window.Calendly.initPopupWidget({ url: calendlyUrl });
            return;
          } catch {
            window.open(calendlyUrl, "_blank", "noopener,noreferrer");
            return;
          }
        }
      }}
    >
      {children}
    </a>
  );
}
