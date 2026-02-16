"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";

import { trackEvent } from "@/src/lib/analytics";
import { devLog } from "@/src/lib/dev-log";

type BeforeAfterSliderProps = {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel: string;
  afterLabel: string;
};

export function BeforeAfterSlider({ beforeSrc, afterSrc, beforeLabel, afterLabel }: BeforeAfterSliderProps) {
  const [ratio, setRatio] = useState(0.52);
  const [tracked, setTracked] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const updateRatio = useCallback((clientX: number) => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const rect = root.getBoundingClientRect();
    const next = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));

    setRatio(next);

    if (!tracked) {
      setTracked(true);
      trackEvent("before_after_interaction", { ratio: Math.round(next * 100) });
      devLog("before_after_interaction", { ratio: next });
    }
  }, [tracked]);

  return (
    <div className="rounded-[1.5rem] border border-brand-book-edge/85 bg-brand-ink/45 p-4">
      <div
        ref={rootRef}
        className="relative aspect-[16/9] overflow-hidden rounded-2xl"
        onPointerDown={(event) => {
          updateRatio(event.clientX);

          const onMove = (moveEvent: PointerEvent) => updateRatio(moveEvent.clientX);
          const onUp = () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
          };

          window.addEventListener("pointermove", onMove);
          window.addEventListener("pointerup", onUp);
        }}
      >
        <Image src={beforeSrc} alt={beforeLabel} fill className="object-cover" sizes="(max-width: 768px) 100vw, 60vw" />

        <div className="absolute inset-y-0 right-0" style={{ width: `${(1 - ratio) * 100}%` }}>
          <div className="relative h-full w-full overflow-hidden">
            <Image
              src={afterSrc}
              alt={afterLabel}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 60vw"
            />
          </div>
        </div>

        <motion.div
          className="absolute inset-y-0 z-10 w-px bg-brand-gold"
          style={{ left: `${ratio * 100}%` }}
          transition={{ type: "spring", stiffness: 220, damping: 28 }}
        >
          <div className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-1/2 items-center justify-center rounded-full border border-brand-gold bg-brand-ink/85 text-[10px] font-semibold tracking-[0.08em] text-brand-gold uppercase">
            drag
          </div>
        </motion.div>

        <div className="absolute top-3 left-3 rounded-full bg-black/55 px-3 py-1 text-[10px] tracking-[0.16em] uppercase text-brand-paper">
          {beforeLabel}
        </div>
        <div className="absolute top-3 right-3 rounded-full bg-black/55 px-3 py-1 text-[10px] tracking-[0.16em] uppercase text-brand-paper">
          {afterLabel}
        </div>

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,transparent_45%,rgba(0,0,0,0.42)_100%)]" />
      </div>
    </div>
  );
}
