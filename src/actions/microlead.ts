"use server";

import { z } from "zod";

import { devLog } from "@/src/lib/dev-log";
import { sendEmail } from "@/src/lib/email/send-email";
import { saveMicrolead } from "@/src/lib/microlead/store";
import { siteConfig } from "@/src/lib/site-config";

const inputSchema = z.object({
  name: z.string().trim().max(100).optional(),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .optional()
    .refine((value) => !value || z.string().email().safeParse(value).success, {
      message: "Unesite ispravnu email adresu.",
    }),
  location: z.string().trim().min(1).max(120),
  utmCampaign: z.string().trim().max(200).optional(),
  utmContent: z.string().trim().max(200).optional(),
  utmTerm: z.string().trim().max(200).optional(),
});

export type SubmitMicroleadInput = z.infer<typeof inputSchema>;

export type SubmitMicroleadResult = {
  status: "success" | "error";
  message: string;
};

export async function submitMicroleadAction(input: SubmitMicroleadInput): Promise<SubmitMicroleadResult> {
  const parsed = inputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Proverite unete podatke.",
    };
  }

  const name = parsed.data.name ?? "";
  const email = parsed.data.email ?? "";
  const bookingEntryUrl = `${siteConfig.baseUrl}/booking`;

  // Non-blocking flow: continue even if user skips inputs.
  if (!name && !email) {
    return {
      status: "success",
      message: "Nastavljamo na zakazivanje.",
    };
  }

  try {
    const saved = await saveMicrolead({
      name,
      email,
      location: parsed.data.location,
      utmCampaign: parsed.data.utmCampaign ?? "",
      utmContent: parsed.data.utmContent ?? "",
      utmTerm: parsed.data.utmTerm ?? "",
    });

    const contactEmail = process.env.CONTACT_EMAIL_TO?.trim();

    if (contactEmail) {
      await sendEmail({
        from: "ÉLÉMENT Leads <onboarding@resend.dev>",
        to: contactEmail,
        replyTo: email || undefined,
        subject: "[Microlead] Novi booking lead",
        text: [
          "Novi microlead pre zakazivanja.",
          "",
          `Lead ID: ${saved.id}`,
          `Name: ${name || "N/A"}`,
          `Email: ${email || "N/A"}`,
          `Location: ${saved.location}`,
          `UTM campaign: ${saved.utmCampaign || "N/A"}`,
          `UTM content: ${saved.utmContent || "N/A"}`,
          `UTM term: ${saved.utmTerm || "N/A"}`,
        ].join("\n"),
      });
    }

    if (email) {
      await sendEmail({
        from: "ÉLÉMENT Studio <onboarding@resend.dev>",
        to: email,
        subject: "Potvrda pre zakazivanja",
        text: [
          `Pozdrav ${name || ""},`,
          "",
          "Hvala vam. Nastavljate na zakazivanje termina.",
          "Nakon konsultacija dobijate 3 konkretna saveta za vas prostor.",
          "",
          `Link za zakazivanje: ${bookingEntryUrl}`,
        ].join("\n"),
      });
    }

    devLog("microlead_saved", {
      id: saved.id,
      location: saved.location,
      hasEmail: Boolean(email),
    });

    return {
      status: "success",
      message: "Podaci su sacuvani.",
    };
  } catch (error) {
    devLog("microlead_error", {
      reason: error instanceof Error ? error.message : "unknown",
    });

    return {
      status: "error",
      message: "Nismo uspeli da sacuvamo podatke. Mozete nastaviti i bez toga.",
    };
  }
}
