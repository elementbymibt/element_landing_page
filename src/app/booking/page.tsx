"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

import { CalendlyLink } from "@/src/components/landing/calendly-link";
import { trackEvent } from "@/src/lib/analytics";
import { devLog } from "@/src/lib/dev-log";
import { publicConfig } from "@/src/lib/public-config";

function resolveBookingRedirectUrl(rawBookingUrl: string, rawParams: URLSearchParams) {
  try {
    const url = new URL(rawBookingUrl);

    const passKeys = ["utm_campaign", "utm_content", "utm_term", "source"];
    passKeys.forEach((key) => {
      const value = rawParams.get(key);
      if (value) {
        url.searchParams.set(key, value);
      }
    });

    return url.toString();
  } catch {
    return rawBookingUrl;
  }
}

export default function BookingPage() {
  const searchParams = useSearchParams();

  const redirectUrl = useMemo(() => {
    const raw = new URLSearchParams(searchParams.toString());
    return resolveBookingRedirectUrl(publicConfig.bookingUrl, raw);
  }, [searchParams]);

  useEffect(() => {
    trackEvent("booking_page_view", { location: "booking_page" });
    devLog("booking_page_view", { redirectUrl });
  }, [redirectUrl]);

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-3xl items-center px-5 py-16 sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(201,163,93,0.16),transparent_44%)]" />

      <section className="relative z-10 w-full rounded-[2rem] border border-brand-gold/38 bg-[linear-gradient(145deg,#24100f_0%,#3b0d18_54%,#1d090e_100%)] p-8 text-center shadow-[0_30px_80px_rgba(3,2,2,0.55)] sm:p-10">
        <p className="text-brand-gold text-xs tracking-[0.28em] uppercase">Booking</p>
        <h1 className="font-display mt-3 text-4xl text-brand-paper sm:text-5xl">Otvaramo kalendar za zakazivanje</h1>
        <p className="text-brand-paper-muted mt-3 text-sm leading-relaxed sm:text-base">
          Nalazite se na podstranici za zakazivanje: <span className="text-brand-gold">/booking</span>. Kliknite na
          dugme ispod da otvorite Calendly.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <CalendlyLink
            url={redirectUrl}
            location="booking"
            className="btn-primary rounded-full px-6 py-3 text-sm font-semibold uppercase"
            ariaLabel="Otvori kalendar za zakazivanje"
          >
            Otvori kalendar odmah
          </CalendlyLink>
          <Link href="/" className="btn-secondary rounded-full px-6 py-3 text-sm font-semibold uppercase">
            Nazad na landing
          </Link>
        </div>
      </section>
    </div>
  );
}
