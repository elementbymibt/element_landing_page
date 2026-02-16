import Link from "next/link";

import { BookingButton } from "@/src/components/landing/booking-button";
import { Container } from "@/src/components/ui/container";
import { FadeIn } from "@/src/components/ui/fade-in";
import { buildMetadata } from "@/src/lib/seo";

export const metadata = buildMetadata({
  title: "Hvala",
  description: "Upitnik je uspešno poslat. Sledeći korak je rezervacija konsultacija.",
  path: "/thank-you",
});

export default function ThankYouPage() {
  return (
    <Container className="py-16 sm:py-24">
      <FadeIn className="border-brand-book-edge mx-auto max-w-3xl rounded-[2rem] border bg-[linear-gradient(140deg,#1a140f_0%,#100f0d_55%,#19120e_100%)] p-8 text-center sm:p-12">
        <p className="text-brand-gold text-xs tracking-[0.28em] uppercase">Hvala</p>
        <h1 className="font-display mt-3 text-5xl text-brand-paper sm:text-6xl">Upitnik je uspešno poslat</h1>
        <p className="text-brand-paper-muted mt-4 text-sm leading-relaxed sm:text-base">
          Analiziraćemo podatke i poslati personalizovani predlog. Ako želite da ubrzamo proces, rezervišite termin za
          besplatne konsultacije.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <BookingButton location="thank_you" className="w-full sm:w-auto" />
          <Link
            href="/"
            className="btn-secondary inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold uppercase"
          >
            Nazad na landing
          </Link>
        </div>
      </FadeIn>
    </Container>
  );
}
