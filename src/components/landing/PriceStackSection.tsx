"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { submitMicroleadAction } from "@/src/actions/microlead";
import { ApartmentExample } from "@/src/components/landing/ApartmentExample";
import { BonusStack } from "@/src/components/landing/BonusStack";
import { BookItem } from "@/src/components/landing/BookItem";
import { BookingButton } from "@/src/components/landing/booking-button";
import { CountUpValue } from "@/src/components/landing/CountUpValue";
import { FollowElementLinks } from "@/src/components/landing/FollowElementLinks";
import { IntakeButton } from "@/src/components/landing/intake-button";
import { PriceReveal, type PriceSlideState } from "@/src/components/landing/PriceReveal";
import { trackEvent } from "@/src/lib/analytics";
import { devLog } from "@/src/lib/dev-log";
import { publicConfig } from "@/src/lib/public-config";
import { readUtmFromSearch } from "@/src/lib/utm";

const SPOTS_STORAGE_KEY = "element_landing_spots_state_v2";
const SPOTS_UPDATE_INTERVAL_MS = 1000 * 60 * 45;
const SLIDE_COMPLETE_MS = 860;

const INITIAL_REGULAR_PRICE = 40;
const FIRST_DROP_PRICE = 35;
const SPECIAL_PRICE = 30;
const ULTRA_PRICE = 25;

type AnimMode = "domino" | "ribbonDrop" | "loop" | "all" | "off";

type StoredSpotsState = {
  spotsLeft: number;
  updatedAt: number;
};

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

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function readOrInitSpots(total: number) {
  const now = Date.now();

  try {
    const raw = window.localStorage.getItem(SPOTS_STORAGE_KEY);

    if (!raw) {
      const initial: StoredSpotsState = {
        spotsLeft: total,
        updatedAt: now,
      };
      window.localStorage.setItem(SPOTS_STORAGE_KEY, JSON.stringify(initial));
      return initial.spotsLeft;
    }

    const parsed = JSON.parse(raw) as Partial<StoredSpotsState>;
    const savedSpots = clamp(typeof parsed.spotsLeft === "number" ? parsed.spotsLeft : total, 0, total);
    const savedUpdatedAt = typeof parsed.updatedAt === "number" ? parsed.updatedAt : now;

    const elapsed = now - savedUpdatedAt;
    const decreaseSteps = Math.floor(elapsed / SPOTS_UPDATE_INTERVAL_MS);

    if (decreaseSteps <= 0) {
      return savedSpots;
    }

    const nextSpots = clamp(savedSpots - decreaseSteps, 0, total);
    const nextState: StoredSpotsState = {
      spotsLeft: nextSpots,
      updatedAt: now,
    };

    window.localStorage.setItem(SPOTS_STORAGE_KEY, JSON.stringify(nextState));
    return nextSpots;
  } catch {
    return total;
  }
}

function formatCountdownParts(remainingMs: number) {
  const safe = Math.max(0, remainingMs);
  const totalSeconds = Math.floor(safe / 1000);

  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const two = (value: number) => String(value).padStart(2, "0");

  return {
    days: two(days),
    hours: two(hours),
    minutes: two(minutes),
    seconds: two(seconds),
  };
}

function modeHas(mode: AnimMode, expected: Exclude<AnimMode, "off">) {
  return mode === "all" || mode === expected;
}

