type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  from?: string;
  replyTo?: string;
};

export type SendEmailResult =
  | { status: "sent"; provider: "resend" | "smtp" }
  | { status: "skipped"; reason: "missing_provider" };

async function sendWithResend(apiKey: string, input: SendEmailInput) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: input.from,
      to: input.to,
      reply_to: input.replyTo,
      subject: input.subject,
      text: input.text,
    }),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "resend_error");
    throw new Error(`Resend failed: ${details}`);
  }
}

async function sendWithSmtp(input: SendEmailInput) {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT ?? "");
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  if (!host || !port || !user || !pass) {
    throw new Error("SMTP env vars are missing.");
  }

  const nodemailer = await import("nodemailer");

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  await transporter.sendMail({
    from: input.from,
    to: input.to,
    replyTo: input.replyTo,
    subject: input.subject,
    text: input.text,
  });
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const resendApiKey = process.env.RESEND_API_KEY?.trim();

  if (resendApiKey) {
    await sendWithResend(resendApiKey, input);
    return { status: "sent", provider: "resend" };
  }

  const hasSmtpConfig = Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_PORT?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim(),
  );

  if (hasSmtpConfig) {
    await sendWithSmtp(input);
    return { status: "sent", provider: "smtp" };
  }

  return { status: "skipped", reason: "missing_provider" };
}
