"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { CountUpValue } from "@/src/components/landing/CountUpValue";

export type PriceSlideState = "idle" | "running" | "done";

type PriceRevealProps = {
  regularValue: number;
  firstDropValue: number;
  specialValue: number;
  finalValue: number;
  canShowFinalPrice: boolean;
  slideState: PriceSlideState;
};

export function PriceReveal({
  regularValue,
  firstDropValue,
  specialValue,
  finalValue,
  canShowFinalPrice,
  slideState,
}: PriceRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);

  useEffect(() => {
    if (!inView) {
      return;
    }

    const timers = [
      window.setTimeout(() => setPhase(1), 120),
      window.setTimeout(() => setPhase(2), 540),
      window.setTimeout(() => setPhase(3), 920),
    ];

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [inView]);

  const sliding = canShowFinalPrice && slideState !== "idle";
  const slideComplete = canShowFinalPrice && slideState === "done";

  return (
    <section
      ref={ref}
      className="relative overflow-hidden rounded-3xl border border-brand-gold/36 bg-[linear-gradient(150deg,#1f0710_0%,#3b0d18_58%,#1a060e_100%)] p-6 sm:p-8"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,rgba(201,163,93,0.16),transparent_42%),radial-gradient(circle_at_50%_120%,rgba(0,0,0,0.72),transparent_65%)]" />

      <div className="relative z-10">
        <p className="text-brand-paper-muted text-center text-xs tracking-[0.2em] uppercase">Transformacija cene</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            { label: "Standardna cena", value: regularValue, activeAt: 1, struckAt: 2 },
            { label: "Promo faza", value: firstDropValue, activeAt: 2, struckAt: 3 },
            { label: "Specijalna cena", value: specialValue, activeAt: 3, struckAt: 4 },
          ].map((row) => (
            <motion.div
              key={row.label}
              initial={{ opacity: 0, y: 10 }}
              animate={phase >= row.activeAt ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.32 }}
              className="rounded-2xl border border-brand-gold/26 bg-brand-ink/44 px-3 py-3 text-center"
            >
              <p className="text-brand-gold text-[10px] tracking-[0.2em] uppercase">{row.label}</p>
              <div className="relative mt-2 inline-flex items-center justify-center">
                <span className="font-display text-4xl leading-none text-brand-paper">
                  <CountUpValue value={row.value} fromValue={0} durationMs={700} suffix="€/m2" />
                </span>
                <motion.span
                  animate={phase >= row.struckAt ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-1/2 left-0 h-[3px] w-full origin-left bg-[linear-gradient(90deg,#c9a35d_0%,#df4d57_100%)]"
                />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-7 rounded-2xl border border-brand-gold/30 bg-brand-ink/50 p-5">
          <p className="text-brand-gold text-center text-xs tracking-[0.16em] uppercase">Specijalna promotivna cena</p>

          <div className="relative mt-4 h-[110px] overflow-hidden">
            <motion.div
              animate={
                sliding
                  ? {
                      x: "-44%",
                      opacity: 0.4,
                    }
                  : {
                      x: "0%",
                      opacity: 1,
                    }
              }
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <p className="font-display text-6xl leading-none text-brand-paper sm:text-7xl">{specialValue}€/m2</p>
            </motion.div>

            {canShowFinalPrice ? (
              <motion.div
                animate={
                  slideState === "idle"
                    ? { x: "44%", opacity: 0 }
                    : {
                        x: "0%",
                        opacity: 1,
                        scale: slideComplete ? [0.94, 1.06, 1] : 1,
                        textShadow: slideComplete
                          ? [
                              "0 0 0 rgba(201,163,93,0)",
                              "0 0 20px rgba(201,163,93,0.42)",
                              "0 0 10px rgba(201,163,93,0.2)",
                            ]
                          : "0 0 0 rgba(0,0,0,0)",
                      }
                }
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <p className="font-display text-7xl leading-none text-brand-gold sm:text-8xl">{finalValue}€/m2</p>
              </motion.div>
            ) : null}
          </div>

          <motion.div
            animate={slideComplete || !canShowFinalPrice ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
            transition={{ duration: 0.36, ease: "easeOut" }}
            className="mx-auto h-[2px] w-64 origin-left bg-[linear-gradient(90deg,#c9a35d_0%,#c9a35d_80%,transparent_100%)]"
          />

          <p className="text-brand-paper-muted mt-3 text-center text-sm">
            {canShowFinalPrice
              ? "Usteda 5€/m2 u odnosu na specijalnu cenu od 30€/m2."
              : "Ultra cena je istekla. Dostupna je specijalna cena 30€/m2."}
          </p>
          <p className="text-brand-paper-muted mt-1 text-center text-xs uppercase tracking-[0.12em]">
            {canShowFinalPrice ? "Specijalna cena za prvih 10 klijenata" : "Regularna promotivna verzija"}
          </p>
        </div>
      </div>
    </section>
  );
}
