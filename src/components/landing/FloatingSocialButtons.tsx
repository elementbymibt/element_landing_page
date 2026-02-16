"use client";

import { trackEvent } from "@/src/lib/analytics";
import { devLog } from "@/src/lib/dev-log";
import { publicConfig } from "@/src/lib/public-config";

const links = [
  { key: "instagram", label: "Instagram", href: publicConfig.instagramUrl },
  { key: "website", label: "Sajt", href: publicConfig.mainSiteUrl },
] as const;

export function FloatingSocialButtons() {
  return (
    <div className="fixed right-3 bottom-28 z-[90] hidden flex-col gap-2 md:flex">
      {links.map((item) => (
        <a
          key={item.key}
          href={item.href}
          target="_blank"
          rel="noreferrer noopener"
          className="btn-secondary rounded-full px-4 py-2 text-[11px] font-semibold tracking-[0.15em] uppercase shadow-[0_10px_22px_rgba(0,0,0,0.35)]"
          onClick={() => {
            trackEvent("social_follow_click", { location: "floating_social", target: item.key });
            devLog("social_follow_click", { location: "floating_social", target: item.key });
          }}
        >
          {item.label}
        </a>
      ))}
    </div>
  );
}
