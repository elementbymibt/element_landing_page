import Link from "next/link";

import { BookingButton } from "@/src/components/landing/booking-button";
import { Container } from "@/src/components/ui/container";
import { FadeIn } from "@/src/components/ui/fade-in";
import { buildMetadata } from "@/src/lib/seo";

export const metadata = buildMetadata({
  title: "Hvala",
  description: "Potvrda uspešne akcije na landing strani.",
  path: "/thank-you",
});

type ThankYouPageProps = {
  searchParams: Promise<{
    from?: string;
    type?: string;
  }>;
};

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const params = await searchParams;
  const isIntake = params.type?.toLowerCase() === "intake";
  const isCalendly = params.from?.toLowerCase() === "calendly" || !isIntake;

  return (
    <Container className="py-16 sm:py-24">
      <FadeIn className="border-brand-book-edge mx-auto max-w-3xl rounded-[2rem] border bg-[linear-gradient(140deg,#1a140f_0%,#100f0d_55%,#19120e_100%)] p-8 text-center sm:p-12">
        <p className="text-brand-gold text-xs tracking-[0.28em] uppercase">Hvala</p>
        <h1 className="font-display mt-3 text-5xl text-brand-paper sm:text-6xl">
          {isCalendly ? "Termin je uspešno zakazan" : "Upitnik je uspešno poslat"}
        </h1>
        <p className="text-brand-paper-muted mt-4 text-sm leading-relaxed sm:text-base">
          {isCalendly
            ? "Potvrda termina je poslata na email adresu koju ste uneli u Calendly. Vidimo se na konsultacijama."
            : "Analiziraćemo podatke i poslati personalizovani predlog. Ako želite da ubrzamo proces, rezervišite termin za besplatne konsultacije."}
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {isIntake ? <BookingButton location="thank_you" className="w-full sm:w-auto" /> : null}
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
