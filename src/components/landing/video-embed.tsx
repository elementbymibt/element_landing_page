"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";

import { trackEvent } from "@/src/lib/analytics";
import { publicConfig } from "@/src/lib/public-config";

function withAutoplay(url: string) {
  try {
    const next = new URL(url);
    next.searchParams.set("autoplay", "1");
    next.searchParams.set("rel", "0");
    next.searchParams.set("modestbranding", "1");
    return next.toString();
  } catch {
    return url;
  }
}

export function VideoEmbed({ location }: { location: string }) {
  const [playing, setPlaying] = useState(false);
  const src = useMemo(() => withAutoplay(publicConfig.videoEmbedUrl), []);

  return (
    <div className="relative overflow-hidden rounded-[1.6rem] border border-brand-book-edge bg-brand-ink/70">
      <div className="relative aspect-video w-full">
        {playing ? (
          <iframe
            title="ÉLÉMENT video"
            className="h-full w-full"
            src={src}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(191,154,87,0.35),transparent_50%),linear-gradient(135deg,#1f1a15_0%,#0f0d0b_55%,#1f1510_100%)]" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
              <p className="text-brand-paper-muted max-w-xl text-sm sm:text-base">
                Pogledajte kako izgleda proces transformacije prostora kroz naš pristup.
              </p>
              <motion.button
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  setPlaying(true);
                  trackEvent("video_play", { location });
                }}
                className="btn-primary rounded-full px-6 py-3 text-sm font-semibold uppercase"
              >
                Pokreni video
              </motion.button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
