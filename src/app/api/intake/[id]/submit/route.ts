import { NextResponse } from "next/server";

import { submitIntakeNotification } from "@/src/actions/intake";
import { intakeStore } from "@/src/lib/intake/store";
import type { IntakeDraft } from "@/src/lib/intake/types";

export const runtime = "nodejs";

type SubmitRequestBody = {
  confirmContradictions?: boolean;
  draft?: Partial<IntakeDraft>;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeId(id: string) {
  return id.trim().toLowerCase();
}

export async function POST(
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
    const body = (await request.json()) as SubmitRequestBody;

    if (body.draft) {
      await intakeStore.saveDraft(id, {
        ...body.draft,
        currentStep: 3,
      });
    }

    // Intake flow must not block the user: contradictions are handled internally.
    const result = await intakeStore.submitDraft(id, true);

    const projectId = result.project?.id ?? id;

    // Email notifikacija je best-effort i ne sme da blokira submit flow.
    try {
      const notifyResult = await submitIntakeNotification({
        intake: result.intake,
        projectId,
      });
      if (notifyResult.status === "error") {
        console.error("[intake] submitIntakeNotification returned error", notifyResult.message);
      }
    } catch (error) {
      console.error("[intake] submitIntakeNotification failed", error);
    }

    return NextResponse.json({
      status: "success",
      message: "Upitnik je uspešno poslat.",
      projectId,
      intake: result.intake,
      contradictions: result.contradictions,
      redirectTo: `/thank-you?type=intake`,
    });
  } catch {
    return NextResponse.json(
      {
        status: "error",
        message: "Nismo uspeli da završimo intake. Pokušajte ponovo.",
      },
      { status: 500 },
    );
  }
}
