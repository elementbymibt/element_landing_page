import type { Metadata } from "next";

import { siteConfig } from "@/src/lib/site-config";

type MetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
};

export function buildMetadata({ title, description, path, image = "/og/landing-og.jpg" }: MetadataInput): Metadata {
  const absoluteUrl = new URL(path, siteConfig.baseUrl).toString();

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl,
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: "sr_RS",
      url: absoluteUrl,
      siteName: siteConfig.legalName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${siteConfig.legalName} landing`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
