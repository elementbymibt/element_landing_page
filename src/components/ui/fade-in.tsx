"use client";

import { motion } from "framer-motion";

import { cn } from "@/src/lib/utils";

export function FadeIn({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
