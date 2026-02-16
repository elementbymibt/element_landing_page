"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

import { CountUpValue } from "@/src/components/landing/CountUpValue";

type SavingsOutcomeComparisonProps = {
  savings: number;
};

const outcomes = [
  {
    title: "Krevet premium",
    cost: 650,
    note: "Kvalitetan bračni krevet sa dušekom.",
  },
  {
    title: "Sofa",
    cost: 980,
    note: "Udobna sofa višeg segmenta.",
  },
  {
    title: "Letovanje",
    cost: 1200,
    note: "Vikend/kratko letovanje za dvoje.",
  },
] as const;

export function SavingsOutcomeComparison({ savings }: SavingsOutcomeComparisonProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });

  return (
    <section
      ref={ref}
      className="rounded-3xl border border-brand-gold/38 bg-[linear-gradient(150deg,#230812_0%,#3b0d18_55%,#1b070e_100%)] p-5 sm:p-6"
    >
      <p className="text-brand-gold text-xs tracking-[0.2em] uppercase">Sta realno dobijate ustedom</p>
      <h3 className="font-display mt-2 text-3xl text-brand-paper sm:text-4xl">Ustedom od {savings}€ mozete odmah da pokrijete:</h3>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {outcomes.map((item, index) => {
          const coverage = Math.max(0, Math.min(100, Math.round((savings / item.cost) * 100)));
          const isCovered = savings >= item.cost;
          const gap = Math.max(0, item.cost - savings);

          return (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 14 }}
              animate={inView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.48, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border border-brand-gold/26 bg-brand-ink/56 p-4"
            >
              <p className="text-brand-paper text-lg font-semibold">{item.title}</p>
              <p className="text-brand-paper-muted mt-1 text-sm">{item.note}</p>
              <p className="text-brand-paper-muted mt-2 text-xs tracking-[0.14em] uppercase">
                Procena: <CountUpValue value={item.cost} fromValue={0} suffix="€" durationMs={760} className="text-brand-paper font-semibold" />
              </p>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-ink/70">
                <motion.div
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${coverage}%` } : undefined}
                  transition={{ duration: 0.72, delay: 0.08 + index * 0.12 }}
                  className="h-full rounded-full bg-[linear-gradient(90deg,#c9a35d_0%,#b8a06a_100%)]"
                />
              </div>

              <p className="mt-2 text-xs leading-relaxed">
                {isCovered ? (
                  <span className="font-semibold text-brand-gold">Pokriveno ustedom ({coverage}%).</span>
                ) : (
                  <span className="text-brand-paper-muted">
                    Pokriva {coverage}% - nedostaje <CountUpValue value={gap} fromValue={0} suffix="€" durationMs={640} className="text-brand-gold font-semibold" />.
                  </span>
                )}
              </p>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
