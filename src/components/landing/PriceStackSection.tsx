"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { BookItem } from "@/src/components/landing/BookItem";
import { BonusStack } from "@/src/components/landing/BonusStack";
import { BookingButton } from "@/src/components/landing/booking-button";
import { CountUpValue } from "@/src/components/landing/CountUpValue";
import { FollowElementLinks } from "@/src/components/landing/FollowElementLinks";
import { IntakeButton } from "@/src/components/landing/intake-button";
import { PriceReveal } from "@/src/components/landing/PriceReveal";
import { devLog } from "@/src/lib/dev-log";

const priceBooks = [
  { title: "Idejno resenje", valuePerM2: 10, microcopy: "Funkcionalan koncept prostora pre radova." },
  { title: "3D vizualizacija", valuePerM2: 8, microcopy: "Vidite finalni izgled pre realizacije." },
  { title: "Raspored instalacija", valuePerM2: 5, microcopy: "Precizan plan tacaka i prikljucaka." },
  { title: "Plan rasvete", valuePerM2: 4, microcopy: "Scene svetla za bolji ambijent i funkciju." },
  { title: "Spisak namestaja i dobavljaca", valuePerM2: 4, microcopy: "Jasan put kupovine bez improvizacije." },
  { title: "2 revizije", valuePerM2: 4, microcopy: "Dve iteracije za fino podesavanje projekta." },
  { title: "Besplatne konsultacije + 3 saveta", valuePerM2: 5, microcopy: "Na konsultacijama odmah dobijate 3 konkretna saveta." },
] as const;

const bonusItems = [
  "Budzet po prostorijama",
  "Plan fazne realizacije",
  "Mini vodic za realizaciju bez gresaka",
  "2 konsultacije po 1h",
  "+ 1 dodatna revizija GRATIS",
] as const;

export function PriceStackSection() {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const [activeCount, setActiveCount] = useState(0);
  const [showFormula, setShowFormula] = useState(false);
  const totalValue = priceBooks.reduce((sum, item) => sum + item.valuePerM2, 0);

  useEffect(() => {
    if (!inView) {
      return;
    }

    let current = 0;

    const intervalId = window.setInterval(() => {
      current += 1;
      setActiveCount(current);

      if (current >= priceBooks.length) {
        window.clearInterval(intervalId);
        window.setTimeout(() => {
          setShowFormula(true);
        }, 260);
      }
    }, 300);

    devLog("price_stack_start", {
      items: priceBooks.length,
    });

    return () => window.clearInterval(intervalId);
  }, [inView]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden rounded-[2rem] border border-brand-gold/35 bg-[linear-gradient(145deg,#2a0a14_0%,#3b0d18_48%,#1e0810_100%)] px-5 py-8 shadow-[0_28px_90px_rgba(4,2,2,0.58)] sm:px-8 sm:py-10 lg:px-10"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(201,163,93,0.18),transparent_44%),radial-gradient(circle_at_84%_20%,rgba(0,0,0,0.3),transparent_55%)]" />

      <div className="relative z-10">
        <p className="text-brand-gold text-xs tracking-[0.28em] uppercase">POGLAVLJE 02</p>
        <h2 className="font-display mt-3 text-4xl leading-tight text-brand-paper sm:text-5xl">Kompletna vrednost projekta</h2>
        <p className="text-brand-paper-muted mt-3 text-sm leading-relaxed sm:text-base">
          Ovo je sve sto dobijate - pre nego sto vidite cenu.
        </p>

        <div className="mt-7 space-y-3 lg:hidden">
          {priceBooks.map((book, index) => (
            <BookItem
              key={book.title}
              title={book.title}
              valuePerM2={book.valuePerM2}
              microcopy={book.microcopy}
              index={index}
              active={index < activeCount}
              logoLabel="ELEMENT"
            />
          ))}
        </div>

        <div className="mt-8 hidden overflow-x-auto pb-2 lg:block">
          <div className="flex min-w-max gap-4">
            {priceBooks.map((book, index) => (
              <BookItem
                key={book.title}
                title={book.title}
                valuePerM2={book.valuePerM2}
                microcopy={book.microcopy}
                index={index}
                active={index < activeCount}
                logoLabel="ELEMENT"
              />
            ))}
          </div>
        </div>

        <div className="mt-8 min-h-[98px]">
          {showFormula ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-brand-gold/28 bg-brand-ink/45 px-4 py-4"
            >
              <p className="text-brand-paper text-sm sm:text-base">
                {priceBooks.map((book, index) => (
                  <span key={book.title}>
                    <motion.span
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0, scale: [0.84, 1.1, 1] }}
                      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                      className="inline-block"
                    >
                      <CountUpValue value={book.valuePerM2} fromValue={0} durationMs={680 + index * 80} />
                    </motion.span>
                    {index < priceBooks.length - 1 ? " + " : " = "}
                  </span>
                ))}
                <span className="font-semibold text-brand-gold">
                  <CountUpValue value={totalValue} fromValue={0} durationMs={1200} suffix="€/m2" />
                </span>
              </p>
              <p className="text-brand-gold mt-2 text-xs tracking-[0.2em] uppercase">
                UKUPNA REALNA VREDNOST: {totalValue}€/m2
              </p>
            </motion.div>
          ) : null}
        </div>

        <div className="mt-6">
          <PriceReveal startValue={40} firstDropValue={35} secondDropValue={30} finalValue={25} />
        </div>

        <div className="mt-6">
          <BonusStack items={bonusItems} />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <BookingButton location="price_stack_primary" className="w-full sm:w-auto" />
          <IntakeButton location="price_stack_secondary" className="w-full sm:w-auto" />
        </div>

        <FollowElementLinks location="price_stack_follow" className="mx-auto mt-5 max-w-xl" />
      </div>
    </section>
  );
}
