"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

import {
  chapter02Items,
  chapter03Items,
  chapter04Items,
  faqItems,
  offerHeadline,
  offerSubheadline,
  testimonials,
} from "@/src/data/landing-content";
import { trackEvent } from "@/src/lib/analytics";
import { BookChapter } from "@/src/components/landing/book-chapter";
import { BookingButton } from "@/src/components/landing/booking-button";
import { IntakeButton } from "@/src/components/landing/intake-button";
import { ScarcityCounter } from "@/src/components/landing/scarcity-counter";
import { ScrollTracker } from "@/src/components/landing/scroll-tracker";
import { SoftEmailPopup } from "@/src/components/landing/soft-email-popup";
import { VideoEmbed } from "@/src/components/landing/video-embed";

export function LandingPage() {
  useEffect(() => {
    const key = "element_landing_viewed";

    try {
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
      }
    } catch {
      // Continue.
    }

    trackEvent("landing_view", { page: "landing" });
  }, []);

  return (
    <>
      <ScrollTracker />
      <SoftEmailPopup />

      <div className="relative pb-24 sm:pb-28">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] bg-[radial-gradient(circle_at_12%_8%,rgba(191,154,87,0.18),transparent_46%),radial-gradient(circle_at_86%_16%,rgba(117,68,57,0.18),transparent_42%)]" />

        <section className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6 sm:pt-14 lg:px-8 lg:pt-16">
          <BookChapter
            chapter="POGLAVLJE 01"
            title={offerHeadline}
            subtitle={offerSubheadline}
            left={
              <div className="space-y-6">
                <div className="inline-flex items-center rounded-full border border-brand-gold/45 bg-brand-ink/60 px-4 py-2 text-xs tracking-[0.22em] uppercase text-brand-gold">
                  Limited Offer - samo 10 mesta
                </div>
                <ScarcityCounter />
                <p className="text-brand-paper-muted max-w-xl text-sm leading-relaxed sm:text-base">
                  Ovaj landing je jedina ulazna tačka za kampanje. Birate između direktnog zakazivanja konsultacija ili
                  kompletnog upitnika za precizniju ponudu pre razgovora.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <BookingButton location="hero_primary" />
                  <IntakeButton location="hero_secondary" />
                </div>
              </div>
            }
            right={
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "3 konkretna saveta tokom razgovora",
                  "Jasan okvir budžeta i prioriteta",
                  "Preporuka sledećih koraka bez obaveze",
                  "10% popusta za limitiran broj mesta",
                ].map((item) => (
                  <motion.div
                    key={item}
                    whileInView={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 14 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.4 }}
                    className="rounded-2xl border border-brand-book-edge bg-brand-ink/55 px-4 py-4 text-sm text-brand-paper-muted"
                  >
                    {item}
                  </motion.div>
                ))}
              </div>
            }
          />
        </section>

        <section className="mx-auto mt-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <BookChapter
            chapter="POGLAVLJE 02"
            title="Šta dobijate kroz projekat"
            subtitle="Kompletna usluga osmišljena da ubrza odluke i smanji greške u realizaciji."
            left={
              <p className="text-brand-paper-muted max-w-xl text-sm leading-relaxed sm:text-base">
                Svaka stavka je osmišljena da vas vodi od ideje do realizacije bez improvizacije. Fokus je na funkciji,
                estetici i kontroli budžeta.
              </p>
            }
            right={
              <div className="grid gap-3">
                {chapter02Items.map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.22 }}
                    transition={{ duration: 0.38, delay: index * 0.05 }}
                    className="rounded-2xl border border-brand-book-edge bg-brand-ink/45 px-4 py-3 text-sm text-brand-paper"
                  >
                    {item}
                  </motion.div>
                ))}
              </div>
            }
          />
        </section>

        <section className="mx-auto mt-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <BookChapter
            chapter="POGLAVLJE 03"
            title="Dodatna vrednost uključena bez doplate"
            subtitle="Grand finale paket za bolju kontrolu troškova i sigurniju realizaciju."
            highlight
            left={
              <div className="border-brand-gold/30 bg-brand-ink/45 rounded-2xl border px-5 py-5 text-sm leading-relaxed text-brand-paper-muted sm:text-base">
                Bonus paket je uključen jer projekat tretiramo kao celinu: od koncepta do praktične realizacije u fazama.
              </div>
            }
            right={
              <ul className="grid gap-3">
                {chapter03Items.map((item, index) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.35, delay: index * 0.06 }}
                    className="border-brand-gold/35 bg-brand-ink/40 rounded-2xl border px-4 py-3 text-sm text-brand-paper"
                  >
                    {item}
                  </motion.li>
                ))}
              </ul>
            }
          />
        </section>

        <section className="mx-auto mt-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <BookChapter
            chapter="POGLAVLJE 04"
            title="Šta dobijate na besplatnim konsultacijama"
            left={
              <ul className="space-y-3">
                {chapter04Items.map((item) => (
                  <li key={item} className="text-brand-paper-muted rounded-xl border border-brand-book-edge bg-brand-ink/35 px-4 py-3 text-sm sm:text-base">
                    {item}
                  </li>
                ))}
              </ul>
            }
            right={
              <div className="space-y-5">
                <p className="text-brand-paper-muted text-sm leading-relaxed sm:text-base">
                  Konsultacije su fokusirane na konkretne odluke koje možete odmah primeniti, bez generičkih saveta i bez
                  obaveze nastavka saradnje.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <BookingButton location="chapter_04" />
                  <IntakeButton location="chapter_04" />
                </div>
              </div>
            }
          />
        </section>

        <section className="mx-auto mt-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <BookChapter
            chapter="POGLAVLJE 05"
            title="Video"
            subtitle="Kratak pregled pristupa i rezultata kroz stvarne primere."
            left={<VideoEmbed location="chapter_05" />}
            right={
              <div className="flex h-full flex-col justify-between gap-6">
                <p className="text-brand-paper-muted text-sm leading-relaxed sm:text-base">
                  Nakon videa možete odmah zakazati termin i osigurati mesto u aktuelnoj ponudi.
                </p>
                <BookingButton location="chapter_05_overlay" label="Zakaži odmah posle videa" className="w-full" />
              </div>
            }
          />
        </section>

        <section className="mx-auto mt-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <BookChapter
            chapter="POGLAVLJE 06"
            title="Zašto je ovo besplatno"
            left={
              <p className="text-brand-paper text-base leading-relaxed sm:text-lg">
                Konsultacije su besplatne jer želimo da procenimo da li postoji obostrano poklapanje pre početka projekta.
              </p>
            }
            right={
              <p className="text-brand-paper-muted text-sm leading-relaxed sm:text-base">
                Cilj je da obe strane dobiju jasnu sliku potencijala saradnje, obima zahvata i očekivanih rezultata.
              </p>
            }
          />
        </section>

        <section className="mx-auto mt-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <BookChapter
            chapter="POGLAVLJE 07"
            title="Social Proof"
            subtitle="Preko 50+ idejnih projekata realizovano."
            left={
              <div className="grid gap-3">
                {testimonials.map((item) => (
                  <blockquote key={item.quote} className="border-brand-book-edge bg-brand-ink/40 rounded-2xl border px-4 py-4">
                    <p className="text-brand-paper-muted text-sm leading-relaxed">“{item.quote}”</p>
                    <footer className="text-brand-gold mt-3 text-xs tracking-[0.2em] uppercase">
                      {item.by} · {item.city}
                    </footer>
                  </blockquote>
                ))}
              </div>
            }
            right={
              <div className="border-brand-gold/30 bg-brand-ink/45 rounded-2xl border px-5 py-5 text-sm leading-relaxed text-brand-paper-muted">
                Klijenti najčešće ističu brzinu donošenja odluka, jasnu strukturu procesa i preciznost ponude nakon
                upitnika i konsultacija.
              </div>
            }
          />
        </section>

        <section className="mx-auto mt-10 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <BookChapter
            chapter="POGLAVLJE 08"
            title="FAQ"
            left={
              <div className="space-y-3">
                {faqItems.map((item) => (
                  <details key={item.q} className="group border-brand-book-edge bg-brand-ink/35 rounded-2xl border px-4 py-3">
                    <summary className="cursor-pointer list-none text-sm font-semibold text-brand-paper sm:text-base">{item.q}</summary>
                    <p className="text-brand-paper-muted mt-2 text-sm leading-relaxed">{item.a}</p>
                  </details>
                ))}
              </div>
            }
            right={
              <div className="flex h-full flex-col justify-between gap-4">
                <p className="text-brand-paper-muted text-sm leading-relaxed sm:text-base">
                  Ako imate dodatna pitanja, otvorite upitnik ili rezervišite besplatne konsultacije i dobijte personalnu
                  procenu.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <BookingButton location="chapter_08" />
                  <IntakeButton location="chapter_08" />
                </div>
              </div>
            }
          />
        </section>

        <section className="mx-auto mt-12 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            className="border-brand-gold/45 bg-[linear-gradient(140deg,#20170f_0%,#15100c_40%,#1e140f_100%)] rounded-[2rem] border px-6 py-10 text-center sm:px-10"
          >
            <p className="text-brand-gold text-xs tracking-[0.26em] uppercase">Final CTA</p>
            <h2 className="font-display mt-3 text-3xl text-brand-paper sm:text-5xl">Rezervišite termin ili pošaljite upitnik</h2>
            <p className="text-brand-paper-muted mx-auto mt-4 max-w-2xl text-sm leading-relaxed sm:text-base">
              Oba puta vode ka istoj stvari: jasnom planu za vaš prostor i sledećem konkretnom koraku.
            </p>
            <div className="mx-auto mt-8 flex max-w-3xl flex-col gap-3 sm:flex-row sm:justify-center">
              <BookingButton location="final_cta" className="w-full sm:w-auto" />
              <IntakeButton location="final_cta" className="w-full sm:w-auto" />
            </div>
          </motion.div>
        </section>
      </div>

      <div className="border-brand-book-edge/80 bg-brand-ink/95 fixed inset-x-0 bottom-0 z-[80] border-t p-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-lg gap-2">
          <BookingButton location="mobile_sticky" className="flex-1 px-3 text-[11px]" label="Zakaži" />
          <IntakeButton location="mobile_sticky" className="flex-1 px-3 text-[11px]" label="Popuni upitnik" />
        </div>
      </div>
    </>
  );
}
