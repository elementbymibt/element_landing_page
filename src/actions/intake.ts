"use server";

import { notifyIntakeSubmitted } from "@/src/lib/intake/notify";
import type { IntakeDraft } from "@/src/lib/intake/types";

export type IntakeNotificationActionState = {
  status: "success" | "error";
  delivery: "sent" | "skipped" | "failed";
  message: string;
  reason?: string;
};

export async function submitIntakeNotification(
  input: {
    intake: IntakeDraft;
    projectId: string;
  },
): Promise<IntakeNotificationActionState> {
  try {
    const result = await notifyIntakeSubmitted(input);

    if (!result.sent) {
      return {
        status: "success",
        delivery: "skipped",
        message: "Upitnik je sačuvan. Email notifikacija je preskočena (nije konfigurisan provider).",
        reason: result.reason,
      };
    }

    return {
      status: "success",
      delivery: "sent",
      message: "Upitnik je sačuvan i email potvrda je poslata.",
    };
  } catch (error) {
    console.error("[intake-action] submitIntakeNotification failed", error);
    return {
      status: "error",
      delivery: "failed",
      message: "Upitnik je sačuvan, ali slanje email notifikacije nije uspelo.",
      reason: "notification_exception",
    };
  }
}
