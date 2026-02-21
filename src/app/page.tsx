import type { Metadata } from "next";

import { CalendlyLink } from "@/src/components/landing/calendly-link";
import { CtaButton } from "@/src/components/landing/cta-button";
import { LandingViewTracker } from "@/src/components/landing/landing-view-tracker";
import { VideoPlaceholder } from "@/src/components/landing/video-placeholder";
import { buildMetadata } from "@/src/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Besplatne konsultacije enterijera",
  description:
    "Premium landing fokusiran na jedan cilj: zakazivanje besplatnih konsultacija za enterijer.",
  path: "/",
});

export default function Home() {
  const heroCtaText = "Zakažite besplatne konsultacije";
  // A/B-ready alternative:
  // const heroCtaText = "Donesite pravu odluku danas";

  return (
    <div className="min-h-screen bg-[#F5F1EA] text-[#3E332D]">
      <LandingViewTracker />
      <div className="pointer-events-none fixed left-3 top-3 z-40 select-none text-[#3B0D18]/80 sm:left-4 sm:top-4">
        <p className="font-display text-2xl leading-none sm:text-[1.8rem]">ÉLÉMENT</p>
        <p className="mt-1 text-[11px] tracking-[0.2em] uppercase text-[#8B8072]">by M · I · B · T</p>
      </div>

      <section className="w-full border-b border-[#E2D7C4]">
        <div className="mx-auto grid w-full max-w-6xl gap-7 px-4 pb-10 pt-24 sm:px-6 sm:pb-12 sm:pt-24 md:px-8 md:pb-14 md:pt-24 lg:min-h-[74vh] lg:grid-cols-2 lg:items-center lg:gap-10 lg:pt-24">
          <div className="order-2 lg:order-1">
            <VideoPlaceholder src={process.env.NEXT_PUBLIC_HERO_VIDEO_SRC?.trim() || undefined} />
          </div>

          <div className="order-1 space-y-5 lg:order-2">
            <h1 className="font-display text-balance text-[1.95rem] leading-[1.08] text-[#3B0D18] sm:text-[2.35rem] lg:text-[2.9rem]">
              <span>Jedna pogrešna odluka može da vas košta</span>{" "}
              <CalendlyLink
                location="price"
                ariaLabel="Zakažite konsultacije"
                className="hero-impact-number relative inline-block text-[1.85em] font-semibold leading-none text-[#C9A35D] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A35D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F1EA]"
              >
                <span className="border-b-2 border-[#C9A35D]/80 pb-0.5">30.000€</span>
              </CalendlyLink>
              .
            </h1>

            <p className="max-w-xl text-pretty text-base leading-relaxed text-[#3E332D] sm:text-lg">
              Odluke o prostoru se najčešće donose pre nego što vidite posledicu. Mi to menjamo.
            </p>

            <ul className="space-y-2.5 text-sm text-[#3E332D] sm:text-base">
              {[
                "Vidite prostor pre nego što platite",
                "Znate granicu pre nego što trošite",
                "Odluka je mirna, ne impulsivna",
              ].map((bullet) => (
                <li key={bullet} className="flex items-start gap-3">
                  <span aria-hidden className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#C9A35D]" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="pt-1">
              <div className="hero-cta-impact w-full sm:w-fit">
                <CtaButton location="hero" className="w-full min-w-[18rem] sm:w-auto">
                  {heroCtaText}
                </CtaButton>
              </div>
              <p className="mt-2.5 text-sm text-[#8B8072]">15 minuta. Bez obaveze. Bez prodaje na silu.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-[#EFE6D8]">
        <div className="mx-auto w-full max-w-4xl px-4 py-10 text-center sm:px-6 sm:py-12 md:py-14">
          <h2 className="font-display text-pretty text-3xl leading-tight text-[#3B0D18] sm:text-4xl">
            Odluka mora da dođe pre troška.
          </h2>
          <p className="mx-auto mt-4 max-w-3xl whitespace-pre-line text-base leading-relaxed text-[#3E332D] sm:text-lg">
            U ÉLÉMENT-u ne prodajemo stil.
            {"\n"}Pravimo sistem: plan → 3D → odluka.
            {"\n"}Tako znate ishod pre nego što novac ode.
          </p>
        </div>
      </section>

      <section className="w-full bg-[#F5F1EA] pb-36 pt-10 sm:pb-14 sm:pt-12">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 text-center sm:px-6">
          <h3 className="font-display text-pretty text-3xl leading-tight text-[#3B0D18] sm:text-4xl">
            Spremni za mirnu i sigurnu odluku?
          </h3>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#8B8072]">
            Dobijate jasan pravac pre troška i pre improvizacije na terenu.
          </p>
          <div className="mt-6">
            <CtaButton location="bottom">Donesite pravu odluku danas</CtaButton>
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#D8CBB8] bg-[#F5F1EA]/95 p-3 backdrop-blur md:hidden">
        <div className="hero-cta-impact w-full">
          <CtaButton location="bottom" className="w-full">
            {heroCtaText}
          </CtaButton>
        </div>
      </div>
    </div>
  );
}
