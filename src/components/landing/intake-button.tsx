"use client";

import Link from "next/link";

import { trackEvent } from "@/src/lib/analytics";
import { cn } from "@/src/lib/utils";

type IntakeButtonProps = {
  className?: string;
  location: string;
  label?: string;
};

export function IntakeButton({ className, location, label = "POPUNI UPITNIK I DOBIJ PONUDU" }: IntakeButtonProps) {
  return (
    <Link
      href="/intake/start"
      className={cn(
        "btn-secondary min-h-12 rounded-full px-6 py-3 text-center text-sm font-semibold tracking-wide uppercase",
        className,
      )}
      onClick={() => {
        trackEvent("intake_start", { location });
      }}
    >
      {label}
    </Link>
  );
}
