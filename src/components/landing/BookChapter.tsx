"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef } from "react";

import { cn } from "@/src/lib/utils";

type BookChapterProps = {
  id?: string;
  chapter: string;
  title: string;
  subtitle?: string;
  left: React.ReactNode;
  right: React.ReactNode;
  className?: string;
  highlight?: boolean;
  onView?: () => void;
};

export function BookChapter({
  id,
  chapter,
  title,
  subtitle,
  left,
  right,
  className,
  highlight = false,
  onView,
}: BookChapterProps) {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    if (inView) {
      onView?.();
    }
  }, [inView, onView]);

  return (
    <motion.section
      id={id}
      ref={ref}
      initial={{ opacity: 0, y: 42, rotateX: 1.8 }}
      animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : undefined}
      transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative overflow-hidden rounded-[2rem] border border-brand-book-edge/90 px-5 py-7 shadow-[0_28px_80px_rgba(5,3,2,0.55)] sm:px-8 sm:py-9 lg:px-12 lg:py-12",
        highlight
          ? "bg-[linear-gradient(145deg,#24190f_0%,#15110d_46%,#251a11_100%)]"
          : "bg-[linear-gradient(140deg,#17120f_0%,#12100d_48%,#18120f_100%)]",
        className,
      )}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:3px_3px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_6%,rgba(191,154,87,0.12),transparent_40%),radial-gradient(circle_at_88%_10%,rgba(114,67,56,0.14),transparent_42%)]" />

      <div className="relative z-10">
        <p className="text-brand-gold text-xs tracking-[0.34em] uppercase">{chapter}</p>
        <h2 className="font-display mt-3 text-3xl leading-tight text-brand-paper sm:text-4xl lg:text-5xl">{title}</h2>
        {subtitle ? <p className="text-brand-paper-muted mt-3 max-w-3xl text-sm leading-relaxed sm:text-base">{subtitle}</p> : null}
        <motion.div
          initial={{ scaleX: 0, opacity: 0.6 }}
          animate={inView ? { scaleX: 1, opacity: 1 } : undefined}
          transition={{ duration: 0.55, delay: 0.08, ease: "easeOut" }}
          className="mt-5 h-px origin-left bg-gradient-to-r from-brand-gold via-brand-gold/80 to-transparent"
        />
      </div>

      <div className="relative z-10 mt-7 grid gap-5 lg:grid-cols-2 lg:gap-7">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={inView ? { opacity: 1, x: 0 } : undefined}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="rounded-3xl border border-brand-book-edge/70 bg-brand-ink/45 p-4 sm:p-6"
        >
          {left}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={inView ? { opacity: 1, x: 0 } : undefined}
          transition={{ duration: 0.5, delay: 0.32 }}
          className={cn(
            "rounded-3xl border p-4 sm:p-6",
            highlight ? "border-brand-gold/50 bg-brand-ink/45" : "border-brand-book-edge/70 bg-brand-ink/42",
          )}
        >
          {right}
        </motion.div>
      </div>
    </motion.section>
  );
}
