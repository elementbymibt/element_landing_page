"use client";

import { useEffect } from "react";

import { trackEvent } from "@/src/lib/analytics";

export function LandingViewTracker() {
  useEffect(() => {
    trackEvent("landing_view", { page: "minimal_booking_landing" });
  }, []);

  return null;
}

