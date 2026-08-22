import "server-only";
import nodemailer from "nodemailer";
import type { Lead } from "@/lib/database";

/**
 * Lead notifications (docs/05_DATA_MODEL.MD, docs/09_SECURITY_AND_PRIVACY.MD).
 *
 * Sends via any SMTP provider (Gmail, Brevo, Mailgun, a future VPS mail
 * server...) using SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS / SMTP_FROM.
 * When SMTP is not configured, the lead is logged so development still works.
 * Never throws — a failed notification must not block lead storage.
 */
export async function sendLeadNotification(lead: Lead): Promise<void> {
  const host = process.env.SMTP_HOST;
  const from = process.env.SMTP_FROM;
  // SMTP_TO is optional; fall back to SMTP_FROM when unset or blank.
  const to = (process.env.SMTP_TO ?? "").trim() || from;

  if (!host || !from) {
    console.log(
      `[email:not-configured] New lead — ${lead.name} (${lead.email}), phone ${lead.phone ?? "-"}, ${lead.company}. Service: ${lead.service ?? "-"}. Message: ${lead.message.slice(0, 160)}`,
    );
    return;
  }

  try {
    const port = Number(process.env.SMTP_PORT ?? 587);
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS ?? "" }
        : undefined,
    });

    await transporter.sendMail({
      from,
      to,
      subject: `New lead: ${lead.name} — ${lead.company}`,
      text: [
        `Name: ${lead.name}`,
        `Email: ${lead.email}`,
        `Phone: ${lead.phone ?? "-"}`,
        `Company: ${lead.company}`,
        `Service: ${lead.service ?? "-"}`,
        `Budget: ${lead.budget ?? "-"}`,
        `Timeline: ${lead.timeline ?? "-"}`,
        "",
        `Message:`,
        lead.message,
        "",
        `Status: ${lead.status}`,
      ].join("\n"),
    });
    console.log(`[email] notification sent to ${to}`);
  } catch (error) {
    console.error("[email] failed to send lead notification", error);
  }
}
