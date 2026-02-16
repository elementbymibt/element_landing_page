"use client";

import { motion } from "framer-motion";

type BulletCard = {
  icon: string;
  title: string;
  text: string;
};

export function StackedBulletCards({ items }: { items: readonly BulletCard[] }) {
  return (
    <div className="grid gap-3">
      {items.map((item, index) => (
        <motion.article
          key={item.title}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.42, delay: index * 0.06 }}
          className="group rounded-2xl border border-brand-book-edge/80 bg-brand-ink/50 p-4"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-brand-gold/40 bg-brand-gold/10 text-sm text-brand-gold">
              <span aria-hidden>{item.icon}</span>
            </div>
            <div>
              <h3 className="text-brand-paper text-sm font-semibold sm:text-base">{item.title}</h3>
              <p className="text-brand-paper-muted mt-1 text-xs leading-relaxed sm:text-sm">{item.text}</p>
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
