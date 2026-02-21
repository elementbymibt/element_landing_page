"use client";

import { CalendlyLink } from "@/src/components/landing/calendly-link";
import { cn } from "@/src/lib/utils";

type CtaButtonProps = {
  className?: string;
  location: "hero" | "bottom";
  children: string;
};

export function CtaButton({ className, location, children }: CtaButtonProps) {
  return (
    <CalendlyLink
      location={location}
      className={cn(
        "inline-flex min-h-16 min-w-[17rem] items-center justify-center rounded-md border border-[#2A0711] bg-[#3B0D18] px-10 py-4 text-center text-[1.03rem] font-semibold tracking-wide text-[#F5F1EA] shadow-[0_10px_22px_rgba(59,13,24,0.34),0_0_0_1px_rgba(201,163,93,0.28)] transition-all hover:-translate-y-[1px] hover:bg-[#2E0A13] hover:shadow-[0_12px_24px_rgba(59,13,24,0.38),0_0_0_1px_rgba(201,163,93,0.42)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A35D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F1EA]",
        className,
      )}
    >
      {children}
    </CalendlyLink>
  );
}
