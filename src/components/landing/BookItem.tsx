"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { CountUpValue } from "@/src/components/landing/CountUpValue";
import { cn } from "@/src/lib/utils";

type BookItemProps = {
  title: string;
  valuePerM2: number;
  index: number;
  active: boolean;
  logoLabel?: string;
  microcopy?: string;
  freeRibbon?: boolean;
};

export function BookItem({
  title,
  valuePerM2,
  index,
  active,
  logoLabel = "ELEMENT",
  microcopy = "Ukljuceno u projekat bez dodatnih skrivenih troskova.",
  freeRibbon = false,
}: BookItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [showPlus, setShowPlus] = useState(false);
  const spineLabel = title.split(" ")[0] || title;

  useEffect(() => {
    if (!active) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowPlus(true);
    }, 220);

    return () => window.clearTimeout(timeoutId);
  }, [active]);

  return (
    <div className="w-full">
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 28, rotateY: -14, rotateX: 3 }}
        animate={active ? { opacity: 1, y: 0, rotateY: 0, rotateX: 0 } : undefined}
        transition={{ duration: 0.56, delay: index * 0.22, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ rotateY: 8, rotateX: -3, y: -4 }}
        onClick={() => setExpanded((prev) => !prev)}
        className="group relative h-[244px] w-full overflow-hidden rounded-[1.1rem] border border-brand-gold/36 bg-[linear-gradient(172deg,#3b0d18_0%,#2b0912_56%,#3b0d18_100%)] p-0 text-left shadow-[0_22px_42px_rgba(18,5,10,0.56)]"
        style={{ transformStyle: "preserve-3d", perspective: "1200px" }}
        aria-expanded={expanded}
        aria-label={`${title} - ${valuePerM2} evra po kvadratu`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_14%,rgba(201,163,93,0.18),transparent_44%)]" />
        <div className="pointer-events-none absolute top-0 right-0 h-full w-[16px] border-l border-brand-gold/24 bg-[linear-gradient(180deg,#27130f_0%,#3e332d_100%)]" />

        <div className="absolute top-0 left-0 h-full w-[38px] border-r border-brand-gold/36 bg-[linear-gradient(180deg,#24080f_0%,#3b0d18_100%)]">
          <span
            className="absolute top-3 left-1/2 -translate-x-1/2 text-[9px] font-semibold tracking-[0.22em] uppercase text-brand-gold"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          >
            {spineLabel}
          </span>
        </div>

        {freeRibbon ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={active ? { opacity: 1, scale: [0.88, 1.08, 1] } : undefined}
            transition={{ duration: 0.54, delay: 0.12 + index * 0.04, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute top-7 -left-8 rotate-[-58deg] border border-brand-gold/40 bg-[linear-gradient(120deg,#a42b2e_0%,#df4d57_100%)] px-10 py-1 text-xs font-semibold tracking-[0.14em] uppercase text-white"
          >
            FREE
          </motion.div>
        ) : null}

        <div className="ml-[38px] mr-[16px] flex h-full flex-col justify-between p-4">
          <div className="space-y-3">
            <p className="text-brand-paper-muted text-[9px] tracking-[0.24em] uppercase">{logoLabel}</p>
            <p className="text-brand-paper line-clamp-3 text-[15px] leading-snug font-semibold">{title}</p>
            <p className="text-brand-paper-muted line-clamp-2 text-xs leading-relaxed">{microcopy}</p>
            <p className="text-brand-gold text-xs tracking-[0.16em] uppercase">Vrednost</p>
            <motion.p
              animate={active ? { scale: [0.78, 1.16, 1] } : { scale: 1 }}
              transition={{ duration: 0.66, delay: 0.06 + index * 0.03, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-3xl leading-none text-brand-gold"
            >
              {valuePerM2}
              <span className="text-base">€/m2</span>
            </motion.p>
          </div>

          <div
            className={cn(
              "text-brand-paper-muted text-xs transition-all duration-300",
              expanded ? "max-h-16 opacity-100" : "max-h-0 opacity-0 lg:max-h-16 lg:opacity-85",
            )}
          >
            {microcopy}
          </div>
        </div>
      </motion.button>

      <div className="mt-2 h-6">
        {showPlus ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0, scale: [0.68, 1.2, 1] }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-brand-gold text-center text-sm font-semibold"
          >
            + <CountUpValue value={valuePerM2} fromValue={0} durationMs={700} suffix="€/m2" />
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
