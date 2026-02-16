"use client";

import { motion, useInView } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { BookChapter } from "@/src/components/landing/BookChapter";
import { BookingButton } from "@/src/components/landing/booking-button";
import { GoldFrameBonusPage } from "@/src/components/landing/GoldFrameBonusPage";
import { IntakeButton } from "@/src/components/landing/intake-button";
import { ScarcityCounter } from "@/src/components/landing/scarcity-counter";
import { StackedBulletCards } from "@/src/components/landing/StackedBulletCards";
import { chapter02Cards, chapter03Items, chapter04Items, heroVariantContent } from "@/src/data/landing-content";
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

            <ScarcityCounter />

            <p className="text-brand-paper-muted text-sm leading-relaxed sm:text-base">
              Svi oglasi vode direktno na ovu stranicu sa jednim ciljem: da brzo dodjete do jasnog plana i sledeceg
              koraka.
            </p>

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
          <div className="space-y-3">
            {[
              "Direktna analiza vaseg prostora",
              "Predlog sledeca 3 poteza bez nagadjanja",
              "Jasan okvir budzeta i prioriteta",
              "10% popusta za limitiran broj mesta",
            ].map((line) => (
              <div key={line} className="rounded-2xl border border-brand-gold/25 bg-brand-ink/45 px-4 py-3 text-sm text-brand-paper-muted">
                {line}
              </div>
            ))}
          </div>
        }
      />

      <BookChapter
        chapter="POGLAVLJE 02"
        title="Sta dobijate kroz projekat"
        subtitle="Svaka stavka je prikazana kao mini karta vrednosti - bez opstih i nejasnih obecanja."
        left={
          <p className="text-brand-paper-muted text-sm leading-relaxed sm:text-base">
            Ovo nije klasicna lista usluge. Svaka kartica predstavlja konkretan izlaz koji skracuje put od ideje do
            realizacije i smanjuje rizik skupljih korekcija.
          </p>
        }
        right={<StackedBulletCards items={chapter02Cards} />}
      />

      <BookChapter
        chapter="POGLAVLJE 03"
        title="Dodatna vrednost ukljucena bez doplate"
        subtitle="Grand finale stranica ponude sa fokusom na kontrolu troskova i sigurnu realizaciju."
        highlight
        left={
          <div className="space-y-4">
            <p className="text-brand-paper-muted text-sm leading-relaxed sm:text-base">
              Bonus je ukljucen jer projekat posmatramo celovito: od kreativnog koncepta do faznog plana realizacije.
            </p>
            <div className="rounded-2xl border border-brand-gold/25 bg-brand-ink/45 px-4 py-3 text-sm text-brand-paper">
              Ovaj paket je dostupan samo u okviru aktuelne kampanje i limitiranog broja termina.
            </div>
          </div>
        }
        right={<GoldFrameBonusPage items={chapter03Items} />}
      />

      <BookChapter
        chapter="POGLAVLJE 04"
        title="Sta dobijate na besplatnim konsultacijama"
        left={
          <div className="space-y-3">
            {chapter04Items.map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.38, delay: index * 0.06 }}
                className="rounded-2xl border border-brand-book-edge/80 bg-brand-ink/45 px-4 py-3 text-sm text-brand-paper-muted"
              >
                {item}
              </motion.div>
            ))}
          </div>
        }
        right={
          <div className="space-y-5">
            <p className="text-brand-paper-muted text-sm leading-relaxed sm:text-base">
              Nakon poziva dobijate jasnu preporuku sledecih koraka i realan okvir ulaganja, bez obaveze nastavka
              saradnje.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <BookingButton location="chapter_04_primary" />
              <IntakeButton location="chapter_04_secondary" />
            </div>
          </div>
        }
      />
    </div>
  );
}
