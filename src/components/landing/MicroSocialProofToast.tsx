"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

const messages = [
  "Nova prijava upravo poslata.",
  "Jedan termin konsultacija upravo rezervisan.",
  "Novi upitnik je upravo popunjen.",
] as const;

function randomDelay() {
  return 20000 + Math.round(Math.random() * 20000);
}

export function MicroSocialProofToast() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const message = useMemo(() => messages[index % messages.length], [index]);

  useEffect(() => {
    let showTimer = 0;
    let changeTimer = 0;

    const cycle = () => {
      setVisible(true);
      showTimer = window.setTimeout(() => {
        setVisible(false);
        changeTimer = window.setTimeout(() => {
          setIndex((current) => current + 1);
          cycle();
        }, 500);
      }, randomDelay());
    };

    cycle();

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(changeTimer);
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      {visible ? (
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="pointer-events-none fixed bottom-24 left-4 z-[91] max-w-[16rem] rounded-xl border border-brand-gold/32 bg-brand-ink/88 px-3 py-2 text-xs text-brand-paper-muted shadow-[0_10px_24px_rgba(0,0,0,0.35)] md:bottom-6"
        >
          {message}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
