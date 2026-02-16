export const publicConfig = {
  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL?.trim() || "https://calendly.com",
  videoEmbedUrl: process.env.NEXT_PUBLIC_VIDEO_EMBED_URL?.trim() || "https://www.youtube.com/embed/0NnM7XvQ2e4",
  instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() || "https://www.instagram.com/elementbymibt/",
  mainSiteUrl: process.env.NEXT_PUBLIC_MAIN_SITE_URL?.trim() || "https://elementbymibt.com",
  offerEndIso: process.env.NEXT_PUBLIC_OFFER_END_ISO?.trim() || "2026-03-01T23:59:00+01:00",
  spotsTotal: Number(process.env.NEXT_PUBLIC_SPOTS_TOTAL || 10),
  animMode: (process.env.NEXT_PUBLIC_ANIM_MODE?.trim() || "loop") as "domino" | "ribbonDrop" | "loop" | "all" | "off",
  abVariant: (process.env.NEXT_PUBLIC_PRICE_AB_VARIANT?.trim() || "B1") as "B1" | "B2" | "B3",
};
