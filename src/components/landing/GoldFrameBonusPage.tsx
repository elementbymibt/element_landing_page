"use client";

import { motion } from "framer-motion";

export function GoldFrameBonusPage({ items }: { items: readonly string[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-[1.75rem] border border-brand-gold/55 bg-[linear-gradient(145deg,#20150d_0%,#13100d_48%,#21160f_100%)] p-6 shadow-[0_0_0_1px_rgba(191,154,87,0.2),0_22px_68px_rgba(191,154,87,0.2)]"
    >
      <div className="pointer-events-none absolute -top-28 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-brand-gold/15 blur-3xl" />

      <div className="relative z-10">
        <p className="text-brand-gold text-xs tracking-[0.28em] uppercase">Grand Finale Bonus</p>
        <h3 className="font-display mt-2 text-3xl text-brand-paper">Dodatna vrednost ukljucena bez doplate</h3>

        <ul className="mt-5 space-y-2">
          {items.map((item) => (
            <li key={item} className="rounded-xl border border-brand-gold/30 bg-brand-ink/35 px-3 py-2 text-sm text-brand-paper">
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-6 inline-flex items-center rounded-full border border-brand-gold/55 bg-brand-gold/12 px-4 py-2 text-xs font-semibold tracking-[0.22em] uppercase text-brand-gold">
          SUPER DEAL
        </div>
      </div>
    </motion.div>
  );
}
