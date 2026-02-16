"use client";

import { motion } from "framer-motion";

type BonusStackProps = {
  items: readonly string[];
};

export function BonusStack({ items }: BonusStackProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-brand-gold/35 bg-[linear-gradient(150deg,#2a0b15_0%,#3b0d18_52%,#290913_100%)] p-5 sm:p-6">
      <div className="pointer-events-none absolute top-3 -left-10 rotate-[-24deg] rounded-full bg-[#9f1d2d] px-16 py-1 text-xs font-semibold tracking-[0.2em] text-white uppercase">
        FREE BONUS
      </div>

      <p className="text-brand-gold text-xs tracking-[0.22em] uppercase">BONUS VREDNOST DODATA BEZ DOPLATE</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((item, index) => (
          <motion.article
            key={item}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.42, delay: index * 0.08 }}
            className="rounded-2xl border border-brand-gold/25 bg-brand-ink/50 px-4 py-3"
          >
            <p className="text-brand-paper text-sm leading-relaxed">{item}</p>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
