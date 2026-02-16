import { redirect } from "next/navigation";

import { intakeStore } from "@/src/lib/intake/store";

export const dynamic = "force-dynamic";

export default async function IntakeNewPage() {
  const draft = await intakeStore.createDraft();
  redirect(`/intake/${draft.id}`);
}
