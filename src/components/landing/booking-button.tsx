"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { trackEvent } from "@/src/lib/analytics";
import { devLog } from "@/src/lib/dev-log";
import { readUtmFromSearch } from "@/src/lib/utm";
import { cn } from "@/src/lib/utils";

type BookingButtonProps = {
  className?: string;
  location: string;
  label?: string;
  trackStickyClick?: boolean;
  onPress?: () => void;
  onHover?: () => void;
};

const defaultLabel = "Zakazi besplatne konsultacije";

export function BookingButton({
  className,
  location,
  label = defaultLabel,
  trackStickyClick = false,
  onPress,
  onHover,
}: BookingButtonProps) {
  const searchParams = useSearchParams();
  const [redirecting, setRedirecting] = useState(false);

  const utmPayload = useMemo(() => {
    const raw = new URLSearchParams(searchParams.toString());
    return readUtmFromSearch(raw);
  }, [searchParams]);

  const bookingEntryUrl = useMemo(() => {
    const params = new URLSearchParams();

    if (utmPayload.campaign) {
      params.set("utm_campaign", utmPayload.campaign);
    }
    if (utmPayload.content) {
      params.set("utm_content", utmPayload.content);
    }
    if (utmPayload.term) {
      params.set("utm_term", utmPayload.term);
    }

    params.set("source", location);

    const query = params.toString();
    return query ? `/booking?${query}` : "/booking";
  }, [location, utmPayload.campaign, utmPayload.content, utmPayload.term]);

  const handleClick = () => {
    if (redirecting) {
      return;
    }

    onPress?.();

    trackEvent("cta_primary_click", { location });
    trackEvent("booking_click", { location });

    if (trackStickyClick) {
      trackEvent("sticky_cta_click", { location, cta: "booking" });
    }

    devLog("booking_click", {
      location,
      sticky: trackStickyClick,
      destination: bookingEntryUrl,
    });

    setRedirecting(true);
    window.location.assign(bookingEntryUrl);
  };

  return (
    <button
      type="button"
      className={cn(
        "btn-primary min-h-12 rounded-full px-6 py-3 text-sm font-semibold tracking-wide uppercase",
        className,
      )}
      onClick={handleClick}
      onMouseEnter={onHover}
      onFocus={onHover}
      disabled={redirecting}
    >
      {redirecting ? "Preusmeravanje..." : label}
    </button>
  );
}
