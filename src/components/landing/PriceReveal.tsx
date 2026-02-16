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
      window.setTimeout(() => setPhase(1), 180),
      window.setTimeout(() => setPhase(2), 900),
      window.setTimeout(() => setPhase(3), 1650),
      window.setTimeout(() => setPhase(4), 2460),
    ];

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [inView]);

  const rows = [
    {
      label: "Realna cena",
      value: startValue,
      from: 0,
      visibleAt: 1,
      strikeAt: 2,
    },
    {
      label: "Prva promo cena",
      value: firstDropValue,
      from: startValue,
      visibleAt: 2,
      strikeAt: 3,
    },
    {
      label: "Specijalna cena",
      value: secondDropValue,
      from: firstDropValue,
      visibleAt: 3,
      strikeAt: 4,
    },
  ] as const;

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

      <div className="relative z-10 min-h-[420px]">
        <div className="text-center">
          <p className="text-brand-paper-muted text-xs tracking-[0.2em] uppercase">Transformacija cene</p>

          <div className="mt-5 space-y-4">
            {rows.map((row) => (
              <motion.div
                key={row.label}
                initial={{ opacity: 0, y: 12 }}
                animate={phase >= row.visibleAt ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.4 }}
              >
                <p className="text-brand-gold text-xs tracking-[0.2em] uppercase">{row.label}</p>
                <div className="relative mt-1 inline-flex items-center justify-center">
                  <motion.span
                    animate={phase >= row.visibleAt ? { scale: [0.78, 1.14, 1] } : { scale: 1 }}
                    transition={{ duration: 0.68, ease: [0.22, 1, 0.36, 1] }}
                    className="font-display text-5xl leading-none text-brand-paper sm:text-6xl"
                  >
                    <CountUpValue value={row.value} fromValue={row.from} durationMs={840} suffix="€/m2" />
                  </motion.span>
                  <motion.span
                    animate={phase >= row.strikeAt ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
                    transition={{ duration: 0.32 }}
                    className="absolute top-1/2 left-0 h-[2px] w-full origin-left bg-brand-gold"
                  />
                </div>
              </motion.div>
            ))}
          </div>

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
                      scale: [0.72, 1.2, 1],
                      textShadow: [
                        "0 0 0 rgba(201,163,93,0)",
                        "0 0 28px rgba(201,163,93,0.52)",
                        "0 0 14px rgba(201,163,93,0.22)",
                      ],
                    }
                  : { scale: 1 }
              }
              transition={{ duration: 0.96, ease: [0.22, 1, 0.36, 1] }}
              className="font-display mt-3 text-7xl text-brand-gold sm:text-8xl"
            >
              <CountUpValue value={finalValue} fromValue={secondDropValue} durationMs={980} suffix="€/m2" />
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
