"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import { cn } from "@/src/lib/utils";

type BookChapterProps = {
  id?: string;
  chapter: string;
  title: string;
  subtitle?: string;
  left: React.ReactNode;
  right: React.ReactNode;
  highlight?: boolean;
  className?: string;
};

export function BookChapter({ id, chapter, title, subtitle, left, right, highlight = false, className }: BookChapterProps) {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const floatY = useTransform(scrollYProgress, [0, 1], [24, -24]);

  return (
    <motion.section
      id={id}
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, ease: "easeOut" }}
      className={cn(
        "relative overflow-hidden rounded-[2rem] border px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-14",
        highlight
          ? "border-brand-gold/50 bg-[linear-gradient(145deg,#201912_0%,#16120f_40%,#1d1510_100%)]"
          : "border-brand-book-edge bg-[linear-gradient(135deg,#171311_0%,#11100e_45%,#16110d_100%)]",
        className,
      )}
    >
      <motion.div
        style={{ y: floatY }}
        className="pointer-events-none absolute -top-20 -left-20 h-56 w-56 rounded-full bg-brand-gold/10 blur-3xl"
      />
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [-18, 20]) }}
        className="pointer-events-none absolute -right-24 -bottom-16 h-64 w-64 rounded-full bg-brand-claret/15 blur-3xl"
      />

      <p className="text-brand-gold/90 relative z-10 text-xs tracking-[0.33em] uppercase">{chapter}</p>
      <h2 className="font-display mt-3 text-3xl leading-tight text-brand-paper sm:text-4xl">{title}</h2>
      {subtitle ? <p className="mt-3 max-w-3xl text-sm leading-relaxed text-brand-paper-muted sm:text-base">{subtitle}</p> : null}

      <div className="relative mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] lg:gap-10">
        <div>{left}</div>
        <div className="hidden bg-[linear-gradient(to_bottom,transparent,#7d6740,transparent)] lg:block" />
        <div>{right}</div>
      </div>
    </motion.section>
  );
}
