"use client";

import { useEffect } from "react";

import { trackEvent } from "@/src/lib/analytics";

const milestones = [
  { threshold: 25, event: "scroll_25" as const },
  { threshold: 50, event: "scroll_50" as const },
  { threshold: 75, event: "scroll_75" as const },
  { threshold: 90, event: "scroll_90" as const },
];

export function ScrollTracker() {
  useEffect(() => {
    const triggered = new Set<string>();

    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      if (max <= 0) {
        return;
      }

      const percent = (window.scrollY / max) * 100;

      for (const milestone of milestones) {
        if (percent >= milestone.threshold && !triggered.has(milestone.event)) {
          triggered.add(milestone.event);
          trackEvent(milestone.event, { percent: milestone.threshold });
        }
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}
