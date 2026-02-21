import type { Metadata } from "next";

import { CtaButton } from "@/src/components/landing/cta-button";
import { LandingViewTracker } from "@/src/components/landing/landing-view-tracker";
import { VideoPlaceholder } from "@/src/components/landing/video-placeholder";
import { buildMetadata } from "@/src/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Jedna pogrešna odluka može da vas košta 30.000€.",
  description:
    "Premium landing fokusiran na jedan cilj: zakazivanje besplatnih konsultacija za enterijer.",
  path: "/",
});

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F5F1EA] text-[#3E332D]">
      <LandingViewTracker />

      <section className="w-full border-b border-[#E2D7C4]">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 pb-10 pt-8 sm:px-6 sm:pb-12 sm:pt-10 md:px-8 md:pb-14 md:pt-12 lg:min-h-[74vh] lg:grid-cols-2 lg:items-center lg:gap-10 lg:pt-14">
          <div>
            <VideoPlaceholder src={process.env.NEXT_PUBLIC_HERO_VIDEO_SRC?.trim() || undefined} />
          </div>

          <div className="space-y-5">
            <h1 className="font-display text-balance text-[2rem] leading-[1.06] text-[#3B0D18] sm:text-[2.5rem] lg:text-[3.2rem]">
              Jedna pogrešna odluka može da vas košta 30.000€.
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
              <CtaButton location="hero_primary" className="w-full sm:w-auto">
                Zakažite besplatne konsultacije
              </CtaButton>
              <p className="mt-2.5 text-sm text-[#8B8072]">30 minuta. Bez obaveze. Bez prodaje na silu.</p>
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

      <section className="w-full bg-[#F5F1EA] pb-28 pt-10 sm:pb-12 sm:pt-12">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 text-center sm:px-6">
          <h3 className="font-display text-pretty text-3xl leading-tight text-[#3B0D18] sm:text-4xl">
            Spremni za mirnu i sigurnu odluku?
          </h3>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#8B8072]">
            Dobijate jasan pravac pre troška i pre improvizacije na terenu.
          </p>
          <div className="mt-6">
            <CtaButton location="final_primary">Donesite pravu odluku danas</CtaButton>
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#D8CBB8] bg-[#F5F1EA]/95 p-3 backdrop-blur md:hidden">
        <CtaButton location="sticky_mobile" className="w-full">
          Zakažite besplatne konsultacije
        </CtaButton>
      </div>
    </div>
  );
}
