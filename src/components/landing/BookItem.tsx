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
};

export function BookItem({ title, valuePerM2, index, active }: BookItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [showPlus, setShowPlus] = useState(false);

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
    <div className="w-full lg:w-[148px] xl:w-[156px]">
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 24, rotateY: -10 }}
        animate={active ? { opacity: 1, y: 0, rotateY: 0 } : undefined}
        transition={{ duration: 0.52, delay: index * 0.3, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ rotateY: 5, rotateX: -2, y: -2 }}
        onClick={() => setExpanded((prev) => !prev)}
        className="group relative h-[188px] w-full overflow-hidden rounded-2xl border border-brand-gold/25 bg-[linear-gradient(170deg,#2c0f18_0%,#3b0d18_52%,#2d0f18_100%)] p-0 text-left shadow-[0_20px_38px_rgba(0,0,0,0.42)]"
        style={{ transformStyle: "preserve-3d", perspective: "1200px" }}
        aria-expanded={expanded}
      >
        <div className="absolute top-0 left-0 h-full w-[34px] border-r border-brand-gold/35 bg-[linear-gradient(180deg,#250913_0%,#3b0d18_100%)]">
          <span
            className="absolute top-3 left-1/2 -translate-x-1/2 text-[10px] font-semibold tracking-[0.18em] uppercase text-brand-gold"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
          >
            BOOK {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <div className="ml-[34px] flex h-full flex-col justify-between p-4">
          <div>
            <p className="text-brand-paper line-clamp-3 text-sm leading-snug font-semibold uppercase">{title}</p>
            <p className="text-brand-gold mt-2 text-xs tracking-[0.16em] uppercase">Vrednost</p>
            <p className="font-display mt-1 text-2xl text-brand-gold">
              {valuePerM2}
              <span className="text-sm">€/m2</span>
            </p>
          </div>

          <div
            className={cn(
              "text-brand-paper-muted text-xs transition-all duration-300",
              expanded ? "max-h-16 opacity-100" : "max-h-0 opacity-0 lg:max-h-16 lg:opacity-80",
            )}
          >
            Ukljuceno u premium paketu.
          </div>
        </div>
      </motion.button>

      <div className="mt-2 h-6">
        {showPlus ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-brand-gold text-center text-sm font-semibold"
          >
            + <CountUpValue value={valuePerM2} fromValue={0} durationMs={700} suffix="€/m2" />
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
