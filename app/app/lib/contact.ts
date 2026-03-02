/**
 * Contact info for the contact page.
 * Replace with your details; remove optional fields if you don't want them shown.
 * Form submissions are sent via your own backend (Nodemailer) — see .env for SMTP.
 */
export const contact = {
  email: `jujubelt124@gmail.com`,
  phone: undefined as string | undefined,
  /** Optional: LinkedIn, GitHub, Twitter, etc. */
  links: [
    { label: "GitHub", href: "https://github.com/Shaku-Med" },
    { label: "LinkedIn", href: `https://www.linkedin.com/in/mohamed-amara-b84447247/`},
  ] as { label: string; href: string }[],
};
