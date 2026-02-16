"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { BookingButton } from "@/src/components/landing/booking-button";
import { CountUpValue } from "@/src/components/landing/CountUpValue";
import { IntakeButton } from "@/src/components/landing/intake-button";
import { SavingsCalculator } from "@/src/components/landing/SavingsCalculator";
import { SavingsOutcomeComparison } from "@/src/components/landing/SavingsOutcomeComparison";

const SQM = 80;
const REGULAR = 40 * SQM;
const FIRST_DROP = 35 * SQM;
const SPECIAL = 30 * SQM;
const LIMITED = 25 * SQM;
const TOTAL_SAVINGS = REGULAR - LIMITED;

type ApartmentExampleProps = {
  chapterLabel?: string;
};

export function ApartmentExample({ chapterLabel = "POGLAVLJE 03" }: ApartmentExampleProps) {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const [phase, setPhase] = useState<0 | 1 | 2 | 3 | 4>(0);
  const spotlightActive = phase >= 4;

  useEffect(() => {
    if (!inView) {
      return;
    }

    const timers = [
      window.setTimeout(() => setPhase(1), 220),
      window.setTimeout(() => setPhase(2), 1040),
      window.setTimeout(() => setPhase(3), 1820),
      window.setTimeout(() => setPhase(4), 2580),
    ];

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [inView]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden rounded-[2rem] border border-brand-gold/35 bg-[linear-gradient(145deg,#250913_0%,#3b0d18_58%,#1d0810_100%)] px-5 py-8 shadow-[0_28px_90px_rgba(5,2,2,0.6)] sm:px-8 sm:py-10"
    >
      <motion.div
        animate={spotlightActive ? { opacity: 1 } : { opacity: 0.7 }}
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(201,163,93,0.16),transparent_46%),radial-gradient(circle_at_82%_24%,rgba(0,0,0,0.3),transparent_58%)]"
      />

      <div className="relative z-10">
        <p className="text-brand-gold text-xs tracking-[0.26em] uppercase">{chapterLabel}</p>
        <h2 className="font-display mt-3 text-4xl text-brand-paper sm:text-5xl">Primer: Klasican stan u Beogradu - 80m2</h2>
        <p className="text-brand-paper-muted mt-3 max-w-3xl text-sm leading-relaxed sm:text-base">
          Vizuelno i finansijski najjaci dokaz vrednosti: ista kvadratura, cetiri cene, maksimalna usteda.
        </p>

        <div className="mt-7 grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-brand-book-edge/80 bg-brand-ink/45 p-5">
            <p className="text-brand-paper-muted text-xs tracking-[0.18em] uppercase">Real life breakdown</p>

            <div className="mt-4 space-y-4">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={phase >= 1 ? { opacity: 1, y: 0 } : undefined}>
                <p className="text-brand-paper-muted text-sm">40€ x 80m2 =</p>
                <motion.p
                  animate={phase >= 1 ? { scale: [0.86, 1.1, 1] } : { scale: 1 }}
                  transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
                  className="font-display text-5xl text-brand-paper"
                >
                  <CountUpValue value={REGULAR} fromValue={0} suffix="€" durationMs={900} />
                </motion.p>
                <p className="text-brand-paper-muted mt-1 text-xs uppercase">Realna vrednost projekta</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={phase >= 2 ? { opacity: 1, y: 0 } : undefined}>
                <p className="text-brand-paper-muted text-sm">35€ x 80m2 =</p>
                <motion.p
                  animate={phase >= 2 ? { scale: [0.86, 1.1, 1] } : { scale: 1 }}
                  transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
                  className="font-display text-4xl text-brand-gold"
                >
                  <CountUpValue value={FIRST_DROP} fromValue={REGULAR} suffix="€" durationMs={900} />
                </motion.p>
                <p className="text-brand-gold mt-1 text-xs uppercase">Prva promo cena</p>
                <p className="text-brand-paper mt-1 text-sm">
                  Usteda:{" "}
                  <CountUpValue
                    value={REGULAR - FIRST_DROP}
                    fromValue={0}
                    suffix="€"
                    durationMs={840}
                    className="text-brand-gold font-semibold"
                  />
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={phase >= 3 ? { opacity: 1, y: 0 } : undefined}>
                <p className="text-brand-paper-muted text-sm">30€ x 80m2 =</p>
                <motion.p
                  animate={phase >= 3 ? { scale: [0.86, 1.1, 1] } : { scale: 1 }}
                  transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
                  className="font-display text-4xl text-brand-gold"
                >
                  <CountUpValue value={SPECIAL} fromValue={FIRST_DROP} suffix="€" durationMs={900} />
                </motion.p>
                <p className="text-brand-gold mt-1 text-xs uppercase">Specijalna cena</p>
                <p className="text-brand-paper mt-1 text-sm">
                  Usteda:{" "}
                  <CountUpValue
                    value={REGULAR - SPECIAL}
                    fromValue={REGULAR - FIRST_DROP}
                    suffix="€"
                    durationMs={900}
                    className="text-brand-gold font-semibold"
                  />
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={phase >= 4 ? { opacity: 1, y: 0 } : undefined}>
                <p className="text-brand-paper-muted text-sm">25€ x 80m2 =</p>
                <motion.p
                  animate={phase >= 4 ? { scale: [0.82, 1.14, 1] } : { scale: 1 }}
                  transition={{ duration: 0.86, ease: [0.22, 1, 0.36, 1] }}
                  className="font-display text-5xl text-brand-gold"
                >
                  <CountUpValue value={LIMITED} fromValue={SPECIAL} suffix="€" durationMs={950} />
                </motion.p>
              </motion.div>
            </div>

            <p className="text-brand-paper-muted mt-5 text-sm italic leading-relaxed">
              To je gotovo cela jedna kompletna kuhinja ili budzet za vrhunsku rasvetu.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={phase >= 3 ? { opacity: 1, scale: 1 } : undefined}
            className="relative rounded-3xl border border-brand-gold/45 bg-[linear-gradient(150deg,#1c0710_0%,#3b0d18_60%,#18060d_100%)] p-5"
            style={{
              boxShadow: spotlightActive
                ? "0 30px 80px rgba(18, 4, 11, 0.65), inset 0 0 34px rgba(201, 163, 93, 0.16)"
                : "0 12px 32px rgba(18, 4, 11, 0.45)",
            }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_26%,rgba(201,163,93,0.2),transparent_42%)]" />

            <div className="relative z-10">
              <p className="text-brand-gold text-xs tracking-[0.22em] uppercase">Savings spotlight</p>
              <p className="text-brand-paper mt-3 text-sm leading-relaxed">
                Ako zatrazite ponudu medju prvih 10 klijenata, finalna cena pada na 25€/m2.
              </p>

              <motion.p
                animate={
                  phase >= 4
                    ? {
                        scale: [0.76, 1.16, 1],
                        textShadow: [
                          "0 0 0 rgba(201,163,93,0)",
                          "0 0 25px rgba(201,163,93,0.5)",
                          "0 0 14px rgba(201,163,93,0.22)",
                        ],
                      }
                    : { scale: 1 }
                }
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="font-display mt-6 text-6xl text-brand-gold"
              >
                Stedite <CountUpValue value={TOTAL_SAVINGS} fromValue={REGULAR - SPECIAL} suffix="€" durationMs={950} />
              </motion.p>

              <p className="text-brand-paper mt-2 text-sm leading-relaxed">
                Ako zatrazite ponudu medju prvih 10 klijenata, aktivira se cena od 25€/m2.
              </p>
            </div>
          </motion.div>
        </div>

        <div className="mt-6">
          <SavingsCalculator />
        </div>

        <div className="mt-6">
          <SavingsOutcomeComparison savings={TOTAL_SAVINGS} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          className="mt-6 rounded-3xl border border-brand-gold/40 bg-brand-ink/45 px-4 py-5 sm:px-6"
        >
          <p className="text-brand-paper text-sm leading-relaxed sm:text-base">
            Sledeci korak je jedan klik: zakazite konsultacije ili posaljite upitnik da biste dobili personalizovanu
            ponudu.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <BookingButton location="apartment_example_primary" className="w-full sm:w-auto" />
            <IntakeButton location="apartment_example_secondary" className="w-full sm:w-auto" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
