import "server-only";

import nodemailer, { type Transporter } from "nodemailer";

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

let transporter: Transporter | null | undefined;

function getTransporter(): Transporter | null {
  if (transporter !== undefined) return transporter;

  const host = process.env.SMTP_HOST;
  if (!host) {
    transporter = null;
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
  });
  return transporter;
}

/**
 * Sends an email via SMTP when credentials are configured; otherwise logs
 * the message so the notification flow is still observable in development.
 * Never throws - a failed/unsent email must not fail the calling request.
 */
export async function sendMail(message: MailMessage): Promise<void> {
  const from = process.env.SMTP_FROM ?? "ERM Platform <no-reply@erm.local>";
  const client = getTransporter();

  if (!client) {
    console.log(
      `[mail:dev] To: ${message.to} | Subject: ${message.subject}\n${message.text}`,
    );
    return;
  }

  try {
    await client.sendMail({ from, to: message.to, subject: message.subject, html: message.html, text: message.text });
  } catch (error) {
    console.error(`[mail] Failed to send "${message.subject}" to ${message.to}:`, error);
  }
}
