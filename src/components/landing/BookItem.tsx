"use client";

import { motion, useReducedMotion } from "framer-motion";

import { CountUpValue } from "@/src/components/landing/CountUpValue";
import { cn } from "@/src/lib/utils";

type AnimMode = "domino" | "ribbonDrop" | "loop" | "all" | "off";

type BookItemProps = {
  title: string;
  valuePerM2: number;
  microcopy: string;
  index: number;
  active: boolean;
  freeRibbon?: boolean;
  logoLabel?: string;
  animMode?: AnimMode;
  dominoTriggered?: boolean;
  ribbonDropped?: boolean;
};

function modeEnabled(mode: AnimMode, expected: Exclude<AnimMode, "off">) {
  return mode === "all" || mode === expected;
}

export function BookItem({
  title,
  valuePerM2,
  microcopy,
  index,
  active,
  freeRibbon = false,
  logoLabel,
  animMode = "loop",
  dominoTriggered = false,
  ribbonDropped = false,
}: BookItemProps) {
  const reducedMotion = useReducedMotion();

  const allowDomino = !reducedMotion && modeEnabled(animMode, "domino");
  const allowLoop = !reducedMotion && modeEnabled(animMode, "loop");
  const allowRibbonDrop = !reducedMotion && modeEnabled(animMode, "ribbonDrop");

  const state = !active ? "hidden" : allowDomino && dominoTriggered ? "falling" : "visible";
  const shouldDropRibbon = freeRibbon && ribbonDropped && allowRibbonDrop;

  return (
    <motion.article
      custom={index}
      initial="hidden"
      animate={state}
      variants={{
        hidden: { opacity: 0, y: 34, scale: 0.96 },
        visible: { opacity: 1, y: 0, x: 0, rotateZ: 0, scale: 1 },
        falling: {
          opacity: 1,
          y: 40,
          x: 18,
          rotateZ: 78,
          scale: 0.98,
        },
      }}
      transition={{
        duration: state === "falling" ? 0.52 : 0.46,
        delay: state === "falling" ? index * 0.11 : 0,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative min-h-[290px]"
      style={{ perspective: 1200, transformStyle: "preserve-3d" }}
    >
      <motion.div
        animate={
          allowLoop && active && !dominoTriggered
            ? {
                rotateY: [-13, -10, -13],
                y: [0, -3, 0],
              }
            : {
                rotateY: -12,
                y: 0,
              }
        }
        transition={
          allowLoop && active && !dominoTriggered
            ? {
                duration: 7 + index * 0.45,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
              }
            : { duration: 0.32 }
        }
        className="group relative h-full overflow-hidden rounded-[1.3rem] border border-brand-gold/34 bg-[linear-gradient(170deg,#3b0d18_0%,#2b0912_56%,#2d0a13_100%)] shadow-[0_24px_48px_rgba(14,4,8,0.54)]"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[45%] bg-[linear-gradient(180deg,rgba(201,163,93,0.12)_0%,transparent_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.34),transparent_70%)]" />

        <div className="pointer-events-none absolute top-0 right-0 h-full w-[18px] border-l border-brand-gold/28 bg-[linear-gradient(180deg,#20110d_0%,#3e332d_100%)]" />
        <div className="pointer-events-none absolute top-0 left-0 h-full w-[40px] border-r border-brand-gold/30 bg-[linear-gradient(180deg,#260810_0%,#3b0d18_100%)]" />

        {freeRibbon ? (
          <motion.div
            animate={
              shouldDropRibbon
                ? {
                    y: 120,
                    x: 10,
                    rotate: -14,
                    opacity: 0,
                    filter: "blur(2px)",
                  }
                : {
                    y: 0,
                    x: 0,
                    rotate: -42,
                    opacity: 1,
                    filter: "blur(0px)",
                  }
            }
            transition={{ duration: shouldDropRibbon ? 0.9 : 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute -top-1 -right-10 z-20 border border-white/18 bg-[linear-gradient(120deg,#a42b2e_0%,#df4d57_100%)] px-12 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase text-white shadow-[0_10px_20px_rgba(0,0,0,0.35)]"
          >
            POGLAVLJE FREE 01
          </motion.div>
        ) : null}

        <div className="relative z-10 ml-[40px] mr-[18px] flex h-full flex-col p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="text-brand-gold text-[10px] tracking-[0.22em] uppercase">Book {String(index + 1).padStart(2, "0")}</p>
            {logoLabel ? <p className="text-brand-paper-muted text-[10px] tracking-[0.28em] uppercase">{logoLabel}</p> : null}
          </div>

          <h3 className="text-brand-paper mt-3 text-[1.03rem] leading-tight font-semibold">{title}</h3>
          <p className="text-brand-paper-muted mt-2 text-xs leading-relaxed">{microcopy}</p>

          <div className="mt-auto space-y-1 pt-5">
            <p className="text-brand-paper-muted text-[11px] tracking-[0.16em] uppercase">Procenjena vrednost</p>
            <div className="font-display text-3xl leading-none text-brand-gold">
              <CountUpValue value={valuePerM2} fromValue={0} durationMs={560 + index * 70} suffix="€/m2" />
            </div>
            <motion.p
              animate={
                active
                  ? {
                      opacity: 1,
                      y: 0,
                      scale: [0.78, 1.12, 1],
                    }
                  : {
                      opacity: 0,
                      y: 8,
                      scale: 1,
                    }
              }
              transition={{ duration: 0.42, delay: 0.08 }}
              className={cn(
                "text-sm font-semibold",
                freeRibbon ? "text-brand-gold" : "text-brand-paper",
              )}
            >
              + {valuePerM2}€/m2
            </motion.p>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 -bottom-3 h-7 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.42),transparent_72%)]" />
      </motion.div>
    </motion.article>
  );
}
