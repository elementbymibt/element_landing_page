"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type AnimMode = "domino" | "ribbonDrop" | "loop" | "all" | "off";

type BonusItem = {
  title: string;
  formerValue: string;
};

type BonusStackProps = {
  items: readonly BonusItem[];
  offerExpired?: boolean;
  animMode?: AnimMode;
  dominoTriggered?: boolean;
};

function modeEnabled(mode: AnimMode, expected: Exclude<AnimMode, "off">) {
  return mode === "all" || mode === expected;
}

export function BonusStack({
  items,
  offerExpired = false,
  animMode = "all",
  dominoTriggered = false,
}: BonusStackProps) {
  const [activeCount, setActiveCount] = useState(0);
  const reducedMotion = useReducedMotion();
  const hasPlayed = useRef(false);

  useEffect(() => {
    if (hasPlayed.current) {
      return;
    }

    hasPlayed.current = true;

    let current = 0;
    const intervalId = window.setInterval(() => {
      current += 1;
      setActiveCount(current);

      if (current >= items.length) {
        window.clearInterval(intervalId);
      }
    }, 120);

    return () => window.clearInterval(intervalId);
  }, [items.length]);

  const allowRibbonDrop = !reducedMotion && modeEnabled(animMode, "ribbonDrop");
  const allowDomino = !reducedMotion && modeEnabled(animMode, "domino");

  return (
    <div className="relative overflow-hidden rounded-3xl border border-brand-gold/35 bg-[linear-gradient(150deg,#2a0b15_0%,#3b0d18_52%,#290913_100%)] p-5 sm:p-6">
      <div className="pointer-events-none absolute top-3 -left-11 rotate-[-25deg] border border-brand-gold/45 bg-[linear-gradient(120deg,#a42b2e_0%,#df4d57_100%)] px-16 py-1 text-xs font-semibold tracking-[0.2em] uppercase text-white">
        POGLAVLJE FREE 01
      </div>

      <p className="text-brand-gold text-xs tracking-[0.22em] uppercase">
        {offerExpired ? "BONUS ISTEKAO" : "BONUS VREDNOST DODATA BEZ DOPLATE"}
      </p>
      <p className="text-brand-paper-muted mt-2 text-sm">+ 3 konkretna saveta na konsultacijama ukljucena odmah.</p>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => {
          const active = index < activeCount;
          const shouldFall = active && allowDomino && dominoTriggered;
          const shouldDropRibbon = allowRibbonDrop && offerExpired;

          return (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 24, rotateY: -18 }}
              animate={
                shouldFall
                  ? { opacity: 1, y: 36, x: 14, rotateZ: 76, rotateY: -4 }
                  : active
                    ? { opacity: 1, y: 0, x: 0, rotateY: -10, rotateZ: 0 }
                    : { opacity: 0, y: 24, rotateY: -18 }
              }
              transition={{
                duration: shouldFall ? 0.5 : 0.4,
                delay: shouldFall ? index * 0.11 : 0,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative h-[214px] overflow-hidden rounded-[1.1rem] border border-brand-gold/36 bg-[linear-gradient(172deg,#3b0d18_0%,#2b0912_56%,#3b0d18_100%)] shadow-[0_22px_42px_rgba(18,5,10,0.56)]"
              style={{ perspective: 1100, transformStyle: "preserve-3d" }}
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_14%,rgba(201,163,93,0.18),transparent_44%)]" />
              <div className="pointer-events-none absolute top-0 right-0 h-full w-[16px] border-l border-brand-gold/24 bg-[linear-gradient(180deg,#27130f_0%,#3e332d_100%)]" />
              <div className="pointer-events-none absolute top-0 left-0 h-full w-[34px] border-r border-brand-gold/32 bg-[linear-gradient(180deg,#24080f_0%,#3b0d18_100%)]" />

              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={
                  shouldDropRibbon
                    ? {
                        opacity: 0,
                        y: 120,
                        x: 8,
                        rotate: -18,
                        filter: "blur(2px)",
                      }
                    : active
                      ? {
                          opacity: 1,
                          scale: [0.84, 1.08, 1],
                          y: 0,
                          x: 0,
                          rotate: -56,
                          filter: "blur(0px)",
                        }
                      : {
                          opacity: 0,
                        }
                }
                transition={{ duration: shouldDropRibbon ? 0.9 : 0.42, delay: shouldDropRibbon ? index * 0.08 : 0.08 }}
                className="pointer-events-none absolute top-6 -left-8 border border-brand-gold/45 bg-[linear-gradient(120deg,#a42b2e_0%,#df4d57_100%)] px-9 py-1 text-xs font-semibold tracking-[0.14em] uppercase text-white"
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
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="absolute top-1/2 left-0 h-[2px] w-full origin-left bg-brand-gold"
                    />
                  </p>
                  <motion.p
                    animate={active ? { opacity: 1, scale: [0.72, 1.18, 1] } : { opacity: 0 }}
                    transition={{ duration: 0.46, delay: 0.16 }}
                    className="text-brand-gold text-sm font-semibold"
                  >
                    {offerExpired ? "Bonus istekao" : "+ FREE"}
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
