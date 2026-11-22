import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

const resend = resendApiKey && resendApiKey !== "re_xxxxxxxxx" ? new Resend(resendApiKey) : null;

export async function sendOtpEmail(email: string, otpCode: string): Promise<{ success: boolean; error?: string }> {
  // In development or when no valid API key is configured, log clearly to console
  if (!resend) {
    console.log(`\n========================================`);
    console.log(`[DevVault DEV OTP] Code for ${email}: ${otpCode}`);
    console.log(`(Expires in 10 minutes)`);
    console.log(`========================================\n`);
    return { success: true };
  }

  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FFECCB; margin: 0; padding: 24px; color: #1A1A1A; }
            .container { max-width: 520px; margin: 0 auto; background: #FFFFFF; border: 2px solid #FFA97B; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 14px rgba(224, 0, 0, 0.1); }
            .header { background-color: #E00000; padding: 24px; text-align: center; }
            .header h1 { color: #FFFFFF; margin: 0; font-size: 24px; letter-spacing: -0.5px; }
            .content { padding: 32px 24px; text-align: center; }
            .badge { display: inline-block; background-color: #FFA97B; color: #1A1A1A; font-weight: 700; font-size: 13px; padding: 4px 12px; border-radius: 999px; margin-bottom: 16px; }
            .code { font-family: monospace; font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #E00000; background: #FFECCB; padding: 14px 28px; border-radius: 8px; border: 2px dashed #FFA97B; display: inline-block; margin: 20px 0; }
            .footer { padding: 16px 24px; background-color: #FFECCB; font-size: 12px; color: #4A4A4A; text-align: center; border-top: 1px solid #FFA97B; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛡️ DevVault</h1>
            </div>
            <div class="content">
              <div class="badge">Verification Code</div>
              <p style="font-size: 16px; margin: 0 0 12px;">Use the 6-digit code below to securely sign in to your personal vault:</p>
              <div class="code">${otpCode}</div>
              <p style="font-size: 14px; color: #4A4A4A; margin: 12px 0 0;">This code will expire in <strong>10 minutes</strong>. If you did not request this code, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              DevVault — Secure Personal Tech & Repo Bookmarking
            </div>
          </div>
        </body>
      </html>
    `;

    const response = await resend.emails.send({
      from: `DevVault <${resendFromEmail}>`,
      to: [email],
      subject: `Your DevVault Security Verification Code: ${otpCode}`,
      html: htmlContent,
    });

    if (response.error) {
      console.error("Resend API error:", response.error);
      return { success: false, error: response.error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    console.error("Failed to send OTP email:", err);
    return { success: false, error: message };
  }
}
