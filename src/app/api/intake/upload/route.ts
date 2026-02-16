import { NextResponse } from "next/server";

import { intakeStore } from "@/src/lib/intake/store";
import { saveIntakeUpload } from "@/src/lib/intake/uploads";
import {
  intakeAssetKindOptions,
  roomScopeOptions,
  type IntakeAssetKindOption,
  type RoomScopeOption,
} from "@/src/lib/intake/types";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function asEnum<T extends readonly string[]>(
  value: FormDataEntryValue | null,
  options: T,
): T[number] | null {
  if (!value) {
    return null;
  }

  const stringValue = String(value);
  return options.includes(stringValue as T[number]) ? (stringValue as T[number]) : null;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const intakeId = String(formData.get("intakeId") ?? "").trim().toLowerCase();
    const kind = asEnum(formData.get("kind"), intakeAssetKindOptions);
    const roomType = asEnum(formData.get("roomType"), roomScopeOptions) as RoomScopeOption | null;
    const label = String(formData.get("label") ?? "").trim() || null;
    const file = formData.get("file");

    if (!intakeId || !UUID_PATTERN.test(intakeId) || !kind || !(file instanceof File)) {
      return NextResponse.json(
        {
          status: "error",
          message: "Nedostaju obavezni podaci za upload.",
        },
        { status: 400 },
      );
    }

    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          status: "error",
          message: "Fajl je prazan ili veći od 15MB.",
        },
        { status: 400 },
      );
    }

    const asset = await saveIntakeUpload({
      intakeId,
      file,
      kind: kind as IntakeAssetKindOption,
      roomType,
      label,
    });

    await intakeStore.addAsset(intakeId, asset);

    return NextResponse.json({
      status: "success",
      asset,
    });
  } catch {
    return NextResponse.json(
      {
        status: "error",
        message: "Upload nije uspeo. Pokušajte ponovo.",
      },
      { status: 500 },
    );
  }
}
