import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { getUtmCookieName, parseUtmCookieValue } from "@/src/lib/utm";

export const dynamic = "force-dynamic";

function hasEnv(value: string | undefined) {
  return Boolean(value && value.trim().length > 0);
}

export default async function AdminTestPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const cookieStore = await cookies();
  const rawUtmCookie = cookieStore.get(getUtmCookieName())?.value;
  const decodedUtm = parseUtmCookieValue(rawUtmCookie ? decodeURIComponent(rawUtmCookie) : undefined);

  const rows = [
    { key: "NODE_ENV", value: process.env.NODE_ENV || "(empty)" },
    { key: "NEXT_PUBLIC_SITE_URL", value: process.env.NEXT_PUBLIC_SITE_URL || "(missing)" },
    { key: "NEXT_PUBLIC_BOOKING_URL", value: process.env.NEXT_PUBLIC_BOOKING_URL || "(missing)" },
    { key: "GA configured", value: hasEnv(process.env.NEXT_PUBLIC_GA_ID) ? "yes" : "no" },
    { key: "Meta Pixel configured", value: hasEnv(process.env.NEXT_PUBLIC_META_PIXEL_ID) ? "yes" : "no" },
    { key: "RESEND_API_KEY", value: hasEnv(process.env.RESEND_API_KEY) ? "present" : "missing" },
    {
      key: "SMTP configured",
      value:
        hasEnv(process.env.SMTP_HOST) &&
        hasEnv(process.env.SMTP_PORT) &&
        hasEnv(process.env.SMTP_USER) &&
        hasEnv(process.env.SMTP_PASS)
          ? "yes"
          : "no",
    },
    { key: "DATABASE_URL", value: hasEnv(process.env.DATABASE_URL) ? "present" : "missing" },
    {
      key: "UTM capture cookie",
      value: decodedUtm ? `yes (${decodedUtm.campaign || "-"} | ${decodedUtm.content || "-"} | ${decodedUtm.term || "-"})` : "no",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="font-display text-4xl text-brand-paper">CRO Test Console (dev)</h1>
      <p className="text-brand-paper-muted mt-3 text-sm">
        Brza validacija env konfiguracije, analytics prisutnosti i UTM capture stanja.
      </p>

      <div className="mt-8 overflow-hidden rounded-2xl border border-brand-book-edge">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-brand-ink/80 text-brand-gold">
            <tr>
              <th className="px-4 py-3 font-semibold">Key</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-t border-brand-book-edge/80">
                <td className="px-4 py-3 text-brand-paper">{row.key}</td>
                <td className="px-4 py-3 text-brand-paper-muted">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
