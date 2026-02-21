"use client";

import { useState } from "react";

type VideoPlaceholderProps = {
  src?: string;
  poster?: string;
  title?: string;
};

export function VideoPlaceholder({
  src = "/videos/hero-placeholder.mp4",
  poster = "/og/landing-og.jpg",
  title = "ÉLÉMENT video",
}: VideoPlaceholderProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-md border border-[#D8CBB8] bg-[#EDE4D4] px-6 text-center">
        <p className="text-sm font-medium text-[#8B8072]">Video placeholder (zamenite sa finalnim snimkom)</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-[#D8CBB8] bg-[#EDE4D4]">
      <video
        className="aspect-video w-full object-cover"
        autoPlay
        muted
        playsInline
        loop
        preload="metadata"
        poster={poster}
        aria-label={title}
        onError={() => setHasError(true)}
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
}

