export function buildFrom(displayName: string) {
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim() || "onboarding@resend.dev";
  return `${displayName} <${fromEmail}>`;
}

