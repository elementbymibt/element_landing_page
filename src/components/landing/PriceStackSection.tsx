"use client";

import { motion, useInView } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { submitMicroleadAction } from "@/src/actions/microlead";
import { ApartmentExample } from "@/src/components/landing/ApartmentExample";
import { BonusStack } from "@/src/components/landing/BonusStack";
import { BookItem } from "@/src/components/landing/BookItem";
import { BookingButton } from "@/src/components/landing/booking-button";
import { CountUpValue } from "@/src/components/landing/CountUpValue";
import { FollowElementLinks } from "@/src/components/landing/FollowElementLinks";
import { IntakeButton } from "@/src/components/landing/intake-button";
import { PriceReveal } from "@/src/components/landing/PriceReveal";
import { trackEvent } from "@/src/lib/analytics";
import { devLog } from "@/src/lib/dev-log";
import { readUtmFromSearch } from "@/src/lib/utm";

const OFFER_DAYS_LEFT = 10;
const SLOTS_LEFT = 4;

const priceBooks = [
  { title: "Idejno resenje", valuePerM2: 10, microcopy: "Funkcionalan koncept prostora pre radova." },
  { title: "3D vizualizacija", valuePerM2: 8, microcopy: "Vidite finalni izgled pre realizacije." },
  { title: "Raspored instalacija", valuePerM2: 5, microcopy: "Precizan plan tacaka i prikljucaka." },
  { title: "Plan rasvete", valuePerM2: 4, microcopy: "Scene svetla za bolji ambijent i funkciju." },
  { title: "Spisak namestaja i dobavljaca", valuePerM2: 4, microcopy: "Jasan put kupovine bez improvizacije." },
  { title: "2 revizije", valuePerM2: 4, microcopy: "Dve iteracije za fino podesavanje projekta." },
  {
    title: "Besplatne konsultacije + 3 saveta",
    valuePerM2: 5,
    microcopy: "Na konsultacijama odmah dobijate 3 konkretna saveta.",
    freeRibbon: true,
  },
] as const;

const bonusBooks = [
  { title: "Budzet po prostorijama", formerValue: "5€/m2" },
  { title: "Plan fazne realizacije", formerValue: "4€/m2" },
  { title: "Mini vodic bez gresaka", formerValue: "4€/m2" },
  { title: "2 konsultacije po 1h", formerValue: "6€/m2" },
  { title: "+ 1 dodatna revizija", formerValue: "3€/m2" },
  { title: "+ 3 konkretna saveta na konsultacijama", formerValue: "3€/m2" },
] as const;

function isEmailValid(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(value);
}

