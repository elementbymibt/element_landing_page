import { sendEmail } from "@/src/lib/email/send-email";
import type { IntakeDraft } from "@/src/lib/intake/types";
import { siteConfig } from "@/src/lib/site-config";

function formatMoney(value: number | null) {
  if (typeof value !== "number") {
    return "N/A";
  }

  return `${value.toLocaleString("sr-RS")} EUR`;
}

export async function notifyIntakeSubmitted(input: {
  intake: IntakeDraft;
  projectId: string;
}) {
  const emailTo = process.env.CONTACT_EMAIL_TO?.trim();
  const clientEmail = input.intake.client.email?.trim().toLowerCase();

  if (!emailTo) {
    console.info("[intake] notify skipped (missing CONTACT_EMAIL_TO)");
    return { sent: false, reason: "missing_env" as const };
  }

  const baseUrl = siteConfig.baseUrl;
  const intakeUrl = `${baseUrl}/intake/${input.intake.id}`;
  const subjectCity = input.intake.basics.city || "bez-grada";

  const textBody = [
    "Novi intake je popunjen.",
    "",
    `Projekt ID: ${input.projectId}`,
    `Intake ID: ${input.intake.id}`,
    `Klijent: ${input.intake.client.fullName || "N/A"}`,
    `Email klijenta: ${clientEmail || "N/A"}`,
    `Telefon: ${input.intake.client.phone || "N/A"}`,
    `Grad: ${input.intake.basics.city || "N/A"}`,
    `Tip prostora: ${input.intake.basics.propertyType}`,
    `Kvadratura: ${input.intake.basics.total_m2 ?? "N/A"} m2`,
    `Budžet: ${formatMoney(input.intake.budget.minTotal)} - ${formatMoney(input.intake.budget.maxTotal)}`,
    `Stil: ${input.intake.style.selectedStyles.join(", ") || "N/A"}`,
    `Mood: ${input.intake.mood.selectedMoods.join(", ") || "N/A"}`,
    "",
    `Landing: ${baseUrl}`,
    `Edit intake: ${intakeUrl}`,
    "",
    "Kompletan intake_json:",
    JSON.stringify(input.intake, null, 2),
  ].join("\n");

  try {
    const adminResult = await sendEmail({
      from: "ÉLÉMENT Intake <onboarding@resend.dev>",
      to: emailTo,
      replyTo: clientEmail || undefined,
      subject: `[Intake] ${subjectCity} · ${input.intake.basics.propertyType}`,
      text: textBody,
    });

    if (adminResult.status !== "sent") {
      return { sent: false, reason: "missing_provider" as const };
    }
  } catch (error) {
    console.error("[intake] admin email failed", error);
    return { sent: false, reason: "admin_email_failed" as const };
  }

  if (clientEmail) {
    try {
      const userText = [
        `Poštovani/a ${input.intake.client.fullName || ""},`,
        "",
        "Hvala vam na popunjenom upitniku.",
        "Analiziraćemo unete podatke i kontaktirati vas sa personalizovanom ponudom i sledećim koracima.",
        "",
        "Srdačno,",
        "ÉLÉMENT (by M·I·B·T)",
      ].join("\n");

      await sendEmail({
        from: "ÉLÉMENT Studio <onboarding@resend.dev>",
        to: clientEmail,
        subject: "Hvala na upitniku — ÉLÉMENT",
        text: userText,
      });
    } catch (error) {
      console.error("[intake] user confirmation email error", error);
    }
  }

  return { sent: true as const };
}
