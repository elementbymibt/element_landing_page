"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { CountUpValue } from "@/src/components/landing/CountUpValue";

type PriceRevealProps = {
  startValue: number;
  firstDropValue: number;
  secondDropValue: number;
  finalValue: number;
};

export function PriceReveal({ startValue, firstDropValue, secondDropValue, finalValue }: PriceRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const [phase, setPhase] = useState<0 | 1 | 2 | 3 | 4>(0);
  const spotlightActive = phase >= 4;

  useEffect(() => {
    if (!inView) {
      return;
    }

    const timers = [
      window.setTimeout(() => setPhase(1), 220),
      window.setTimeout(() => setPhase(2), 1020),
      window.setTimeout(() => setPhase(3), 1760),
      window.setTimeout(() => setPhase(4), 2620),
    ];

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [inView]);

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-3xl border border-brand-gold/35 bg-brand-bordo/85 p-6 transition-shadow duration-500 sm:p-8"
      style={{
        boxShadow: spotlightActive ? "0 34px 90px rgba(12, 3, 8, 0.72)" : "0 20px 46px rgba(12, 3, 8, 0.42)",
      }}
    >
      <motion.div
        animate={phase >= 4 ? { opacity: 1 } : { opacity: 0 }}
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(201,163,93,0.2),transparent_40%),radial-gradient(circle_at_50%_120%,rgba(0,0,0,0.72),transparent_65%)]"
      />

      <div className="relative z-10 min-h-[380px]">
        <div className="text-center">
          <p className="text-brand-paper-muted text-xs tracking-[0.2em] uppercase">Transformacija cene</p>

          <div className="mt-5 min-h-[92px]">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={phase >= 1 ? { opacity: 1, y: 0 } : undefined}
              className="font-display relative inline-block text-6xl text-brand-paper sm:text-7xl"
            >
              <motion.span
                animate={phase >= 1 ? { scale: [0.84, 1.12, 1] } : { scale: 1 }}
                transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block"
              >
                <CountUpValue value={startValue} fromValue={0} durationMs={850} suffix="€/m2" />
              </motion.span>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={phase >= 1 ? { scaleX: 1 } : undefined}
                transition={{ duration: 0.45, delay: 0.2 }}
                className="absolute top-1/2 left-0 h-[2px] w-full origin-left bg-brand-gold"
              />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={phase >= 2 ? { opacity: 1, y: 0 } : undefined}
            className="mt-1"
          >
            <p className="text-brand-gold text-xs tracking-[0.2em] uppercase">Prva promo cena</p>
            <motion.p
              animate={phase >= 2 ? { scale: [0.86, 1.11, 1] } : { scale: 1 }}
              transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
              className="font-display mt-1 text-5xl text-brand-gold sm:text-6xl"
            >
              <CountUpValue value={firstDropValue} fromValue={startValue} durationMs={880} suffix="€/m2" />
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={phase >= 3 ? { opacity: 1, y: 0 } : undefined}
            className="mt-5"
          >
            <p className="text-brand-gold text-xs tracking-[0.2em] uppercase">Specijalna cena</p>
            <motion.p
              animate={phase >= 3 ? { scale: [0.86, 1.11, 1] } : { scale: 1 }}
              transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
              className="font-display mt-1 text-5xl text-brand-gold sm:text-6xl"
            >
              <CountUpValue value={secondDropValue} fromValue={firstDropValue} durationMs={900} suffix="€/m2" />
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={phase >= 4 ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.45 }}
            className="mx-auto mt-7 max-w-2xl rounded-3xl border border-brand-gold/55 bg-[linear-gradient(150deg,#1d0911_0%,#3b0d18_65%,#1a0810_100%)] px-5 py-6"
            style={{
              boxShadow: spotlightActive ? "0 18px 50px rgba(24, 8, 14, 0.7), inset 0 0 34px rgba(201, 163, 93, 0.14)" : "none",
            }}
          >
            <p className="text-brand-paper text-sm leading-relaxed sm:text-base">
              Ako zatrazite ponudu ili zakazete konsultacije medju prvih 10 klijenata
            </p>

            <motion.p
              animate={
                phase >= 4
                  ? {
                      scale: [0.78, 1.16, 1],
                      textShadow: [
                        "0 0 0 rgba(201,163,93,0)",
                        "0 0 25px rgba(201,163,93,0.5)",
                        "0 0 13px rgba(201,163,93,0.22)",
                      ],
                    }
                  : { scale: 1 }
              }
              transition={{ duration: 0.92, ease: [0.22, 1, 0.36, 1] }}
              className="font-display mt-3 text-6xl text-brand-gold sm:text-7xl"
            >
              <CountUpValue value={finalValue} fromValue={secondDropValue} durationMs={950} suffix="€/m2" />
            </motion.p>

            <p className="text-brand-paper-muted mt-2 text-xs tracking-[0.16em] uppercase">Limitirano na 10 projekata.</p>
            <p className="text-brand-paper mt-3 text-xs leading-relaxed sm:text-sm">
              Na konsultacijama odmah dobijate 3 konkretna saveta. Kliknite i rezervisite mesto pre zatvaranja ponude.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
