import "server-only";
import { env, integrations } from "@/lib/env";

export interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Send a transactional email. Uses Resend when configured; otherwise logs to the
 * server console with a clear DEV-MODE marker so flows are testable without a key.
 * Never logs full secrets or tokens contained in URLs at info level in prod.
 */
export async function sendEmail(input: SendEmailInput): Promise<{ ok: boolean; mocked: boolean }> {
  if (!integrations.email) {
    if (env.NODE_ENV !== "production") {
      console.info(
        `\n[email:dev-mock] → ${input.to}\n  subject: ${input.subject}\n  ${input.text}\n`,
      );
    }
    return { ok: true, mocked: true };
  }

  const { Resend } = await import("resend");
  const resend = new Resend(env.RESEND_API_KEY);
  const result = await resend.emails.send({
    from: env.EMAIL_FROM,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });
  return { ok: !result.error, mocked: false };
}
