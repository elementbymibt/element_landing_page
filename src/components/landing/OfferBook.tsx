"use client";

import { useInView } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { BookChapter } from "@/src/components/landing/BookChapter";
import { BookingButton } from "@/src/components/landing/booking-button";
import { FollowElementLinks } from "@/src/components/landing/FollowElementLinks";
import { IntakeButton } from "@/src/components/landing/intake-button";
import { heroVariantContent } from "@/src/data/landing-content";
import { trackEvent } from "@/src/lib/analytics";
import { devLog } from "@/src/lib/dev-log";
import { getOrCreateHeroVariant } from "@/src/lib/hero-variant";
import { persistUtmCookie, readUtmFromSearch, resolveMessageMatch } from "@/src/lib/utm";

export function OfferBook() {
  const searchParams = useSearchParams();
  const [heroVariant] = useState(() => getOrCreateHeroVariant());
  const hasTrackedMessageMatch = useRef(false);
  const hasTrackedHeroVariant = useRef(false);

  const selectedHeroCopy = heroVariantContent[heroVariant];
  const queryString = searchParams.toString();

  const utmPayload = useMemo(() => {
    const raw = new URLSearchParams(queryString);
    return readUtmFromSearch(raw);
  }, [queryString]);

  const messageMatch = useMemo(
    () => resolveMessageMatch(utmPayload.term, selectedHeroCopy.subheadline),
    [utmPayload.term, selectedHeroCopy.subheadline],
  );

  const riskRef = useRef<HTMLParagraphElement | null>(null);
  const riskInView = useInView(riskRef, { once: true, amount: 0.8 });

  useEffect(() => {
    if (hasTrackedMessageMatch.current) {
      return;
    }

    hasTrackedMessageMatch.current = true;

    persistUtmCookie(utmPayload);

    trackEvent("message_match_variant", {
      variant: messageMatch.key,
      utm_term: utmPayload.term || "none",
    });

    devLog("message_match_variant", {
      variant: messageMatch.key,
      utmTerm: utmPayload.term || "none",
    });
  }, [messageMatch.key, utmPayload]);

  useEffect(() => {
    if (hasTrackedHeroVariant.current) {
      return;
    }

    hasTrackedHeroVariant.current = true;

    if (heroVariant === "A") {
      trackEvent("hero_variant_a_view", { variant: "A" });
    } else {
      trackEvent("hero_variant_b_view", { variant: "B" });
    }

    devLog("hero_variant", {
      variant: heroVariant,
    });
  }, [heroVariant]);

  useEffect(() => {
    if (!riskInView) {
      return;
    }

    trackEvent("risk_reversal_view", {
      variant: heroVariant,
    });

    devLog("risk_reversal_view", {
      variant: heroVariant,
    });
  }, [riskInView, heroVariant]);

  return (
    <div className="space-y-10">
      <BookChapter
        chapter="POGLAVLJE 01"
        title={selectedHeroCopy.headline}
        subtitle={messageMatch.subheadline}
        left={
          <div className="space-y-5">
            <div className="inline-flex items-center rounded-full border border-brand-gold/45 bg-brand-ink/65 px-4 py-2 text-xs tracking-[0.24em] uppercase text-brand-gold">
              {selectedHeroCopy.badge}
            </div>

            <div className="rounded-2xl border border-brand-gold/36 bg-brand-ink/52 px-4 py-3 text-sm text-brand-paper">
              Prvih 10 klijenata aktivira premium cenu 25€/m2 + dodatnu bonus vrednost.
            </div>

            <p className="text-brand-paper-muted text-sm leading-relaxed sm:text-base">Jedan poziv. Jasan pravac. Bez lutanja i skupih gresaka.</p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <BookingButton location="hero_primary" />
              <IntakeButton location="hero_secondary" />
            </div>

            <p ref={riskRef} className="text-brand-paper-muted text-xs leading-relaxed sm:text-sm">
              Na konsultacijama dobijate 3 konkretna saveta - ili dodajemo jos 15 minuta gratis.
            </p>
          </div>
        }
        right={
          <div className="space-y-4">
            <div className="rounded-3xl border border-brand-gold/40 bg-[linear-gradient(145deg,#3b0d18_0%,#2a0912_54%,#3b0d18_100%)] px-5 py-5 text-center shadow-[0_16px_42px_rgba(35,10,18,0.5)]">
              <p className="font-display text-4xl leading-none text-brand-gold sm:text-5xl">ELEMENT</p>
              <p className="text-brand-paper-muted mt-2 text-xs tracking-[0.28em] uppercase">by M | I | B | T</p>
            </div>

            <div className="grid gap-2">
              {[
                "Premium koncept + 3D vizualizacija",
                "Raspored instalacija i rasvete",
                "3 saveta dobijate odmah na konsultacijama",
              ].map((line) => (
                <div key={line} className="rounded-2xl border border-brand-gold/24 bg-brand-ink/45 px-4 py-3 text-sm text-brand-paper-muted">
                  {line}
                </div>
              ))}
            </div>

            <FollowElementLinks location="hero_follow" />
          </div>
        }
      />
    </div>
  );
}
