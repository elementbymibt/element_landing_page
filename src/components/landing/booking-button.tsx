"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { publicConfig } from "@/src/lib/public-config";
import { trackEvent } from "@/src/lib/analytics";
import { cn } from "@/src/lib/utils";

type BookingButtonProps = {
  className?: string;
  location: string;
  label?: string;
};

export function BookingButton({ className, location, label = "ZAKAŽI BESPLATNE KONSULTACIJE" }: BookingButtonProps) {
  const [redirecting, setRedirecting] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  return (
    <>
      <button
        type="button"
        className={cn(
          "btn-primary min-h-12 rounded-full px-6 py-3 text-sm font-semibold tracking-wide uppercase",
          className,
        )}
        onClick={() => {
          if (redirecting) {
            return;
          }

          setRedirecting(true);
          setShowOverlay(true);
          trackEvent("booking_click", { location });

          setTimeout(() => {
            window.location.assign(publicConfig.bookingUrl);
          }, 500);
        }}
      >
        {redirecting ? "Preusmeravanje..." : label}
      </button>

      <AnimatePresence>
        {showOverlay ? (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="border-brand-gold/50 bg-brand-ink/95 text-brand-paper fixed right-4 bottom-6 z-[90] rounded-full border px-4 py-2 text-sm shadow-2xl"
          >
            Odlična odluka.
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
