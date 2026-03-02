import { render } from "@react-email/render";
import type { Transporter } from "nodemailer";
import nodemailer from "nodemailer";
import React from "react";
import { ContactEmail } from "./emails/ContactEmail";

export type ContactFormData = {
  name: string;
  email: string;
  message: string;
};

function getTransporter(): Transporter | null {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port: port ? parseInt(port, 10) : 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });
}

async function buildContactEmailHtml(data: ContactFormData): Promise<string> {
  const html = await render(
    React.createElement(ContactEmail, {
      name: data.name,
      email: data.email,
      message: data.message,
    })
  );
  return html;
}

export async function sendContactEmail(data: ContactFormData): Promise<{ ok: true } | { ok: false; error: string }> {
  const to = process.env.CONTACT_TO_EMAIL || process.env.SMTP_USER;
  if (!to) {
    return { ok: false, error: "CONTACT_TO_EMAIL or SMTP_USER is not set" };
  }

  const transporter = getTransporter();
  if (!transporter) {
    return {
      ok: false,
      error: "SMTP is not configured (SMTP_HOST, SMTP_USER, SMTP_PASS)",
    };
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `Portfolio <${process.env.SMTP_USER}>`,
      to,
      replyTo: data.email,
      subject: `Contact: ${data.name} <${data.email}>`,
      text: `${data.name} (${data.email}):\n\n${data.message}`,
      html: await buildContactEmailHtml(data),
    });
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    return { ok: false, error: message };
  }
}
