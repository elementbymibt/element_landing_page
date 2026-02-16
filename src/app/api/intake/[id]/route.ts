import { NextResponse } from "next/server";

import { intakeStore } from "@/src/lib/intake/store";
import { createDefaultIntakeDraft } from "@/src/lib/intake/schema";
import type { IntakeDraft } from "@/src/lib/intake/types";

export const runtime = "nodejs";

type IntakePatchRequest = {
  draft?: Partial<IntakeDraft>;
  currentStep?: number;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeId(id: string) {
  return id.trim().toLowerCase();
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  const id = normalizeId(params.id);

  if (!UUID_PATTERN.test(id)) {
    return NextResponse.json(
      {
        status: "error",
        message: "Nevalidan intake ID.",
      },
      { status: 400 },
    );
  }

  try {
    const record = await intakeStore.getIntakeWithProject(id);

    if (!record) {
      return NextResponse.json(
        {
          status: "error",
          message: "Intake nije pronađen.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      status: "success",
      intake: record.intake,
      project: record.project,
    });
  } catch {
    return NextResponse.json(
      {
        status: "error",
        message: "Došlo je do greške pri učitavanju intake-a.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  const id = normalizeId(params.id);

  if (!UUID_PATTERN.test(id)) {
    return NextResponse.json(
      {
        status: "error",
        message: "Nevalidan intake ID.",
      },
      { status: 400 },
    );
  }

  try {
    const body = (await request.json()) as IntakePatchRequest;
    const patch = body.draft ?? {};

    const saved = await intakeStore.saveDraft(id, {
      ...patch,
      id,
      currentStep: typeof body.currentStep === "number" ? body.currentStep : patch.currentStep,
    });

    return NextResponse.json({
      status: "success",
      intake: saved,
      savedAt: saved.updatedAt,
    });
  } catch {
    const fallback = createDefaultIntakeDraft({ id });

    return NextResponse.json(
      {
        status: "error",
        message: "Snimanje trenutno nije uspelo.",
        fallback,
      },
      { status: 500 },
    );
  }
}
