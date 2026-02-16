"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef } from "react";

import { trackEvent } from "@/src/lib/analytics";
import { devLog } from "@/src/lib/dev-log";

const lines = [
  "Da li je zaista mnogo uloziti u prostor",
  "u kome cete ziveti,",
  "odmarati,",
  "i gledati kako Vasa deca odrastaju?",
] as const;

export function EmotionalTriggerSection() {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.45 });

  useEffect(() => {
    if (!inView) {
      return;
    }

    trackEvent("emotional_section_view", { section: "emotional_trigger" });
    devLog("emotional_section_view", { section: "emotional_trigger" });
  }, [inView]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden rounded-[2rem] border border-brand-gold/34 bg-[linear-gradient(150deg,#22110f_0%,#2f1512_52%,#21100f_100%)] px-6 py-10 text-center sm:px-10"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(201,163,93,0.14),transparent_46%)]" />

      <div className="relative z-10 space-y-3">
        {lines.map((line, index) => (
          <motion.p
            key={line}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 0.45, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-3xl leading-tight text-brand-paper sm:text-4xl"
          >
            {line}
          </motion.p>
        ))}

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.45, delay: 0.62 }}
          className="text-brand-paper-muted mx-auto mt-5 max-w-3xl text-sm leading-relaxed sm:text-base"
        >
          Prostor oblikuje Vas svakodnevni zivot. Dobro planiran prostor donosi mir. Lose planiran - konstantnu
          frustraciju.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.45, delay: 0.78 }}
          className="font-display text-brand-gold mt-4 text-3xl sm:text-4xl"
        >
          Ne ulazete u kvadrate. Ulazete u kvalitet zivota.
        </motion.p>
      </div>
    </section>
  );
}
