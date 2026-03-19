import { sendEmail } from "./supportEmailInternal.js";

export const sendSupportMessageEmail = async ({ email, message, user }) => {
  const to = process.env.SUPPORT_EMAIL || process.env.SMTP_USER;

  const fromLine = user
    ? `${user.name} (${user.email})`
    : email
    ? email
    : "Anonymous user";

  const html = `<div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding:24px; background:#0b1120;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;">
    <div style="padding:18px 24px;border-bottom:1px solid #e5e7eb;background:#020617;">
      <div style="color:#f59e0b;font-size:13px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;">AK GARMENTS – Support request</div>
    </div>
    <div style="padding:24px 24px 16px 24px;font-size:14px;color:#111827;">
      <p><strong>From:</strong> ${fromLine}</p>
      <p style="margin-top:12px;white-space:pre-wrap;">${message}</p>
    </div>
  </div>
</div>`;

  await sendEmail({
    to,
    subject: "New AK GARMENTS support request",
    html,
  });
};

