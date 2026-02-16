"use client";

import { useEffect, useState } from "react";

import { CountUpValue } from "@/src/components/landing/CountUpValue";
import { trackEvent } from "@/src/lib/analytics";
import { devLog } from "@/src/lib/dev-log";

const REGULAR_RATE = 40;
const FIRST_DROP_RATE = 35;
const SPECIAL_RATE = 30;
const LIMITED_RATE = 25;

function clampSquareMeters(value: number) {
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.max(1, Math.min(500, Math.round(value)));
}

export function SavingsCalculator() {
  const [sqm, setSqm] = useState(80);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (!hasInteracted) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      trackEvent("calculator_interaction", { sqm });
      devLog("calculator_interaction", { sqm });
    }, 260);

    return () => window.clearTimeout(timeoutId);
  }, [sqm, hasInteracted]);

  const regular = sqm * REGULAR_RATE;
  const firstDrop = sqm * FIRST_DROP_RATE;
  const special = sqm * SPECIAL_RATE;
  const limited = sqm * LIMITED_RATE;
  const savingsFirstDrop = regular - firstDrop;
  const savingsSpecial = regular - special;
  const savingsLimited = regular - limited;

  return (
    <div className="rounded-3xl border border-brand-gold/30 bg-brand-ink/45 p-5">
      <p className="text-brand-gold text-xs tracking-[0.2em] uppercase">Interaktivni kalkulator</p>

      <label htmlFor="sqm-input" className="text-brand-paper-muted mt-3 block text-sm">
        Unesite kvadraturu
      </label>
      <input
        id="sqm-input"
        type="number"
        min={1}
        max={500}
        value={sqm}
        onChange={(event) => {
          setHasInteracted(true);
          setSqm(clampSquareMeters(Number(event.target.value)));
        }}
        className="input-base mt-2"
      />

      <div className="mt-4 grid gap-2 text-sm">
        <p className="text-brand-paper-muted">
          Realna (40€): <CountUpValue value={regular} suffix="€" className="text-brand-paper font-semibold" />
        </p>
        <p className="text-brand-paper-muted">
          Prva promo (35€): <CountUpValue value={firstDrop} suffix="€" className="text-brand-gold font-semibold" />
        </p>
        <p className="text-brand-paper-muted">
          Specijalna (30€): <CountUpValue value={special} suffix="€" className="text-brand-gold font-semibold" />
        </p>
        <p className="text-brand-paper-muted">
          Ultra limited (25€): <CountUpValue value={limited} suffix="€" className="text-brand-gold font-semibold" />
        </p>
      </div>

      <div className="mt-4 rounded-2xl border border-brand-gold/35 bg-brand-bordo/40 px-4 py-3">
        <p className="text-brand-paper-muted text-sm">
          Usteda (35€): <CountUpValue value={savingsFirstDrop} suffix="€" className="text-brand-gold font-semibold" />
        </p>
        <p className="text-brand-paper-muted mt-1 text-sm">
          Usteda (30€): <CountUpValue value={savingsSpecial} suffix="€" className="text-brand-gold font-semibold" />
        </p>
        <p className="text-brand-paper mt-1 text-sm">
          Usteda (25€): <CountUpValue value={savingsLimited} suffix="€" className="text-brand-gold font-semibold" />
        </p>
      </div>
    </div>
  );
}
