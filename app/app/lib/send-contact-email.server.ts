import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import nodemailer, { type Transporter } from "nodemailer";
import { ContactEmail } from "./emails/ContactEmail";

export type ContactFormData = {
  name: string;
  email: string;
  message: string;
};

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (cachedTransporter) return cachedTransporter;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;

  const port = Number(process.env.SMTP_PORT || 587);
  if (!Number.isInteger(port) || port < 1 || port > 65535) return null;

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });
  return cachedTransporter;
}

function buildContactEmailHtml(data: ContactFormData): string {
  return `<!DOCTYPE html>${renderToStaticMarkup(createElement(ContactEmail, data))}`;
}

export async function sendContactEmail(
  data: ContactFormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const to = process.env.CONTACT_TO_EMAIL;
  if (!to) {
    return { ok: false, error: "CONTACT_TO_EMAIL is not set" };
  }

  const transporter = getTransporter();
  if (!transporter) {
    return {
      ok: false,
      error: "SMTP is not configured (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)",
    };
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `Portfolio <${process.env.SMTP_USER}>`,
      to,
      replyTo: data.email,
      subject: `Contact: ${data.name} <${data.email}>`,
      text: `${data.name} (${data.email}):\n\n${data.message}`,
      html: buildContactEmailHtml(data),
    });
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    return { ok: false, error: message };
  }
}
