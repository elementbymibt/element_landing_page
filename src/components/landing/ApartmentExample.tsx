"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { CountUpValue } from "@/src/components/landing/CountUpValue";
import { SavingsCalculator } from "@/src/components/landing/SavingsCalculator";

const SQM = 80;
const REGULAR = 35 * SQM;
const SPECIAL = 30 * SQM;
const LIMITED = 25 * SQM;

export function ApartmentExample() {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);

  useEffect(() => {
    if (!inView) {
      return;
    }

    const timers = [
      window.setTimeout(() => setPhase(1), 250),
      window.setTimeout(() => setPhase(2), 1200),
      window.setTimeout(() => setPhase(3), 2200),
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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(201,163,93,0.16),transparent_46%),radial-gradient(circle_at_82%_24%,rgba(0,0,0,0.3),transparent_58%)]" />

      <div className="relative z-10">
        <p className="text-brand-gold text-xs tracking-[0.26em] uppercase">POGLAVLJE 06</p>
        <h2 className="font-display mt-3 text-4xl text-brand-paper sm:text-5xl">Primer: Klasican stan u Beogradu - 80m2</h2>

        <div className="mt-7 grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-brand-book-edge/80 bg-brand-ink/45 p-5">
            <p className="text-brand-paper-muted text-xs tracking-[0.18em] uppercase">Real life breakdown</p>

            <div className="mt-4 space-y-4">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={phase >= 1 ? { opacity: 1, y: 0 } : undefined}>
                <p className="text-brand-paper-muted text-sm">35€ x 80m2 =</p>
                <p className="font-display text-5xl text-brand-paper">
                  <CountUpValue value={REGULAR} fromValue={0} suffix="€" durationMs={900} />
                </p>
                <p className="text-brand-paper-muted mt-1 text-xs uppercase">Realna vrednost projekta</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={phase >= 2 ? { opacity: 1, y: 0 } : undefined}>
                <p className="text-brand-paper-muted text-sm">30€ x 80m2 =</p>
                <p className="font-display text-4xl text-brand-gold">
                  <CountUpValue value={SPECIAL} fromValue={0} suffix="€" durationMs={900} />
                </p>
                <p className="text-brand-gold mt-1 text-xs uppercase">Specijalna cena</p>
                <p className="text-brand-paper mt-1 text-sm">
                  Usteda: <CountUpValue value={REGULAR - SPECIAL} fromValue={0} suffix="€" durationMs={900} className="text-brand-gold font-semibold" />
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={phase >= 3 ? { opacity: 1, y: 0 } : undefined}>
                <p className="text-brand-paper-muted text-sm">25€ x 80m2 =</p>
                <p className="font-display text-5xl text-brand-gold">
                  <CountUpValue value={LIMITED} fromValue={0} suffix="€" durationMs={950} />
                </p>
              </motion.div>
            </div>

            <p className="text-brand-paper-muted mt-5 text-sm italic leading-relaxed">
              To je gotovo cela jedna kompletna kuhinja ili budzet za vrhunsku rasvetu.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={phase >= 2 ? { opacity: 1, scale: 1 } : undefined}
            className="relative rounded-3xl border border-brand-gold/45 bg-[linear-gradient(150deg,#1c0710_0%,#3b0d18_60%,#18060d_100%)] p-5"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_26%,rgba(201,163,93,0.2),transparent_42%)]" />

            <div className="relative z-10">
              <p className="text-brand-gold text-xs tracking-[0.22em] uppercase">Savings spotlight</p>
              <p className="text-brand-paper mt-3 text-sm leading-relaxed">
                Ako zatrazite ponudu medju prvih 10 klijenata, finalna cena pada na 25€/m2.
              </p>

              <motion.p
                animate={phase >= 3 ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="font-display mt-6 text-6xl text-brand-gold"
            >
                Stedite <CountUpValue value={REGULAR - LIMITED} fromValue={0} suffix="€" durationMs={950} />
              </motion.p>
            </div>
          </motion.div>
        </div>

        <div className="mt-6">
          <SavingsCalculator />
        </div>
      </div>
    </section>
  );
}
