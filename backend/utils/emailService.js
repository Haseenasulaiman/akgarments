import fs from "fs/promises";

const buildBrevoAttachments = async (attachments) => {
  if (!attachments || !Array.isArray(attachments) || attachments.length === 0) {
    return undefined;
  }

  const mapped = await Promise.all(
    attachments.map(async (att) => {
      if (att?.content) {
        const buf =
          typeof att.content === "string"
            ? Buffer.from(att.content)
            : Buffer.from(att.content);
        return {
          name: att.filename || "attachment",
          content: buf.toString("base64"),
        };
      }

      if (att?.path) {
        const buf = await fs.readFile(att.path);
        return {
          name: att.filename || "attachment",
          content: buf.toString("base64"),
        };
      }

      return null;
    })
  );

  const filtered = mapped.filter(Boolean);
  return filtered.length ? filtered : undefined;
};

const sendEmail = async ({ to, subject, html, attachments }) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    // eslint-disable-next-line no-console
    console.warn("BREVO_API_KEY is not set. Skipping email send.");
    return;
  }

  const senderEmail =
    process.env.BREVO_SENDER_EMAIL || process.env.BREVO_SENDER || "";
  const senderName = process.env.BREVO_SENDER_NAME || "AK GARMENTS Store";

  if (!senderEmail) {
    // eslint-disable-next-line no-console
    console.warn(
      "BREVO_SENDER_EMAIL is not set. Cannot send email without sender."
    );
    return;
  }

  const toList = Array.isArray(to)
    ? to.map((email) => ({ email }))
    : String(to)
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean)
        .map((email) => ({ email }));

  const brevoAttachments = await buildBrevoAttachments(attachments);

  const resp = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: senderName },
      to: toList,
      subject,
      htmlContent: html,
      attachment: brevoAttachments,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    // eslint-disable-next-line no-console
    console.error(
      `Brevo email failed (${resp.status} ${resp.statusText}) ${text}`.trim()
    );
    throw new Error(
      `Brevo email failed (${resp.status} ${resp.statusText})`.trim()
    );
  }

  // eslint-disable-next-line no-console
  console.log("Email sent successfully via Brevo");
};

export const sendOtpEmail = async (user, otp) => {
  const html = `<div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding:24px; background:#0b1120;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;">
    <div style="padding:18px 24px;border-bottom:1px solid #e5e7eb;background:#020617;">
      <div style="color:#f59e0b;font-size:13px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;">AK GARMENTS</div>
      <div style="color:#e5e7eb;font-size:11px;margin-top:4px;">Premium Men's Clothing</div>
    </div>
    <div style="padding:24px 24px 8px 24px;font-size:14px;color:#111827;">
      <p>Hi ${user.name},</p>
      <p>Your AK GARMENTS verification one-time password (OTP) is:</p>
      <div style="margin:18px 0;text-align:center;">
        <span style="display:inline-block;padding:10px 18px;border-radius:999px;background:#0b1120;color:#f9fafb;font-weight:600;letter-spacing:0.25em;">
          ${otp}
        </span>
      </div>
      <p style="font-size:12px;color:#6b7280;">This code is valid for 10 minutes. If you did not try to sign up, you can safely ignore this email.</p>
    </div>
    <div style="padding:16px 24px 20px 24px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;">
      <div>AK GARMENTS Store</div>
      <div>Tailored essentials for every room you enter.</div>
    </div>
  </div>
</div>`;

  await sendEmail({ to: user.email, subject: "Verify your AK GARMENTS account", html });
};

export const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const html = `<div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding:24px; background:#0b1120;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;">
    <div style="padding:18px 24px;border-bottom:1px solid #e5e7eb;background:#020617;">
      <div style="color:#f59e0b;font-size:13px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;">AK GARMENTS</div>
      <div style="color:#e5e7eb;font-size:11px;margin-top:4px;">Premium Men's Clothing</div>
    </div>
    <div style="padding:24px 24px 8px 24px;font-size:14px;color:#111827;">
      <p>Hi ${user.name},</p>
      <p>We received a request to reset the password for your AK GARMENTS account.</p>
      <p>Click the button below to choose a new password:</p>
      <div style="margin:18px 0;text-align:center;">
        <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;border-radius:999px;background:#0b1120;color:#f9fafb;font-weight:600;font-size:13px;text-decoration:none;">
          Reset password
        </a>
      </div>
      <p style="font-size:12px;color:#6b7280;">If you did not request this, you can safely ignore this email and your password will remain unchanged.</p>
    </div>
    <div style="padding:16px 24px 20px 24px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;">
      <div>AK GARMENTS Store</div>
      <div>Tailored essentials for every room you enter.</div>
    </div>
  </div>
</div>`;

  await sendEmail({ to: user.email, subject: "Reset your AK GARMENTS password", html });
};

