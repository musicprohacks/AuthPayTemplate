import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Sends the passwordless sign-in link. Without RESEND_API_KEY set (e.g. in
 * local dev or tests), the link is logged to the server console instead of
 * emailed, so the sign-in flow still works end to end.
 */
export async function sendMagicLinkEmail({ to, url }: { to: string; url: string }) {
  const from = process.env.AUTH_EMAIL_FROM ?? "onboarding@resend.dev";

  if (!resend) {
    console.log(`[dev] Magic sign-in link for ${to}: ${url}`);
    return;
  }

  const { error } = await resend.emails.send({
    from,
    to,
    subject: "Your sign-in link",
    html: `<p><a href="${url}">Sign in</a></p><p>If you didn't request this, you can ignore this email.</p>`,
  });

  if (error) {
    throw new Error(`Failed to send sign-in email: ${error.message}`);
  }
}
