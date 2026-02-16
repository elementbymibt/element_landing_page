import type { Metadata } from "next";

import { LandingPage } from "@/src/components/landing/landing-page";
import { buildMetadata } from "@/src/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Besplatne konsultacije + 10% popusta",
  description:
    "Rezervišite besplatne konsultacije za dizajn enterijera ili popunite upitnik i dobijte personalizovanu ponudu pre poziva.",
  path: "/",
});

export default function Home() {
  return <LandingPage />;
}
