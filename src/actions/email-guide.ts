"use server";

import { z } from "zod";

import { sendEmail } from "@/src/lib/email/send-email";
import { siteConfig } from "@/src/lib/site-config";

export type EmailGuideActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const emailSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

const initialState: EmailGuideActionState = {
  status: "idle",
  message: "",
};

export async function submitEmailGuideAction(
  _prevState: EmailGuideActionState = initialState,
  formData: FormData,
): Promise<EmailGuideActionState> {
  void _prevState;

  const parsed = emailSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Unesite ispravnu email adresu.",
    };
  }

  const email = parsed.data.email;
  const emailTo = process.env.CONTACT_EMAIL_TO?.trim();
  const bookingEntryUrl = `${siteConfig.baseUrl}/booking`;

  if (!emailTo) {
    return {
      status: "success",
      message: "Prijava je evidentirana.",
    };
  }

  try {
    const adminResult = await sendEmail({
      from: "ÉLÉMENT Leads <onboarding@resend.dev>",
      to: emailTo,
      replyTo: email,
      subject: "[Landing] Novi email lead",
      text: `Novi lead sa landing stranice.\n\nEmail: ${email}`,
    });

    if (adminResult.status !== "sent") {
      return {
        status: "success",
        message: "Prijava je evidentirana.",
      };
    }

    await sendEmail({
      from: "ÉLÉMENT Studio <onboarding@resend.dev>",
      to: email,
      subject: "Vaš mini vodič je spreman",
      text: [
        "Hvala na prijavi.",
        "",
        "Mini vodič: 7 grešaka u uređenju prostora",
        "1) Bez plana kretanja kroz prostor",
        "2) Pogrešna skala nameštaja",
        "3) Nedovoljno slojevita rasveta",
        "4) Fokus na estetiku bez funkcionalnosti",
        "5) Nedefinisan budžet po fazama",
        "6) Loš redosled nabavke",
        "7) Bez jasnog plana realizacije",
        "",
        `Ako zelite, odmah rezervisite konsultacije: ${bookingEntryUrl}`,
      ].join("\n"),
    });

    return {
      status: "success",
      message: "Mini vodič je poslat na email.",
    };
  } catch {
    return {
      status: "error",
      message: "Slanje trenutno nije uspelo. Pokušajte ponovo.",
    };
  }
}