export function PriceStackSection() {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { amount: 0.25 });
  const reducedMotion = useReducedMotion();
  const searchParams = useSearchParams();

  const totalSpots = useMemo(() => clamp(publicConfig.spotsTotal || 10, 1, 50), []);
  const offerEndTimestamp = useMemo(() => {
    const parsed = Date.parse(publicConfig.offerEndIso);
    return Number.isNaN(parsed) ? Date.now() + 10 * 24 * 60 * 60 * 1000 : parsed;
  }, []);
  const abVariant = publicConfig.abVariant;

  const effectiveAnimMode: AnimMode = reducedMotion ? "off" : publicConfig.animMode;

  const utmPayload = useMemo(() => readUtmFromSearch(new URLSearchParams(searchParams.toString())), [searchParams]);

  const [activeCount, setActiveCount] = useState(0);
  const [showFormula, setShowFormula] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [unlockEmail, setUnlockEmail] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState("");

  const [remainingMs, setRemainingMs] = useState(() => Math.max(0, offerEndTimestamp - Date.now()));
  const [spotsLeft, setSpotsLeft] = useState(totalSpots);
  const [slideState, setSlideState] = useState<PriceSlideState>("idle");
  const [dominoTriggered, setDominoTriggered] = useState(false);

  const slideTimeoutRef = useRef<number | null>(null);
  const countdownViewedRef = useRef(false);
  const countdownExpiredRef = useRef(false);
  const spotsViewedRef = useRef(false);
  const spotsLast3Ref = useRef(false);
  const spotsSoldoutRef = useRef(false);
  const scarcityViewedRef = useRef(false);
  const priceSlideViewedRef = useRef(false);

  const totalValue = priceBooks.reduce((sum, item) => sum + item.valuePerM2, 0);

  const expiredByTime = remainingMs <= 0;
  const soldOut = spotsLeft <= 0;
  const ultraAvailable = !expiredByTime && !soldOut;
  const isLast24Hours = remainingMs > 0 && remainingMs <= 24 * 60 * 60 * 1000;

  const filledSpots = totalSpots - spotsLeft;
  const fillPercent = clamp(Math.round((filledSpots / totalSpots) * 100), 0, 100);
  const countdown = formatCountdownParts(remainingMs);

  const scarcityCopy =
    fillPercent > 90
      ? "Preostalo je jos vrlo malo mesta."
      : fillPercent > 70
        ? "Interesovanje je izuzetno visoko."
        : "Mesta se popunjavaju u realnom vremenu.";

  const triggerPriceSlide = useCallback(
    (source: "scroll" | "hover" | "timer" | "click" | "replay") => {
      if (!ultraAvailable || slideState !== "idle") {
        return;
      }

      setSlideState("running");

      if (modeHas(effectiveAnimMode, "domino")) {
        setDominoTriggered(true);
      }

      trackEvent("price_slide_triggered", {
        variant: abVariant,
        source,
      });
      devLog("price_slide_triggered", {
        variant: abVariant,
        source,
      });

      if (slideTimeoutRef.current) {
        window.clearTimeout(slideTimeoutRef.current);
      }

      slideTimeoutRef.current = window.setTimeout(() => {
        setSlideState("done");

        trackEvent("price_slide_completed", {
          variant: abVariant,
          source,
        });
        devLog("price_slide_completed", {
          variant: abVariant,
          source,
        });
      }, SLIDE_COMPLETE_MS);
    },
    [abVariant, effectiveAnimMode, slideState, ultraAvailable],
  );

  useEffect(() => {
    setSpotsLeft(readOrInitSpots(totalSpots));

    const intervalId = window.setInterval(() => {
      setSpotsLeft(readOrInitSpots(totalSpots));
    }, 1000 * 60);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [totalSpots]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setRemainingMs(Math.max(0, offerEndTimestamp - Date.now()));
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [offerEndTimestamp]);

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
        }, 180);
      }
    }, 140);

    devLog("price_stack_start", {
      items: priceBooks.length,
      unlocked: true,
    });

    return () => window.clearInterval(intervalId);
  }, [inView, unlocked, hasAnimated]);

  useEffect(() => {
    if (!unlocked || !inView || countdownViewedRef.current) {
      return;
    }

    countdownViewedRef.current = true;
    trackEvent("countdown_view", { section: "price_stack" });
    devLog("countdown_view", { section: "price_stack" });
  }, [inView, unlocked]);

  useEffect(() => {
    if (!unlocked || !inView || spotsViewedRef.current) {
      return;
    }

    spotsViewedRef.current = true;
    trackEvent("spots_view", { spots_left: spotsLeft, spots_total: totalSpots });
    devLog("spots_view", { spotsLeft, spotsTotal: totalSpots });
  }, [inView, spotsLeft, totalSpots, unlocked]);

  useEffect(() => {
    if (!unlocked || !inView || scarcityViewedRef.current) {
      return;
    }

    scarcityViewedRef.current = true;
    trackEvent("scarcity_bar_view", { fill_percent: fillPercent });
    devLog("scarcity_bar_view", { fillPercent });
  }, [fillPercent, inView, unlocked]);

  useEffect(() => {
    if (!unlocked || !inView || priceSlideViewedRef.current) {
      return;
    }

    priceSlideViewedRef.current = true;
    trackEvent("price_slide_view", { variant: abVariant });
    devLog("price_slide_view", { variant: abVariant });
  }, [abVariant, inView, unlocked]);

  useEffect(() => {
    if (!unlocked || !expiredByTime || countdownExpiredRef.current) {
      return;
    }

    countdownExpiredRef.current = true;
    trackEvent("countdown_expired", { reason: "timer" });
    devLog("countdown_expired", { reason: "timer" });
  }, [expiredByTime, unlocked]);

  useEffect(() => {
    if (!unlocked || spotsLeft > 3 || spotsLeft <= 0 || spotsLast3Ref.current) {
      return;
    }

    spotsLast3Ref.current = true;
    trackEvent("spots_last3", { spots_left: spotsLeft });
    devLog("spots_last3", { spotsLeft });
  }, [spotsLeft, unlocked]);

  useEffect(() => {
    if (!unlocked || !soldOut || spotsSoldoutRef.current) {
      return;
    }

    spotsSoldoutRef.current = true;
    trackEvent("spots_soldout", { spots_left: 0 });
    devLog("spots_soldout", { spotsLeft: 0 });
  }, [soldOut, unlocked]);

  useEffect(() => {
    if (!unlocked || !inView || slideState !== "idle") {
      return;
    }

    if (abVariant !== "B1") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      triggerPriceSlide("scroll");
    }, 700);

    return () => window.clearTimeout(timeoutId);
  }, [abVariant, inView, slideState, triggerPriceSlide, unlocked]);

  useEffect(() => {
    if (!unlocked || slideState !== "idle" || abVariant !== "B3") {
      return;
    }

    if (remainingMs > 48 * 60 * 60 * 1000) {
      return;
    }

    triggerPriceSlide("timer");
  }, [abVariant, remainingMs, slideState, triggerPriceSlide, unlocked]);

  useEffect(() => {
    return () => {
      if (slideTimeoutRef.current) {
        window.clearTimeout(slideTimeoutRef.current);
      }
    };
  }, []);

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

      trackEvent("lead_submit", { location: "price_unlock", section: "chapter_02_03" });
      trackEvent("doc_unlock", { location: "price_unlock", section: "chapter_02_03" });
      devLog("price_unlock_success", {
        hasEmail: true,
      });

      if (abVariant === "B2") {
        triggerPriceSlide("click");
      }
    } finally {
      setUnlocking(false);
    }
  };

  const handleReplay = () => {
    if (!ultraAvailable) {
      return;
    }

    setSlideState("idle");
    setDominoTriggered(false);

    window.setTimeout(() => {
      triggerPriceSlide("replay");
    }, 120);
  };

  const handleCtaHover = () => {
    if (abVariant === "B2") {
      triggerPriceSlide("hover");
    }
  };

  const handlePrimaryPress = () => {
    if (slideState === "done") {
      trackEvent("cta_after_slide_click", { location: "price_stack_primary", cta: "primary" });
    }

    if (abVariant === "B2") {
      triggerPriceSlide("click");
    }
  };

  const handleSecondaryPress = () => {
    if (slideState === "done") {
      trackEvent("cta_after_slide_click", { location: "price_stack_secondary", cta: "secondary" });
    }

    if (abVariant === "B2") {
      triggerPriceSlide("click");
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
          <BookingButton
            location="price_scroll_floating"
            className="shadow-[0_16px_32px_rgba(24,8,14,0.45)]"
            onPress={handlePrimaryPress}
            onHover={handleCtaHover}
          />
        </motion.div>
      ) : null}

      <section
        ref={ref}
        className="relative overflow-hidden rounded-[2rem] border border-brand-gold/35 bg-[linear-gradient(145deg,#2a0a14_0%,#3b0d18_48%,#1e0810_100%)] px-5 py-8 shadow-[0_28px_90px_rgba(4,2,2,0.58)] sm:px-8 sm:py-10 lg:px-10"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(201,163,93,0.18),transparent_44%),radial-gradient(circle_at_84%_20%,rgba(0,0,0,0.3),transparent_55%)]" />

        <div className="relative z-10">
          <p className="text-brand-gold text-xs tracking-[0.28em] uppercase">POGLAVLJE 02 + 03</p>
          <h2 className="font-display mt-3 text-4xl leading-tight text-brand-paper sm:text-5xl">Kompletna vrednost projekta</h2>
          <p className="text-brand-paper-muted mt-3 text-sm leading-relaxed sm:text-base">
            Ovo je sve sto dobijate pre cene. Prikaz cene se otkljucava tek nakon unosa email adrese.
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
                  Specijalna cena vazi jos: <span className="text-brand-gold font-semibold">{countdown.days}</span> :{" "}
                  <span className="text-brand-gold font-semibold">{countdown.hours}</span> :{" "}
                  <span className="text-brand-gold font-semibold">{countdown.minutes}</span> :{" "}
                  <span className="text-brand-gold font-semibold">{countdown.seconds}</span>
                </p>
                <p className="text-brand-paper-muted">
                  Preostalo jos: <span className="text-brand-gold font-semibold">{spotsLeft}</span> / {totalSpots} mesta.
                </p>
                <p className="text-brand-paper-muted text-xs">
                  Prikaz mesta je simulacija za landing i osvezava se lokalno.
                </p>
              </div>
            </motion.form>
          ) : (
            <>
              <div
                className="mt-5 rounded-xl border border-brand-gold/42 bg-brand-ink/56 px-4 py-3"
                style={{
                  boxShadow: isLast24Hours ? "0 0 26px rgba(201, 163, 93, 0.24)" : "0 0 0 rgba(0,0,0,0)",
                }}
              >
                <p className="text-brand-gold text-center text-xs tracking-[0.2em] uppercase">Specijalna cena vazi jos:</p>
                <p className="font-display mt-2 text-center text-3xl text-brand-paper sm:text-4xl">
                  {countdown.days} : {countdown.hours} : {countdown.minutes} : {countdown.seconds}
                </p>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.14em]">
                    <span className="text-brand-paper-muted">Popunjeno {filledSpots} od {totalSpots} mesta</span>
                    <span className="text-brand-gold">{fillPercent}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-brand-ink/70">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${fillPercent}%` }}
                      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full bg-[linear-gradient(90deg,#c9a35d_0%,#d7b67e_100%)]"
                    />
                  </div>
                  <p className="text-brand-paper-muted text-xs">{scarcityCopy}</p>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                  <p className="text-brand-paper-muted">Preostalo jos:</p>
                  {spotsLeft <= 3 && spotsLeft > 0 ? (
                    <motion.p
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1.1, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
                      className="text-brand-gold font-semibold"
                    >
                      Preostala su jos samo {spotsLeft} mesta.
                    </motion.p>
                  ) : (
                    <p className="text-brand-gold font-semibold">
                      {spotsLeft} / {totalSpots} mesta
                    </p>
                  )}
                </div>

                {!ultraAvailable ? (
                  <p className="text-brand-gold mt-2 text-xs tracking-[0.12em] uppercase">
                    Ultra ponuda je istekla. Aktivna je cena {SPECIAL_PRICE}€/m2.
                  </p>
                ) : null}
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
                    animMode={effectiveAnimMode}
                    dominoTriggered={dominoTriggered}
                    ribbonDropped={!ultraAvailable}
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
                            animate={{ opacity: 1, y: 0, scale: [0.86, 1.08, 1] }}
                            transition={{ duration: 0.46, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
                            className="inline-block"
                          >
                            <CountUpValue value={book.valuePerM2} fromValue={0} durationMs={620 + index * 70} />
                          </motion.span>
                          {index < priceBooks.length - 1 ? " + " : " = "}
                        </span>
                      ))}
                      <span className="font-semibold text-brand-gold">
                        <CountUpValue value={totalValue} fromValue={0} durationMs={980} suffix="€/m2" />
                      </span>
                    </p>
                    <p className="text-brand-gold mt-2 text-xs tracking-[0.2em] uppercase">
                      UKUPNA REALNA VREDNOST: {totalValue}€/m2
                    </p>
                  </motion.div>
                ) : null}
              </div>

              <div className="mt-6">
                <PriceReveal
                  regularValue={INITIAL_REGULAR_PRICE}
                  firstDropValue={FIRST_DROP_PRICE}
                  specialValue={SPECIAL_PRICE}
                  finalValue={ULTRA_PRICE}
                  canShowFinalPrice={ultraAvailable}
                  slideState={slideState}
                />

                {slideState !== "idle" && ultraAvailable ? (
                  <p className="text-brand-gold mt-3 text-center text-xs tracking-[0.14em] uppercase">
                    Aktivirali ste ultra ponudu za prvih 10.
                  </p>
                ) : null}

                {!ultraAvailable ? (
                  <p className="text-brand-paper-muted mt-3 text-center text-xs tracking-[0.14em] uppercase">
                    Ponuda je istekla. Dostupna je regularna verzija.
                  </p>
                ) : null}

                {slideState === "done" && ultraAvailable ? (
                  <div className="mt-3 flex justify-center">
                    <button
                      type="button"
                      onClick={handleReplay}
                      className="text-brand-gold text-xs tracking-[0.16em] uppercase underline decoration-brand-gold/70 underline-offset-4"
                    >
                      Replay animacije
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="mt-6">
                <ApartmentExample chapterLabel="POGLAVLJE 02 + 03 / PRIMER PROJEKTA" />
              </div>

              <div className="mt-7">
                <p className="text-brand-gold text-xs tracking-[0.28em] uppercase">POGLAVLJE FREE 01 + DODATA VREDNOST</p>
                <div className="mt-3">
                  <BonusStack
                    items={bonusBooks}
                    offerExpired={!ultraAvailable}
                    animMode={effectiveAnimMode}
                    dominoTriggered={dominoTriggered}
                  />
                </div>
              </div>
            </>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <BookingButton
              location="price_stack_primary"
              className="w-full sm:w-auto"
              onPress={handlePrimaryPress}
              onHover={handleCtaHover}
              label={ultraAvailable ? "Zakazi besplatne konsultacije" : "Zakazi konsultacije (regularna cena)"}
            />
            <IntakeButton
              location="price_stack_secondary"
              className="w-full sm:w-auto"
              onPress={handleSecondaryPress}
              onHover={handleCtaHover}
              label="Popuni upitnik i dobij ponudu"
            />
          </div>

          <p className="text-brand-gold mt-3 text-center text-xs italic">
            Prvih 10 klijenata dobija specijalnu cenu 25€/m2. Nakon toga cena se vraca na 30€, a zatim 35€.
          </p>

          <FollowElementLinks location="price_stack_follow" className="mx-auto mt-5 max-w-xl" />
        </div>
      </section>
    </>
  );
}
