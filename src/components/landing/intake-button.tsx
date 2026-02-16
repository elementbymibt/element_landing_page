"use client";

import Link from "next/link";

import { trackEvent } from "@/src/lib/analytics";
import { devLog } from "@/src/lib/dev-log";
import { cn } from "@/src/lib/utils";

type IntakeButtonProps = {
  className?: string;
  location: string;
  label?: string;
  trackStickyClick?: boolean;
};

const defaultLabel = "Popuni upitnik";

export function IntakeButton({
  className,
  location,
  label = defaultLabel,
  trackStickyClick = false,
}: IntakeButtonProps) {
  return (
    <Link
      href="/intake/start"
      className={cn(
        "btn-secondary min-h-12 rounded-full px-6 py-3 text-center text-sm font-semibold tracking-wide uppercase",
        className,
      )}
      onClick={() => {
        trackEvent("intake_start", { location });

        if (trackStickyClick) {
          trackEvent("sticky_cta_click", { location, cta: "intake" });
        }

        devLog("intake_click", {
          location,
          sticky: trackStickyClick,
        });
      }}
    >
      {label}
    </Link>
  );
}
