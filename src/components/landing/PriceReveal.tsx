"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { CountUpValue } from "@/src/components/landing/CountUpValue";

type PriceRevealProps = {
  startValue: number;
  firstDropValue: number;
  secondDropValue: number;
  finalValue: number;
};

export function PriceReveal({ startValue, firstDropValue, secondDropValue, finalValue }: PriceRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const [phase, setPhase] = useState<0 | 1 | 2 | 3 | 4>(0);

  useEffect(() => {
    if (!inView) {
      return;
    }

    const timers = [
      window.setTimeout(() => setPhase(1), 180),
      window.setTimeout(() => setPhase(2), 860),
      window.setTimeout(() => setPhase(3), 1520),
      window.setTimeout(() => setPhase(4), 2320),
    ];

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [inView]);

  const rows = [
    {
      label: "Realna cena",
      value: startValue,
      from: 0,
      visibleAt: 1,
      strikeAt: 2,
    },
    {
      label: "Prva promo cena",
      value: firstDropValue,
      from: startValue,
      visibleAt: 2,
      strikeAt: 3,
    },
    {
      label: "Specijalna cena",
      value: secondDropValue,
      from: firstDropValue,
      visibleAt: 3,
      strikeAt: 4,
    },
  ] as const;

  return (
    <section
      ref={ref}
      className="relative overflow-hidden rounded-3xl border border-brand-gold/36 bg-[linear-gradient(150deg,#1f0710_0%,#3b0d18_58%,#1a060e_100%)] p-6 sm:p-8"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,rgba(201,163,93,0.16),transparent_42%),radial-gradient(circle_at_50%_120%,rgba(0,0,0,0.72),transparent_65%)]" />

      <div className="relative z-10">
        <p className="text-brand-paper-muted text-xs tracking-[0.2em] uppercase text-center">Transformacija cene</p>

        <div className="mt-5 space-y-4">
          {rows.map((row) => (
            <motion.div
              key={row.label}
              initial={{ opacity: 0, y: 10 }}
              animate={phase >= row.visibleAt ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.35 }}
              className="text-center"
            >
              <p className="text-brand-gold text-xs tracking-[0.2em] uppercase">{row.label}</p>
              <div className="relative mt-1 inline-flex items-center justify-center">
                <motion.p
                  animate={phase >= row.visibleAt ? { scale: [0.72, 1.18, 1] } : { scale: 1 }}
                  transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
                  className="font-display text-5xl leading-none text-brand-paper sm:text-6xl"
                >
                  <CountUpValue value={row.value} fromValue={row.from} durationMs={780} suffix="€/m2" />
                </motion.p>
                <motion.span
                  animate={phase >= row.strikeAt ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-1/2 left-0 h-[3px] w-full origin-left bg-[linear-gradient(90deg,#c9a35d_0%,#df4d57_100%)]"
                />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={phase >= 4 ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.42 }}
          className="mt-8"
        >
          <div className="grid items-center gap-5 lg:grid-cols-[1fr_auto_auto]">
            <div className="rounded-2xl border border-brand-gold/35 bg-brand-ink/55 px-4 py-4 text-center lg:text-left">
              <p className="text-brand-paper-muted text-xs tracking-[0.16em] uppercase">Ukupna vrednost pre finalnog popusta</p>
              <div className="relative mt-2 inline-flex items-center">
                <span className="font-display text-4xl text-brand-paper sm:text-5xl">
                  <CountUpValue value={startValue} fromValue={0} durationMs={900} suffix="€/m2" />
                </span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={phase >= 4 ? { scaleX: 1 } : undefined}
                  transition={{ duration: 0.36, delay: 0.1 }}
                  className="absolute top-1/2 left-0 h-[3px] w-full origin-left bg-[linear-gradient(90deg,#df4d57_0%,#c9a35d_100%)]"
                />
              </div>
              <p className="text-brand-paper mt-2 text-xs leading-relaxed">+ dodata vrednost + 3 saveta na konsultacijama</p>
            </div>

            <motion.div
              animate={phase >= 4 ? { scale: [0.8, 1.18, 1] } : { scale: 1 }}
              transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-center text-6xl text-brand-gold"
            >
              =
            </motion.div>

            <motion.div
              animate={phase >= 4 ? { scale: [0.62, 1.18, 1], rotate: [0, -4, 0] } : { scale: 1, rotate: 0 }}
              transition={{ duration: 0.96, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto h-[170px] w-[170px]"
              style={{
                clipPath:
                  "polygon(50% 0%, 59% 18%, 78% 6%, 74% 26%, 95% 24%, 82% 42%, 100% 50%, 82% 58%, 95% 76%, 74% 74%, 78% 94%, 59% 82%, 50% 100%, 41% 82%, 22% 94%, 26% 74%, 5% 76%, 18% 58%, 0% 50%, 18% 42%, 5% 24%, 26% 26%, 22% 6%, 41% 18%)",
              }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(145deg,#f0e8dd_0%,#c9a35d_46%,#b8a06a_100%)]" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-brand-bordo">Finalna cena</p>
                <p className="font-display mt-1 text-4xl leading-none text-brand-bordo">
                  <CountUpValue value={finalValue} fromValue={secondDropValue} durationMs={960} suffix="€/m2" />
                </p>
              </div>
            </motion.div>
          </div>

          <p className="text-brand-paper-muted mt-4 text-center text-xs tracking-[0.16em] uppercase">
            Limitirano na prvih 10 klijenata. Posle toga cena se vraca na 35 pa 40€/m2.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
