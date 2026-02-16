"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type BonusItem = {
  title: string;
  formerValue: string;
};

type BonusStackProps = {
  items: readonly BonusItem[];
};

export function BonusStack({ items }: BonusStackProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const [revealCount, setRevealCount] = useState(0);
  const [freeCount, setFreeCount] = useState(0);

  useEffect(() => {
    if (!inView) {
      return;
    }

    let reveal = 0;
    const revealId = window.setInterval(() => {
      reveal += 1;
      setRevealCount(reveal);

      if (reveal >= items.length) {
        window.clearInterval(revealId);

        let free = 0;
        const freeId = window.setInterval(() => {
          free += 1;
          setFreeCount(free);

          if (free >= items.length) {
            window.clearInterval(freeId);
          }
        }, 190);
      }
    }, 170);

    return () => {
      window.clearInterval(revealId);
    };
  }, [inView, items.length]);

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-3xl border border-brand-gold/35 bg-[linear-gradient(150deg,#2a0b15_0%,#3b0d18_52%,#290913_100%)] p-5 sm:p-6"
    >
      <div className="pointer-events-none absolute top-3 -left-10 rotate-[-24deg] rounded-full border border-brand-gold/45 bg-[linear-gradient(120deg,#3b0d18_0%,#5f2d24_100%)] px-16 py-1 text-xs font-semibold tracking-[0.2em] text-brand-neutral-100 uppercase">
        FREE BONUS
      </div>

      <p className="text-brand-gold text-xs tracking-[0.22em] uppercase">BONUS VREDNOST DODATA BEZ DOPLATE</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => (
          <div key={item.title} className="relative min-h-[118px]">
            <motion.article
              initial={{ opacity: 0, y: 18, rotateX: 4 }}
              animate={index < revealCount ? { opacity: 1, y: 0, rotateX: 0, scale: [0.9, 1.06, 1] } : undefined}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-full overflow-hidden rounded-2xl border border-brand-gold/25 bg-brand-ink/58 px-4 py-3 shadow-[0_18px_36px_rgba(16,5,9,0.45)]"
            >
              <div className="pointer-events-none absolute top-0 left-0 h-full w-[34px] border-r border-brand-gold/28 bg-[linear-gradient(180deg,#22070f_0%,#3b0d18_100%)]" />

              <div className="ml-10">
                <p className="text-brand-paper text-sm leading-relaxed">{item.title}</p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="relative text-xs tracking-[0.18em] uppercase text-brand-paper-muted">
                    {item.formerValue}
                    <motion.span
                      animate={index < freeCount ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
                      transition={{ duration: 0.32 }}
                      className="absolute top-1/2 left-0 h-[2px] w-full origin-left bg-brand-gold"
                    />
                  </span>
                  <motion.span
                    animate={index < freeCount ? { opacity: 1, scale: [0.86, 1.18, 1] } : { opacity: 0 }}
                    transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
                    className="rounded-full border border-brand-gold/50 bg-[linear-gradient(120deg,#3b0d18_0%,#5f2d24_100%)] px-2 py-1 text-[10px] font-semibold tracking-[0.16em] uppercase text-brand-neutral-100"
                  >
                    FREE
                  </motion.span>
                </div>
              </div>
            </motion.article>
          </div>
        ))}
      </div>
    </div>
  );
}
