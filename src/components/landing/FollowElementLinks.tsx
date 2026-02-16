"use client";

import { trackEvent } from "@/src/lib/analytics";
import { devLog } from "@/src/lib/dev-log";
import { publicConfig } from "@/src/lib/public-config";
import { cn } from "@/src/lib/utils";

type FollowElementLinksProps = {
  location: string;
  className?: string;
};

const links = [
  {
    key: "instagram",
    label: "Instagram",
    href: publicConfig.instagramUrl,
  },
  {
    key: "website",
    label: "Sajt",
    href: publicConfig.mainSiteUrl,
  },
] as const;

export function FollowElementLinks({ location, className }: FollowElementLinksProps) {
  return (
    <div className={cn("rounded-2xl border border-brand-gold/28 bg-brand-ink/52 p-4", className)}>
      <p className="text-brand-paper-muted text-xs tracking-[0.22em] uppercase">Pratite Element</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {links.map((item) => (
          <a
            key={item.key}
            href={item.href}
            target="_blank"
            rel="noreferrer noopener"
            className="btn-secondary rounded-full px-4 py-2 text-xs font-semibold tracking-[0.15em] uppercase"
            onClick={() => {
              trackEvent("social_follow_click", {
                location,
                target: item.key,
              });

              devLog("social_follow_click", {
                location,
                target: item.key,
              });
            }}
          >
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
}