export const sendOrderConfirmation = async (user, order, invoiceUrl, invoicePathOnDisk) => {
  const itemsRows = (order.items || [])
    .map(
      (item) =>
        `<tr>
          <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:12px;">${item.nameSnapshot}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:12px;text-align:center;">${item.size}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:12px;text-align:center;">${item.quantity}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:12px;text-align:right;">₹${item.subtotal}</td>
        </tr>`
    )
    .join("");

  const html = `<div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding:24px; background:#0b1120;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;">
    <div style="padding:18px 24px;border-bottom:1px solid #e5e7eb;background:#020617;">
      <div style="color:#f59e0b;font-size:13px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;">AK GARMENTS</div>
      <div style="color:#e5e7eb;font-size:11px;margin-top:4px;">Order confirmation</div>
    </div>
    <div style="padding:24px 24px 8px 24px;font-size:14px;color:#111827;">
      <p>Hi ${user.name},</p>
      <p>Thank you for shopping with <strong>AK GARMENTS</strong>. Your order <strong>#${order._id}</strong> has been placed successfully.</p>
      <p style="margin-top:16px;margin-bottom:8px;font-weight:600;">Order summary</p>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:11px;text-align:left;">Item</th>
            <th style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:11px;text-align:center;">Size</th>
            <th style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:11px;text-align:center;">Qty</th>
            <th style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:11px;text-align:right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>
      <div style="margin-top:12px;font-size:12px;color:#374151;">
        <div>Subtotal: ₹${order.totals.subtotal}</div>
        <div>Discount: -₹${order.totals.discount}</div>
        <div>Tax: ₹${order.totals.tax}</div>
        <div>Shipping: ₹${order.totals.shipping}</div>
        <div style="margin-top:4px;font-weight:600;">Grand total: ₹${order.totals.grandTotal}</div>
      </div>
      <p style="margin-top:18px;font-size:12px;color:#6b7280;">
        A PDF copy of your tax invoice is attached to this email. You can also download it any time from the Orders section of your AK GARMENTS account.
      </p>
    </div>
    <div style="padding:16px 24px 20px 24px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;">
      <div>AK GARMENTS Store</div>
      <div>Tailored essentials for every room you enter.</div>
    </div>
  </div>
</div>`;

  const mailOptions = {
    to: user.email,
    subject: `AK GARMENTS – Order #${order._id} confirmed`,
    html,
  };

  if (invoicePathOnDisk) {
    mailOptions.attachments = [
      {
        filename: `AK GARMENTS-Invoice-${order._id}.pdf`,
        path: invoicePathOnDisk,
        contentType: "application/pdf",
      },
    ];
  }

  await sendEmail(mailOptions);
};

export const sendOrderStatusEmail = async (user, order, status) => {
  const html = `<div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding:24px; background:#0b1120;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;">
    <div style="padding:18px 24px;border-bottom:1px solid #e5e7eb;background:#020617;">
      <div style="color:#f59e0b;font-size:13px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;">AK GARMENTS</div>
      <div style="color:#e5e7eb;font-size:11px;margin-top:4px;">Order update</div>
    </div>
    <div style="padding:24px 24px 16px 24px;font-size:14px;color:#111827;">
      <p>Hi ${user.name},</p>
      <p>Your order <strong>#${order._id}</strong> is now <strong>${status}</strong>.</p>
      <p style="font-size:12px;color:#6b7280;margin-top:12px;">
        You can see full details and download your invoice any time from the Orders section of your AK GARMENTS account.
      </p>
    </div>
  </div>
</div>`;

  await sendEmail({
    to: user.email,
    subject: `Your AK GARMENTS order is ${status}`,
    html,
  });
};

export const sendCouponEligibilityEmail = async (user, coupon, amount) => {
  const threshold = coupon.thresholdAmount || coupon.minOrderValue || 0;
  const discountPreview =
    coupon.discountType === "percentage"
      ? `${coupon.amount}% off`
      : `₹${coupon.amount} off`;

  const html = `<div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding:24px; background:#0b1120;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;">
    <div style="padding:18px 24px;border-bottom:1px solid #e5e7eb;background:#020617;">
      <div style="color:#f59e0b;font-size:13px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;">AK GARMENTS</div>
      <div style="color:#e5e7eb;font-size:11px;margin-top:4px;">Coupon unlocked</div>
    </div>
    <div style="padding:24px 24px 16px 24px;font-size:14px;color:#111827;">
      <p>Hi ${user.name},</p>
      <p>Great news – your current cart value of <strong>₹${amount}</strong> makes you eligible to use coupon <strong>${coupon.code}</strong>.</p>
      <p style="margin-top:12px;">This coupon gives you <strong>${discountPreview}</strong> on orders above <strong>₹${threshold}</strong>.</p>
      <div style="margin:18px 0;text-align:center;">
        <span style="display:inline-block;padding:10px 18px;border-radius:999px;background:#0b1120;color:#f9fafb;font-weight:600;letter-spacing:0.18em;">
          ${coupon.code}
        </span>
      </div>
      <p style="font-size:12px;color:#6b7280;">Apply this code on the checkout page before placing your order. Terms and validity apply as per the offer details.</p>
    </div>
  </div>
</div>`;

  await sendEmail({
    to: user.email,
    subject: `You're eligible for coupon ${coupon.code}`,
    html,
  });
};

export { sendEmail };

