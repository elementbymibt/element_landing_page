"use client";

import { motion } from "framer-motion";

const items = [
  "3 konkretna saveta za Vas prostor",
  "Uvid u budzetsku strukturu",
  "Jasnu sledecu fazu realizacije",
] as const;

export function ValueReminderBlock() {
  return (
    <section className="rounded-[2rem] border border-brand-gold/32 bg-[linear-gradient(150deg,#efe6d8_0%,#e8ddcc_46%,#d8cbb8_100%)] px-6 py-8 text-brand-bordo sm:px-10">
      <p className="text-xs tracking-[0.22em] uppercase text-brand-bordo/80">Pre finalnog koraka</p>
      <h3 className="font-display mt-3 text-3xl sm:text-4xl">Sta dobijate odmah na konsultacijama?</h3>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {items.map((item, index) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.35, delay: index * 0.08 }}
            className="rounded-2xl border border-brand-bordo/22 bg-white/34 px-4 py-3 text-sm"
          >
            {item}
          </motion.div>
        ))}
      </div>

      <p className="mt-4 text-sm italic">Bez obaveze nastavka saradnje.</p>
    </section>
  );
}
