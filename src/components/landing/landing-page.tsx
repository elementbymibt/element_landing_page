"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

import { BeforeAfterSlider } from "@/src/components/landing/BeforeAfterSlider";
import { BookChapter } from "@/src/components/landing/BookChapter";
import { BookingButton } from "@/src/components/landing/booking-button";
import { EmotionalTriggerSection } from "@/src/components/landing/EmotionalTriggerSection";
import { FloatingSocialButtons } from "@/src/components/landing/FloatingSocialButtons";
import { IntakeButton } from "@/src/components/landing/intake-button";
import { MicroSocialProofToast } from "@/src/components/landing/MicroSocialProofToast";
import { PriceStackSection } from "@/src/components/landing/PriceStackSection";
import { ScrollTracker } from "@/src/components/landing/scroll-tracker";
import { SoftEmailPopup } from "@/src/components/landing/soft-email-popup";
import { StickyCTA } from "@/src/components/landing/StickyCTA";
import { UrgencyTopStrip } from "@/src/components/landing/UrgencyTopStrip";
import { ValueReminderBlock } from "@/src/components/landing/ValueReminderBlock";
import { VideoEmbed } from "@/src/components/landing/video-embed";
import { faqItems, testimonials } from "@/src/data/landing-content";
import { trackEvent } from "@/src/lib/analytics";
import { devLog } from "@/src/lib/dev-log";

