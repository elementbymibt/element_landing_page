export const publicConfig = {
  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL?.trim() || "https://calendly.com",
  videoEmbedUrl: process.env.NEXT_PUBLIC_VIDEO_EMBED_URL?.trim() || "https://www.youtube.com/embed/0NnM7XvQ2e4",
  instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() || "https://www.instagram.com/elementbymibt/",
  mainSiteUrl: process.env.NEXT_PUBLIC_MAIN_SITE_URL?.trim() || "https://elementbymibt.com",
};
