import Image from "next/image";
import Link from "next/link";

import { StartIntakeButton } from "@/src/components/intake/start-intake-button";
import { Container } from "@/src/components/ui/container";
import { FadeIn } from "@/src/components/ui/fade-in";
import { buildMetadata } from "@/src/lib/seo";

export const metadata = buildMetadata({
  title: "Klijentski upitnik",
  description:
    "Popunite puni intake upitnik i dobijte personalizovanu ponudu pre konsultacija.",
  path: "/intake/start",
});

export default function IntakeStartPage() {
  return (
    <Container className="py-10 sm:py-14">
      <FadeIn>
        <div className="border-brand-book-edge bg-[linear-gradient(140deg,#19130f_0%,#11100d_40%,#19120f_100%)] rounded-[2rem] border p-6 sm:p-10">
          <p className="text-brand-gold text-xs tracking-[0.28em] uppercase">Klijentski upitnik</p>
          <h1 className="font-display mt-3 max-w-4xl text-4xl leading-tight text-brand-paper sm:text-6xl">
            Kompletan intake pre konsultacija
          </h1>
          <p className="text-brand-paper-muted mt-4 max-w-3xl text-sm leading-relaxed sm:text-base">
            Popunjavanje traje oko 10-12 minuta. Kroz upitnik dobijamo sve ključne ulaze za kvalitetniju analizu i
            precizniju ponudu.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <StartIntakeButton />
            <Link
              href="/"
              className="btn-secondary inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold uppercase"
            >
              Nazad na landing
            </Link>
          </div>

          <div className="mt-9 grid gap-4 md:grid-cols-4">
            {[
              {
                src: "/intake/step-space.jpg",
                title: "Stil",
                desc: "Definišemo estetski pravac i vizuelni ton.",
              },
              {
                src: "/intake/step-kitchen.jpg",
                title: "Prostor",
                desc: "Unosite podatke o prostoru i obimu zahvata.",
              },
              {
                src: "/intake/step-bedroom.jpg",
                title: "Prioriteti",
                desc: "Mapiramo budžet, rok i funkcionalne zahteve.",
              },
              {
                src: "/intake/step-docs.jpg",
                title: "Potvrda",
                desc: "Finalna provera pre slanja upitnika.",
              },
            ].map((item) => (
              <div key={item.src} className="border-brand-book-edge overflow-hidden rounded-2xl border bg-brand-ink/40">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={item.src}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0" />
                </div>
                <div className="p-4">
                  <p className="text-brand-gold text-xs tracking-[0.2em] uppercase">{item.title}</p>
                  <p className="text-brand-paper-muted mt-2 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </Container>
  );
}