export function LandingPage() {
  useEffect(() => {
    trackEvent("landing_view", { page: "landing" });
    devLog("landing_view", { page: "landing" });
  }, []);

  return (
    <>
      <ScrollTracker />
      <SoftEmailPopup />
      <UrgencyTopStrip />
      <StickyCTA />
      <MicroSocialProofToast />
      <FloatingSocialButtons />

      <div className="relative pb-28 pt-24 sm:pt-28 md:pt-36">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[42rem] bg-[radial-gradient(circle_at_10%_4%,rgba(191,154,87,0.2),transparent_42%),radial-gradient(circle_at_88%_16%,rgba(114,67,56,0.2),transparent_40%)]" />

        <div className="mx-auto w-full max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
          <EmotionalTriggerSection />
          <PriceStackSection />

          <BookChapter
            chapter="POGLAVLJE 05"
            title="Pre / Posle (primer)"
            subtitle="Jedan jasan primer transformacije: od skice rasporeda do render vizije prostora."
            left={
              <BeforeAfterSlider
                beforeSrc="/intake/step-space.jpg"
                afterSrc="/intake/style-japandi-1.jpg"
                beforeLabel="Pre (skica)"
                afterLabel="Posle (render)"
              />
            }
            right={
              <div className="space-y-4">
                <p className="text-brand-paper-muted text-sm leading-relaxed sm:text-base">
                  Slajder prikazuje kako se ideja prevodi u konkretan vizuelni rezultat pre ulaska u realizaciju.
                </p>
                <div className="space-y-2">
                  <div className="rounded-xl border border-brand-gold/30 bg-brand-ink/45 px-4 py-3 text-sm text-brand-paper">
                    Jasna razlika u funkciji, zoni kretanja i finalnom osecaju prostora.
                  </div>
                  <div className="rounded-xl border border-brand-gold/30 bg-brand-ink/45 px-4 py-3 text-sm text-brand-paper">
                    Realan plan pre bilo kakvih troskova na terenu.
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <BookingButton location="before_after_primary" />
                  <IntakeButton location="before_after_secondary" />
                </div>
              </div>
            }
          />

          <section className="relative overflow-hidden rounded-[2rem] border border-brand-book-edge/90 bg-[linear-gradient(145deg,#17120f_0%,#100e0c_52%,#17110f_100%)] shadow-[0_30px_70px_rgba(4,3,2,0.58)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(191,154,87,0.17),transparent_52%),radial-gradient(circle_at_50%_120%,rgba(0,0,0,0.48),transparent_65%)]" />
            <div className="relative z-10 p-5 sm:p-8 lg:p-10">
              <p className="text-brand-gold text-xs tracking-[0.3em] uppercase">POGLAVLJE 06</p>

              <h2 className="font-display mt-3 text-3xl text-brand-paper sm:text-5xl">Video insert page</h2>
              <p className="text-brand-paper-muted mt-3 max-w-2xl text-sm leading-relaxed sm:text-base">
                Kratak pregled pristupa i finalnih rezultata kroz jedan reprezentativan primer.
              </p>

              <div className="mt-6">
                <VideoEmbed location="video_insert" />
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <BookingButton location="video_primary" />
                <IntakeButton location="video_secondary" />
              </div>
            </div>
          </section>

          <BookChapter
            chapter="POGLAVLJE 07"
            title="Social proof"
            subtitle="Preko 50+ idejnih projekata realizovano."
            left={
              <div className="grid gap-3">
                {testimonials.map((item) => (
                  <blockquote key={item.quote} className="rounded-2xl border border-brand-book-edge/80 bg-brand-ink/45 px-4 py-4">
                    <p className="text-brand-paper-muted text-sm leading-relaxed">&quot;{item.quote}&quot;</p>
                    <footer className="text-brand-gold mt-3 text-xs tracking-[0.2em] uppercase">
                      {item.by} / {item.city}
                    </footer>
                  </blockquote>
                ))}
              </div>
            }
            right={
              <div className="space-y-4">
                <p className="text-brand-paper-muted text-sm leading-relaxed sm:text-base">
                  Klijenti najcesce isticu jasno definisan proces, konkretnost konsultacija i sigurnost pri odlukama.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <BookingButton location="social_primary" />
                  <IntakeButton location="social_secondary" />
                </div>
              </div>
            }
          />

          <BookChapter
            chapter="POGLAVLJE 08"
            title="FAQ / Objections"
            left={
              <div className="space-y-3">
                {faqItems.map((item) => (
                  <details key={item.q} className="rounded-2xl border border-brand-book-edge/80 bg-brand-ink/45 px-4 py-3">
                    <summary className="cursor-pointer list-none text-sm font-semibold text-brand-paper sm:text-base">{item.q}</summary>
                    <p className="text-brand-paper-muted mt-2 text-sm leading-relaxed">{item.a}</p>
                  </details>
                ))}
              </div>
            }
            right={
              <div className="space-y-5">
                <p className="text-brand-paper-muted text-sm leading-relaxed sm:text-base">
                  Ako imate dodatna pitanja, izaberite jedan od dva koraka i dobijte personalni plan bez lutanja.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <BookingButton location="faq_primary" />
                  <IntakeButton location="faq_secondary" />
                </div>
              </div>
            }
          />

          <ValueReminderBlock />

          <motion.section
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            className="rounded-[2rem] border border-brand-gold/45 bg-[linear-gradient(140deg,#24190f_0%,#15100c_44%,#24180f_100%)] px-6 py-10 text-center sm:px-10"
          >
            <p className="text-brand-gold text-xs tracking-[0.28em] uppercase">Final CTA</p>
            <h2 className="font-display mt-3 text-3xl text-brand-paper sm:text-5xl">Rezervisite termin ili posaljite upitnik</h2>
            <p className="text-brand-paper-muted mx-auto mt-4 max-w-2xl text-sm leading-relaxed sm:text-base">
              Dva jasna puta, isti cilj: konkretan plan za vas prostor.
            </p>
            <div className="mx-auto mt-7 flex max-w-3xl flex-col gap-3 sm:flex-row sm:justify-center">
              <BookingButton location="final_primary" className="w-full sm:w-auto" />
              <IntakeButton location="final_secondary" className="w-full sm:w-auto" />
            </div>
          </motion.section>
        </div>
      </div>
    </>
  );
}
