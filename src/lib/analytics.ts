"use client";

import { track } from "@vercel/analytics";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export type AnalyticsEventName =
  | "landing_view"
  | "booking_click"
  | "message_match_variant"
  | "risk_reversal_view"
  | "video_play"
  | "before_after_interaction"
  | "calculator_interaction"
  | "social_follow_click"
  | "countdown_view"
  | "countdown_expired"
  | "booking_page_view"
  | "spots_view"
  | "spots_last3"
  | "spots_soldout"
  | "scarcity_bar_view"
  | "emotional_section_view"
  | "cta_primary_click"
  | "cta_secondary_click"
  | "price_slide_view"
  | "price_slide_triggered"
  | "price_slide_completed"
  | "cta_after_slide_click"
  | "scroll_25"
  | "scroll_50"
  | "scroll_75"
  | "scroll_90"
  | "sticky_cta_click"
  | "microlead_submit"
  | "microlead_skip"
  | "hero_variant_a_view"
  | "hero_variant_b_view"
  | "intake_start"
  | "intake_submit"
  | "email_popup_submit"
  | "email_popup_skip"
  | "lead_submit"
  | "contact_submit"
  | "doc_unlock"
  | "doc_download"
  | "documentation_download";

const pixelEventMap: Partial<Record<AnalyticsEventName, "ViewContent" | "Lead" | "CompleteRegistration">> = {
  landing_view: "ViewContent",
  booking_click: "Lead",
  booking_page_view: "Lead",
  microlead_submit: "Lead",
  sticky_cta_click: "Lead",
  intake_start: "Lead",
  email_popup_submit: "Lead",
  intake_submit: "CompleteRegistration",
};

export function trackEvent(
  eventName: AnalyticsEventName,
  params: Record<string, string | number | boolean> = {},
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    track(eventName, params);

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...params });

    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, params);
    }

    if (typeof window.fbq === "function") {
      const mapped = pixelEventMap[eventName];
      if (mapped) {
        window.fbq("track", mapped, params);
      }
      window.fbq("trackCustom", eventName, params);
    }
  } catch {
    // Analytics must stay best-effort.
  }
}
