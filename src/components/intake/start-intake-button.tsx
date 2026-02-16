"use client";

import { useRouter } from "next/navigation";

import { useLocale } from "@/src/components/i18n/locale-provider";
import { trackEvent } from "@/src/lib/analytics";
import { cn } from "@/src/lib/utils";

type StartIntakeButtonProps = {
  className?: string;
  label?: string;
};

export function StartIntakeButton({ className, label }: StartIntakeButtonProps) {
  const router = useRouter();
  const { locale } = useLocale();

  return (
    <button
      type="button"
      className={cn(
        "btn-primary inline-flex min-h-12 items-center justify-center rounded-full px-8 text-sm font-semibold",
        className,
      )}
      onClick={() => {
        try {
          const key = "element_intake_start_tracked";
          if (typeof window !== "undefined") {
            if (!sessionStorage.getItem(key)) {
              sessionStorage.setItem(key, "1");
              trackEvent("intake_start", { location: "intake_start_page" });
            }
          }
        } catch {
          // Best-effort only.
        }

        router.push("/intake/new");
      }}
    >
      {label ?? (locale === "en" ? "Start intake" : "Započnite upitnik")}
    </button>
  );
}

