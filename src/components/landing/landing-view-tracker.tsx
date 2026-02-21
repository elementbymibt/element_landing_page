"use client";

import { useEffect } from "react";

import { trackEvent, trackPageView } from "@/src/lib/analytics";

export function LandingViewTracker() {
  useEffect(() => {
    trackPageView("landing_element");
    trackEvent("landing_view", { page: "landing_element" });
  }, []);

  return null;
}
