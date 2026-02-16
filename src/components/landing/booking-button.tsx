"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";

import { submitMicroleadAction } from "@/src/actions/microlead";
import { trackEvent } from "@/src/lib/analytics";
import { devLog } from "@/src/lib/dev-log";
import { publicConfig } from "@/src/lib/public-config";
import { readUtmFromSearch } from "@/src/lib/utm";
import { cn } from "@/src/lib/utils";

type BookingButtonProps = {
  className?: string;
  location: string;
  label?: string;
  trackStickyClick?: boolean;
};

const defaultLabel = "Zakazi besplatne konsultacije";

export function BookingButton({
  className,
  location,
  label = defaultLabel,
  trackStickyClick = false,
}: BookingButtonProps) {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const utmPayload = useMemo(() => {
    const raw = new URLSearchParams(searchParams.toString());
    return readUtmFromSearch(raw);
  }, [searchParams]);

  const continueToBooking = () => {
    setRedirecting(true);
    setShowOverlay(true);

    window.setTimeout(() => {
      window.location.assign(publicConfig.bookingUrl);
    }, 500);
  };

  const openModal = () => {
    if (redirecting) {
      return;
    }

    setOpen(true);
    setError("");

    trackEvent("booking_click", { location });

    if (trackStickyClick) {
      trackEvent("sticky_cta_click", { location, cta: "booking" });
    }

    devLog("booking_click", {
      location,
      sticky: trackStickyClick,
    });
  };

  const handleSkip = () => {
    if (saving || redirecting) {
      return;
    }

    trackEvent("microlead_skip", { location });
    devLog("microlead_skip", { location });

    setOpen(false);
    continueToBooking();
  };

  const handleContinue = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (saving || redirecting) {
      return;
    }

    setSaving(true);
    setError("");

    const hasInput = Boolean(name.trim() || email.trim());

    try {
      if (hasInput) {
        const result = await submitMicroleadAction({
          name,
          email,
          location,
          utmCampaign: utmPayload.campaign,
          utmContent: utmPayload.content,
          utmTerm: utmPayload.term,
        });

        if (result.status === "error") {
          setError(result.message);
          return;
        }

        trackEvent("microlead_submit", { location, has_email: Boolean(email.trim()) });
        devLog("microlead_submit", {
          location,
          hasEmail: Boolean(email.trim()),
        });
      } else {
        trackEvent("microlead_skip", { location, mode: "empty_form" });
      }

      setOpen(false);
      continueToBooking();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className={cn(
          "btn-primary min-h-12 rounded-full px-6 py-3 text-sm font-semibold tracking-wide uppercase",
          className,
        )}
        onClick={openModal}
      >
        {redirecting ? "Preusmeravanje..." : label}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="w-full max-w-md rounded-3xl border border-brand-book-edge bg-brand-ink p-6"
            >
              <h3 className="font-display text-3xl text-brand-paper">Pre termina</h3>
              <p className="text-brand-paper-muted mt-2 text-sm leading-relaxed">
                Ako ostavite ime i email, saljemo kratku potvrdu pre zakazivanja. Mozete i preskociti.
              </p>

              <form onSubmit={handleContinue} className="mt-5 space-y-3">
                <div>
                  <label htmlFor={`microlead-name-${location}`} className="text-brand-paper-muted mb-1 block text-xs uppercase">
                    Ime
                  </label>
                  <input
                    id={`microlead-name-${location}`}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="input-base"
                    placeholder="Vase ime"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label htmlFor={`microlead-email-${location}`} className="text-brand-paper-muted mb-1 block text-xs uppercase">
                    Email
                  </label>
                  <input
                    id={`microlead-email-${location}`}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="input-base"
                    type="email"
                    placeholder="vas@email.com"
                    maxLength={120}
                  />
                </div>

                {error ? <p className="text-brand-rose text-sm">{error}</p> : null}

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary flex-1 rounded-full px-4 py-3 text-sm font-semibold uppercase disabled:opacity-70"
                  >
                    {saving ? "Slanje..." : "Nastavi na termin"}
                  </button>
                  <button
                    type="button"
                    onClick={handleSkip}
                    disabled={saving}
                    className="btn-secondary flex-1 rounded-full px-4 py-3 text-sm font-semibold uppercase"
                  >
                    Preskoci
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

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
            Odlicna odluka.
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
