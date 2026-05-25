/**
 * Helper function to send email via Resend API.
 * Reads RESEND_API_KEY from environment variables and logs warnings/errors.
 */
export async function sendEmail(args: {
  to: string[];
  subject: string;
  html: string;
  from?: string;
}): Promise<{ success: boolean; error?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.warn("RESEND_API_KEY is not configured. Email skipped.");
    return { success: false, error: "Missing RESEND_API_KEY" };
  }

  const from = args.from || "BailConnect <noreply@bailconnect.fr>";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: args.to,
        subject: args.subject,
        html: args.html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Resend API error:", errorText);
      return { success: false, error: errorText };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error sending email via Resend:", err);
    return { success: false, error: err.message || String(err) };
  }
}
