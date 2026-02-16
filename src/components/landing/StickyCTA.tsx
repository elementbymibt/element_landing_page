"use client";

import { motion } from "framer-motion";

import { BookingButton } from "@/src/components/landing/booking-button";
import { IntakeButton } from "@/src/components/landing/intake-button";

export function StickyCTA() {
  return (
    <>
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="border-brand-book-edge/90 bg-brand-ink/92 fixed inset-x-0 top-0 z-[88] hidden border-b px-4 py-3 backdrop-blur md:block"
      >
        <div className="mx-auto flex max-w-4xl items-center justify-center gap-3">
          <BookingButton location="desktop_sticky" trackStickyClick className="px-5 py-2 text-xs" />
          <IntakeButton location="desktop_sticky" trackStickyClick className="px-5 py-2 text-xs" />
        </div>
      </motion.div>

      <div className="border-brand-book-edge/90 bg-brand-ink/95 fixed inset-x-0 bottom-0 z-[88] border-t p-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-lg gap-2">
          <BookingButton
            location="mobile_sticky"
            trackStickyClick
            className="flex-1 px-3 py-2 text-[11px]"
            label="Zakazi besplatne konsultacije"
          />
          <IntakeButton
            location="mobile_sticky"
            trackStickyClick
            className="flex-1 px-3 py-2 text-[11px]"
            label="Popuni upitnik"
          />
        </div>
      </div>
    </>
  );
}
