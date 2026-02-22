"use client";

import Link from "next/link";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

import { trackEvent } from "@/src/lib/analytics";
import { devLog } from "@/src/lib/dev-log";
import { toCalendly15minUrl } from "@/src/lib/calendly";
import { publicConfig } from "@/src/lib/public-config";

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
        prefill?: Record<string, string>;
        utm?: Record<string, string>;
      }) => void;
    };
    __elementCalendlyBookingBound?: boolean;
  }
}

function resolveBookingUrl(rawBookingUrl: string, rawParams: URLSearchParams) {
  const safeBase = toCalendly15minUrl(rawBookingUrl);

  try {
    const url = new URL(safeBase);
    const passKeys = ["utm_campaign", "utm_content", "utm_term", "utm_source", "utm_medium", "source"];

    passKeys.forEach((key) => {
      const value = rawParams.get(key);
      if (value) {
        url.searchParams.set(key, value);
      }
    });

    return url.toString();
  } catch {
    return safeBase;
  }
}

function isCalendlyOrigin(origin: string) {
  return /^https:\/\/([a-z0-9-]+\.)?calendly\.com$/i.test(origin);
}

export default function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inlineContainerRef = useRef<HTMLDivElement | null>(null);

  const bookingUrl = useMemo(() => {
    const raw = new URLSearchParams(searchParams.toString());
    return resolveBookingUrl(publicConfig.bookingUrl, raw);
  }, [searchParams]);

  useEffect(() => {
    trackEvent("booking_page_view", { location: "booking_page" });
    devLog("booking_page_view", { bookingUrl });
  }, [bookingUrl]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!window.__elementCalendlyBookingBound) {
      window.addEventListener("message", (event) => {
        if (!isCalendlyOrigin(event.origin)) {
          return;
        }

        const payload = event.data as { event?: string } | undefined;
        if (payload?.event === "calendly.event_scheduled") {
          trackEvent("booking_click", { location: "booking_completed", page: "landing_element" });
          router.replace("/thank-you?from=calendly");
        }
      });
      window.__elementCalendlyBookingBound = true;
    }
  }, [router]);

  useEffect(() => {
    if (!inlineContainerRef.current || typeof window === "undefined" || !window.Calendly?.initInlineWidget) {
      return;
    }

    inlineContainerRef.current.innerHTML = "";
    window.Calendly.initInlineWidget({
      url: bookingUrl,
      parentElement: inlineContainerRef.current,
    });
  }, [bookingUrl]);

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <style jsx global>{`
        .element-calendly-inline,
        .element-calendly-inline iframe {
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>

      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (!inlineContainerRef.current || typeof window === "undefined" || !window.Calendly?.initInlineWidget) {
            return;
          }

          inlineContainerRef.current.innerHTML = "";
          window.Calendly.initInlineWidget({
            url: bookingUrl,
            parentElement: inlineContainerRef.current,
          });
        }}
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(201,163,93,0.14),transparent_44%)]" />

      <section className="relative z-10 mx-auto w-full rounded-[2rem] border border-brand-gold/35 bg-[linear-gradient(145deg,#24100f_0%,#3b0d18_54%,#1d090e_100%)] p-5 shadow-[0_30px_80px_rgba(3,2,2,0.55)] sm:p-8">
        <div className="mb-5 text-center sm:mb-6">
          <p className="text-brand-gold text-xs tracking-[0.28em] uppercase">Booking</p>
          <h1 className="font-display mt-3 text-4xl text-brand-paper sm:text-5xl">Izaberite termin konsultacija</h1>
          <p className="text-brand-paper-muted mt-3 text-sm leading-relaxed sm:text-base">
            Nakon potvrde termina automatski idete na stranicu potvrde.
          </p>
        </div>

        <div
          className="overflow-hidden rounded-2xl border border-brand-gold/28 bg-brand-paper"
          style={{ height: "min(780px, calc(100svh - 190px))", minHeight: 540 }}
        >
          <div ref={inlineContainerRef} className="element-calendly-inline h-full w-full" />
        </div>

        <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href={bookingUrl}
            className="btn-primary inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold uppercase"
          >
            Otvori Calendly direktno
          </a>
          <Link href="/" className="btn-secondary inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold uppercase">
            Nazad na landing
          </Link>
        </div>
      </section>
    </div>
  );
}
