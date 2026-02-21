"use client";

import Link from "next/link";

import { trackEvent } from "@/src/lib/analytics";
import { cn } from "@/src/lib/utils";

type CtaButtonProps = {
  className?: string;
  location: string;
  children: string;
};

export function CtaButton({ className, location, children }: CtaButtonProps) {
  return (
    <Link
      href="/booking"
      className={cn(
        "inline-flex min-h-12 items-center justify-center rounded-md border border-[#B89047] bg-[#C9A35D] px-6 py-3 text-center text-sm font-semibold tracking-wide text-[#2A211E] transition-colors hover:bg-[#B89047] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B89047] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F1EA]",
        className,
      )}
      onClick={() => {
        trackEvent("booking_click", { location });
        trackEvent("cta_primary_click", { location });
      }}
    >
      {children}
    </Link>
  );
}