export function PriceStackSection() {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { amount: 0.32 });
  const searchParams = useSearchParams();
  const utmPayload = useMemo(() => readUtmFromSearch(new URLSearchParams(searchParams.toString())), [searchParams]);

  const [activeCount, setActiveCount] = useState(0);
  const [showFormula, setShowFormula] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [unlockEmail, setUnlockEmail] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState("");

  const totalValue = priceBooks.reduce((sum, item) => sum + item.valuePerM2, 0);

  useEffect(() => {
    if (!inView || !unlocked || hasAnimated) {
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
          setHasAnimated(true);
        }, 240);
      }
    }, 250);

    devLog("price_stack_start", {
      items: priceBooks.length,
      unlocked: true,
    });

    return () => window.clearInterval(intervalId);
  }, [inView, unlocked, hasAnimated]);

  const handleUnlock = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (unlocking || unlocked) {
      return;
    }

    const email = unlockEmail.trim().toLowerCase();
    if (!isEmailValid(email)) {
      setUnlockError("Unesite ispravnu email adresu da otkljucate cenu.");
      return;
    }

    setUnlocking(true);
    setUnlockError("");

    try {
      const result = await submitMicroleadAction({
        name: "",
        email,
        location: "price_unlock",
        utmCampaign: utmPayload.campaign,
        utmContent: utmPayload.content,
        utmTerm: utmPayload.term,
      });

      if (result.status === "error") {
        setUnlockError(result.message);
        return;
      }

      setUnlocked(true);
      setActiveCount(0);
      setShowFormula(false);
      setHasAnimated(false);

      trackEvent("lead_submit", { location: "price_unlock", section: "chapter_02" });
      trackEvent("doc_unlock", { location: "price_unlock", section: "chapter_02" });
      devLog("price_unlock_success", {
        hasEmail: true,
      });
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <>
      {inView && unlocked ? (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="fixed right-4 bottom-24 z-[92] hidden lg:block"
        >
          <BookingButton location="price_scroll_floating" className="shadow-[0_16px_32px_rgba(24,8,14,0.45)]" />
        </motion.div>
      ) : null}

      <section
        ref={ref}
        className="relative overflow-hidden rounded-[2rem] border border-brand-gold/35 bg-[linear-gradient(145deg,#2a0a14_0%,#3b0d18_48%,#1e0810_100%)] px-5 py-8 shadow-[0_28px_90px_rgba(4,2,2,0.58)] sm:px-8 sm:py-10 lg:px-10"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(201,163,93,0.18),transparent_44%),radial-gradient(circle_at_84%_20%,rgba(0,0,0,0.3),transparent_55%)]" />

        <div className="relative z-10">
          <p className="text-brand-gold text-xs tracking-[0.28em] uppercase">POGLAVLJE 02</p>
          <h2 className="font-display mt-3 text-4xl leading-tight text-brand-paper sm:text-5xl">Kompletna vrednost projekta</h2>
          <p className="text-brand-paper-muted mt-3 text-sm leading-relaxed sm:text-base">
            Da biste videli tacne cene i finalnu ponudu, prvo otkljucajte prikaz email adresom.
          </p>

          {!unlocked ? (
            <motion.form
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleUnlock}
              className="mt-7 rounded-3xl border border-brand-gold/40 bg-brand-ink/55 p-5 sm:p-6"
            >
              <p className="text-brand-gold text-xs tracking-[0.2em] uppercase">Otkljucajte cenu</p>
              <p className="text-brand-paper mt-2 text-sm leading-relaxed sm:text-base">
                Unesite email i kliknite na dugme. Tek tada prikazujemo cene 40 - 35 - 30 - 25, primer projekta i
                bonus FREE knjizice.
              </p>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={unlockEmail}
                  onChange={(event) => setUnlockEmail(event.target.value)}
                  placeholder="vas@email.com"
                  className="input-base flex-1"
                />
                <button
                  type="submit"
                  disabled={unlocking}
                  className="btn-primary rounded-full px-5 py-3 text-sm font-semibold uppercase disabled:opacity-70"
                >
                  {unlocking ? "Otkljucavanje..." : "Prikazi cenu"}
                </button>
              </div>

              {unlockError ? <p className="text-brand-rose mt-2 text-sm">{unlockError}</p> : null}

              <div className="mt-4 space-y-2 rounded-2xl border border-brand-gold/30 bg-brand-bordo/40 px-4 py-3 text-sm">
                <p className="text-brand-paper">
                  Ponuda traje jos <span className="text-brand-gold font-semibold">{OFFER_DAYS_LEFT} dana</span>.
                </p>
                <p className="text-brand-paper-muted">
                  Ostalo je jos <span className="text-brand-gold font-semibold">{SLOTS_LEFT} mesta</span>. Posle toga cena ide na
                  35€/m2, a zatim na 40€/m2.
                </p>
                <p className="text-brand-paper-muted">
                  Na konsultacijama odmah dobijate <span className="text-brand-gold font-semibold">3 konkretna saveta</span>.
                </p>
              </div>
            </motion.form>
          ) : (
            <>
              <div className="mt-5 inline-flex rounded-md border border-brand-gold/38 bg-[linear-gradient(120deg,#a42b2e_0%,#df4d57_100%)] px-4 py-2 text-xs font-semibold tracking-[0.14em] uppercase text-white">
                Ponuda vazi jos 10 dana
              </div>

              <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {priceBooks.map((book, index) => (
                  <BookItem
                    key={book.title}
                    title={book.title}
                    valuePerM2={book.valuePerM2}
                    microcopy={book.microcopy}
                    freeRibbon={"freeRibbon" in book ? Boolean(book.freeRibbon) : false}
                    index={index}
                    active={index < activeCount}
                    logoLabel="ELEMENT"
                  />
                ))}
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
                <ApartmentExample chapterLabel="POGLAVLJE 02 / PRIMER PROJEKTA" />
              </div>

              <div className="mt-7">
                <p className="text-brand-gold text-xs tracking-[0.28em] uppercase">POGLAVLJE FREE 01 + DODATA VREDNOST</p>
                <div className="mt-3">
                  <BonusStack items={bonusBooks} />
                </div>
              </div>
            </>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <BookingButton location="price_stack_primary" className="w-full sm:w-auto" />
            <IntakeButton location="price_stack_secondary" className="w-full sm:w-auto" />
          </div>

          <FollowElementLinks location="price_stack_follow" className="mx-auto mt-5 max-w-xl" />
        </div>
      </section>
    </>
  );
}
