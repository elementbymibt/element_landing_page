"use client";

import { motion } from "framer-motion";

export function UrgencyTopStrip() {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-[linear-gradient(90deg,#c9a35d_0%,#d5b274_50%,#c9a35d_100%)] fixed inset-x-0 top-0 z-[96] border-b border-brand-gold/45 px-3 py-1.5"
    >
      <p className="text-center text-[11px] font-medium tracking-[0.14em] uppercase text-brand-bordo sm:text-xs">
        Specijalna ponuda ogranicena vremenski i kolicinski.
      </p>
    </motion.div>
  );
}
