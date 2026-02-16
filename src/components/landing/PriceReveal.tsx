"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { CountUpValue } from "@/src/components/landing/CountUpValue";

type PriceRevealProps = {
  realValue: number;
  specialValue: number;
  limitedValue: number;
};

export function PriceReveal({ realValue, specialValue, limitedValue }: PriceRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
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
    <div ref={ref} className="relative overflow-hidden rounded-3xl border border-brand-gold/35 bg-brand-bordo/85 p-6 sm:p-8">
      <motion.div
        animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(201,163,93,0.2),transparent_40%),radial-gradient(circle_at_50%_120%,rgba(0,0,0,0.72),transparent_65%)]"
      />

      <div className="relative z-10 min-h-[330px]">
        <div className="text-center">
          <p className="text-brand-paper-muted text-xs tracking-[0.2em] uppercase">Transformacija cene</p>

          <div className="mt-5 min-h-[92px]">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={phase >= 1 ? { opacity: 1, y: 0 } : undefined}
              className="font-display relative inline-block text-6xl text-brand-paper sm:text-7xl"
            >
              <CountUpValue value={realValue} fromValue={0} durationMs={850} suffix="€/m2" />
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
            <p className="text-brand-gold text-xs tracking-[0.2em] uppercase">Specijalna cena</p>
            <p className="font-display mt-1 text-5xl text-brand-gold sm:text-6xl">
              <CountUpValue value={specialValue} fromValue={0} durationMs={900} suffix="€/m2" />
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={phase >= 3 ? { opacity: 1, y: 0 } : undefined}
            className="mx-auto mt-8 max-w-2xl rounded-3xl border border-brand-gold/55 bg-[linear-gradient(150deg,#1d0911_0%,#3b0d18_65%,#1a0810_100%)] px-5 py-6"
          >
            <p className="text-brand-paper text-sm leading-relaxed sm:text-base">
              Ako zatrazite ponudu ili zakazete konsultacije medju prvih 10 klijenata
            </p>

            <motion.p
              animate={phase >= 3 ? { scale: [0.8, 1.1, 1] } : { scale: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="font-display mt-3 text-6xl text-brand-gold sm:text-7xl"
            >
              <CountUpValue value={limitedValue} fromValue={0} durationMs={950} suffix="€/m2" />
            </motion.p>

            <p className="text-brand-paper-muted mt-2 text-xs tracking-[0.16em] uppercase">Limitirano na 10 projekata.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
