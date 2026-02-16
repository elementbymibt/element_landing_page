import { NextResponse } from "next/server";

import { intakeStore } from "@/src/lib/intake/store";

export const runtime = "nodejs";

export async function POST() {
  try {
    const draft = await intakeStore.createDraft();

    return NextResponse.json({
      status: "success",
      intakeId: draft.id,
      redirectTo: `/intake/${draft.id}`,
      draft,
    });
  } catch {
    return NextResponse.json(
      {
        status: "error",
        message: "Nismo uspeli da pokrenemo upitnik. Pokušajte ponovo.",
      },
      { status: 500 },
    );
  }
}
