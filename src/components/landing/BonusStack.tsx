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
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    if (!inView) {
      return;
    }

    let current = 0;
    const intervalId = window.setInterval(() => {
      current += 1;
      setActiveCount(current);

      if (current >= items.length) {
        window.clearInterval(intervalId);
      }
    }, 180);

    return () => window.clearInterval(intervalId);
  }, [inView, items.length]);

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-3xl border border-brand-gold/35 bg-[linear-gradient(150deg,#2a0b15_0%,#3b0d18_52%,#290913_100%)] p-5 sm:p-6"
    >
      <div className="pointer-events-none absolute top-3 -left-11 rotate-[-25deg] border border-brand-gold/45 bg-[linear-gradient(120deg,#a42b2e_0%,#df4d57_100%)] px-16 py-1 text-xs font-semibold tracking-[0.2em] text-white uppercase">
        POGLAVLJE FREE 01
      </div>

      <p className="text-brand-gold text-xs tracking-[0.22em] uppercase">BONUS VREDNOST + 3 SAVETA NA KONSULTACIJAMA</p>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => {
          const active = index < activeCount;

          return (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 20, rotateY: -14, rotateX: 3 }}
              animate={active ? { opacity: 1, y: 0, rotateY: 0, rotateX: 0 } : undefined}
              transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-[208px] overflow-hidden rounded-[1.1rem] border border-brand-gold/36 bg-[linear-gradient(172deg,#3b0d18_0%,#2b0912_56%,#3b0d18_100%)] shadow-[0_22px_42px_rgba(18,5,10,0.56)]"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_14%,rgba(201,163,93,0.18),transparent_44%)]" />
              <div className="pointer-events-none absolute top-0 right-0 h-full w-[16px] border-l border-brand-gold/24 bg-[linear-gradient(180deg,#27130f_0%,#3e332d_100%)]" />
              <div className="pointer-events-none absolute top-0 left-0 h-full w-[34px] border-r border-brand-gold/32 bg-[linear-gradient(180deg,#24080f_0%,#3b0d18_100%)]" />

              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={active ? { opacity: 1, scale: [0.84, 1.1, 1] } : undefined}
                transition={{ duration: 0.52, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-none absolute top-6 -left-8 rotate-[-56deg] border border-brand-gold/45 bg-[linear-gradient(120deg,#a42b2e_0%,#df4d57_100%)] px-9 py-1 text-xs font-semibold tracking-[0.14em] uppercase text-white"
              >
                FREE
              </motion.div>

              <div className="ml-[34px] mr-[16px] flex h-full flex-col justify-between p-4">
                <div>
                  <p className="text-brand-paper line-clamp-3 text-[15px] leading-snug font-semibold">{item.title}</p>
                </div>

                <div className="space-y-1">
                  <p className="relative inline-block text-xs tracking-[0.18em] uppercase text-brand-paper-muted">
                    {item.formerValue}
                    <motion.span
                      animate={active ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
                      transition={{ duration: 0.34, delay: 0.12 }}
                      className="absolute top-1/2 left-0 h-[2px] w-full origin-left bg-brand-gold"
                    />
                  </p>
                  <motion.p
                    animate={active ? { opacity: 1, scale: [0.7, 1.2, 1] } : { opacity: 0 }}
                    transition={{ duration: 0.58, delay: 0.16 }}
                    className="text-brand-gold text-sm font-semibold"
                  >
                    + FREE
                  </motion.p>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
