"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useActionState, useEffect, useState } from "react";

import { submitEmailGuideAction, type EmailGuideActionState } from "@/src/actions/email-guide";
import { trackEvent } from "@/src/lib/analytics";

const POPUP_COOKIE = "element_email_popup_seen";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

const initialState: EmailGuideActionState = {
  status: "idle",
  message: "",
};

function hasPopupCookie() {
  if (typeof document === "undefined") {
    return false;
  }

  return document.cookie.split(";").some((part) => part.trim().startsWith(`${POPUP_COOKIE}=`));
}

function setPopupCookie() {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${POPUP_COOKIE}=1; max-age=${THIRTY_DAYS}; path=/; samesite=lax`;
}

export function SoftEmailPopup() {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(submitEmailGuideAction, initialState);

  useEffect(() => {
    if (hasPopupCookie()) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setOpen(true);
    }, 900);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (state.status !== "success") {
      return;
    }

    trackEvent("email_popup_submit", { source: "soft_popup" });
    setPopupCookie();
    const timeoutId = window.setTimeout(() => {
      setOpen(false);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [state.status]);

  const handleSkip = () => {
    trackEvent("email_popup_skip", { source: "soft_popup" });
    setPopupCookie();
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.24 }}
            className="border-brand-gold/35 bg-brand-ink max-w-lg rounded-3xl border p-6 sm:p-8"
          >
            <p className="text-brand-gold text-xs tracking-[0.28em] uppercase">Pre nego što krenemo…</p>
            <h3 className="font-display mt-3 text-3xl text-brand-paper">Mini vodič za bolji prostor</h3>
            <p className="text-brand-paper-muted mt-3 text-sm leading-relaxed sm:text-base">
              Ostavite email i dobijate mini vodič: 7 grešaka u uređenju prostora.
            </p>

            <form action={formAction} className="mt-6 space-y-3">
              <label htmlFor="lead-email" className="sr-only">
                Email adresa
              </label>
              <input
                id="lead-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="input-base"
                placeholder="vas@email.com"
              />

              {state.status === "error" ? <p className="text-brand-rose text-sm">{state.message}</p> : null}

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-primary flex-1 rounded-full px-5 py-3 text-sm font-semibold uppercase disabled:opacity-70"
                >
                  {isPending ? "Slanje..." : "Pošalji"}
                </button>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="btn-secondary flex-1 rounded-full px-5 py-3 text-sm font-semibold uppercase"
                >
                  Nastavi bez unosa
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
