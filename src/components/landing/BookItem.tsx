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
};

export function BookItem({
  title,
  valuePerM2,
  index,
  active,
  logoLabel = "ELEMENT",
  microcopy = "Ukljuceno u projekat bez dodatnih skrivenih troskova.",
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
    <div className="w-full lg:w-[170px] xl:w-[184px]">
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 24, rotateY: -10 }}
        animate={active ? { opacity: 1, y: 0, rotateY: 0 } : undefined}
        transition={{ duration: 0.58, delay: index * 0.3, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ rotateY: 6, rotateX: -2, y: -3 }}
        onClick={() => setExpanded((prev) => !prev)}
        className="group relative h-[228px] w-full overflow-hidden rounded-2xl border border-brand-gold/35 bg-[linear-gradient(170deg,#3b0d18_0%,#2a0912_50%,#3a0c17_100%)] p-0 text-left shadow-[0_22px_40px_rgba(18,5,10,0.52)]"
        style={{ transformStyle: "preserve-3d", perspective: "1200px" }}
        aria-expanded={expanded}
        aria-label={`${title} - ${valuePerM2} evra po kvadratu`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(201,163,93,0.2),transparent_45%)]" />

        <div className="absolute top-0 left-0 h-full w-[40px] border-r border-brand-gold/38 bg-[linear-gradient(180deg,#23070f_0%,#3b0d18_100%)]">
          <span
            className="absolute top-3 left-1/2 -translate-x-1/2 text-[10px] font-semibold tracking-[0.2em] uppercase text-brand-gold"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          >
            {spineLabel}
          </span>
        </div>

        <div className="ml-[40px] flex h-full flex-col justify-between p-4">
          <div className="space-y-3">
            <p className="text-brand-paper-muted text-[10px] tracking-[0.22em] uppercase">{logoLabel}</p>
            <p className="text-brand-paper line-clamp-3 text-base leading-snug font-semibold">{title}</p>
            <p className="text-brand-paper-muted line-clamp-2 text-xs leading-relaxed">{microcopy}</p>
            <p className="text-brand-gold text-xs tracking-[0.16em] uppercase">Vrednost</p>
            <motion.p
              animate={active ? { scale: [0.86, 1.12, 1] } : { scale: 1 }}
              transition={{ duration: 0.65, delay: 0.06 + index * 0.03, ease: [0.22, 1, 0.36, 1] }}
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
            animate={{ opacity: 1, y: 0, scale: [0.82, 1.16, 1] }}
            transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
            className="text-brand-gold text-center text-sm font-semibold"
          >
            + <CountUpValue value={valuePerM2} fromValue={0} durationMs={700} suffix="€/m2" />
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
