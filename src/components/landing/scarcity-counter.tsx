"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const STORAGE_KEY = "element_landing_slots";
const TOTAL_SLOTS = 10;
const DEFAULT_SLOTS = 7;
const MIN_SLOTS = 4;
const UPDATE_INTERVAL_MS = 1000 * 60 * 60 * 8;

type SlotState = {
  value: number;
  updatedAt: number;
};

function clampValue(value: number) {
  return Math.max(MIN_SLOTS, Math.min(TOTAL_SLOTS, value));
}

export function ScarcityCounter() {
  const [available, setAvailable] = useState(DEFAULT_SLOTS);
  const [didUpdate, setDidUpdate] = useState(false);

  useEffect(() => {
    const now = Date.now();
    const applyState = (value: number, updated: boolean) => {
      window.setTimeout(() => {
        setAvailable(value);
        setDidUpdate(updated);
      }, 0);
    };

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const initial: SlotState = { value: DEFAULT_SLOTS, updatedAt: now };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        applyState(initial.value, false);
        return;
      }

      const parsed = JSON.parse(raw) as Partial<SlotState>;
      const savedValue = typeof parsed.value === "number" ? clampValue(parsed.value) : DEFAULT_SLOTS;
      const savedUpdatedAt = typeof parsed.updatedAt === "number" ? parsed.updatedAt : now;

      if (now - savedUpdatedAt >= UPDATE_INTERVAL_MS && savedValue > MIN_SLOTS) {
        const nextValue = clampValue(savedValue - 1);
        const nextState: SlotState = { value: nextValue, updatedAt: now };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
        applyState(nextValue, true);
        return;
      }

      applyState(savedValue, false);
    } catch {
      applyState(DEFAULT_SLOTS, false);
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className="border-brand-gold/40 bg-brand-ink/50 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm"
    >
      <span className="text-brand-paper-muted">Dostupno mesta:</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={available}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          className="text-brand-gold font-semibold"
        >
          {available} / {TOTAL_SLOTS}
        </motion.span>
      </AnimatePresence>
      {didUpdate ? <span className="text-brand-gold/70 text-xs">ažurirano</span> : null}
    </motion.div>
  );
}
