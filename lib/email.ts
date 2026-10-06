import nodemailer from "nodemailer";

// Owner digest mail. SMTP settings mirror the other Fairtech apps so the same
// Gmail app password works here.
export function mailConfigured(): boolean {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS && (process.env.MAIL_TO || process.env.OWNER_EMAIL));
}

export async function sendOwnerEmail(subject: string, html: string, text: string): Promise<{ ok: boolean; error?: string }> {
  if (!mailConfigured()) return { ok: false, error: "SMTP_USER / SMTP_PASS / MAIL_TO not set" };
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: Number(process.env.SMTP_PORT || 465) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: process.env.MAIL_TO || process.env.OWNER_EMAIL,
      subject,
      text,
      html,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
