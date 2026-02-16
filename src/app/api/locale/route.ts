import { NextResponse } from "next/server";

import { defaultLocale, isLocale, localeCookieName } from "@/src/lib/i18n/config";

export const runtime = "nodejs";

type LocaleRequestBody = {
  locale?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LocaleRequestBody;
    const locale = isLocale(body.locale) ? body.locale : defaultLocale;

    const response = NextResponse.json({ status: "success", locale });

    response.cookies.set(localeCookieName, locale, {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;
  } catch {
    return NextResponse.json({ status: "error" }, { status: 400 });
  }
}
