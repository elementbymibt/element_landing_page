"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";

import { trackEvent } from "@/src/lib/analytics";
import { devLog } from "@/src/lib/dev-log";
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
    <div className="relative overflow-hidden rounded-[1.5rem] border border-brand-book-edge/80 bg-brand-ink/70">
      <div className="relative aspect-video w-full">
        {playing ? (
          <iframe
            title="ELEMENT video"
            className="h-full w-full"
            src={src}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(191,154,87,0.35),transparent_45%),linear-gradient(135deg,#21190f_0%,#100d0b_52%,#21170f_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_45%,rgba(0,0,0,0.5)_100%)]" />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
              <p className="font-display text-2xl text-brand-paper sm:text-4xl">Kako izgleda transformacija prostora</p>
              <p className="text-brand-paper-muted mt-3 max-w-xl text-sm leading-relaxed sm:text-base">
                Kratka prezentacija procesa od prvog uvida do finalne vizuelizacije.
              </p>
              <motion.button
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  setPlaying(true);
                  trackEvent("video_play", { location });
                  devLog("video_play", { location });
                }}
                className="btn-primary mt-5 rounded-full px-7 py-3 text-sm font-semibold uppercase"
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
