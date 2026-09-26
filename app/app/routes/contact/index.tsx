import type { ComponentType } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle,
  Globe,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Send,
} from "lucide-react";
import { Form, useActionData, useNavigation } from "react-router";
import { contact } from "../../lib/contact";
import { PageHeader } from "../../components/accessories/Rail/Rail";
import { Github, Linkedin } from "../../components/ui/brand-icons";
import { buildPageMeta } from "../../lib/seo";
import { clientIp, isSameOrigin, rateLimit } from "../../lib/security/http.server";
import { sendContactEmail } from "../../lib/send-contact-email.server";
import { isValidEmail } from "../../lib/security/validate";

export function meta() {
  return buildPageMeta({
    title: "Contact | Mohamed Amara",
    description: "Hiring, collaborating, or just curious? Send me a message.",
    canonicalPath: "/contact",
    ogImage: "/og/page/contact",
  });
}

const socialIcons: Record<string, ComponentType<{ className?: string }>> = {
  github: Github,
  linkedin: Linkedin,
};

const inputClassName =
  "rounded-xl border border-border/70 bg-background px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:pointer-events-none disabled:opacity-60";

const GENERIC_ERROR =
  "Couldn't send your message right now. Please try again later or email me directly.";

function field(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") return null;

  if (!isSameOrigin(request)) {
    return { success: false, error: GENERIC_ERROR };
  }

  const ip = clientIp(request);
  if (
    !rateLimit(`contact:${ip}`, 3, 10 * 60 * 1000) ||
    !rateLimit("contact:global", 30, 60 * 60 * 1000)
  ) {
    return {
      success: false,
      error: "Too many messages in a short time. Please try again later.",
    };
  }

  const formData = await request.formData();

  // Bots fill the hidden field; pretend it worked so they move on.
  if (field(formData, "_gotcha")) {
    return { success: true };
  }

  const name = field(formData, "name").replace(/[\r\n\t]/g, " ");
  const email = field(formData, "email");
  const message = field(formData, "message");

  if (!name || !email || !message) {
    return { success: false, error: "Please fill in all fields." };
  }
  if (name.length > 100) {
    return { success: false, error: "Name is too long." };
  }
  if (!isValidEmail(email)) {
    return { success: false, error: "That email address doesn't look valid." };
  }
  if (message.length < 10) {
    return { success: false, error: "Message should be at least 10 characters." };
  }
  if (message.length > 4000) {
    return { success: false, error: "Message is too long (4000 characters max)." };
  }

  const result = await sendContactEmail({ name, email, message });
  if (result.ok) return { success: true };
  console.error("Contact email failed:", result.error);
  return { success: false, error: GENERIC_ERROR };
}

export default function ContactIndex() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-5 md:px-6">
      <PageHeader
        title="Get in touch"
        description="Hiring, collaborating, or just curious about something I built? Send a message and it lands straight in my inbox."
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-14">
        <section className="space-y-4" aria-labelledby="contact-form-title">
          <h2
            id="contact-form-title"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight"
          >
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            Send a message
          </h2>

          {actionData?.success && (
            <div
              role="status"
              className="flex items-center gap-3 rounded-xl border border-border bg-muted px-4 py-3 text-sm"
            >
              <CheckCircle className="h-5 w-5 shrink-0 text-primary" />
              <span>Message sent. I'll get back to you soon.</span>
            </div>
          )}

          {actionData && !actionData.success && actionData.error && (
            <div
              role="alert"
              className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{actionData.error}</span>
            </div>
          )}

          <Form
            method="post"
            className="flex flex-col gap-5 rounded-2xl border border-border/70 bg-card/60 p-5 sm:p-6"
            aria-disabled={isSubmitting}
          >
            <input
              type="text"
              name="_gotcha"
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Name</span>
                <input
                  type="text"
                  name="name"
                  required
                  maxLength={100}
                  autoComplete="name"
                  disabled={isSubmitting}
                  placeholder="Your name"
                  className={inputClassName}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Email</span>
                <input
                  type="email"
                  name="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  disabled={isSubmitting}
                  placeholder="you@example.com"
                  className={inputClassName}
                />
              </label>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Message</span>
              <textarea
                name="message"
                required
                minLength={10}
                maxLength={4000}
                rows={6}
                disabled={isSubmitting}
                placeholder="Tell me a little about what you have in mind."
                className={`min-h-[8.75rem] resize-y ${inputClassName}`}
              />
            </label>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Your email is only used to reply to you.
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-70 sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Sending
                  </>
                ) : (
                  <>
                    Send message
                    <Send className="h-3.5 w-3.5" aria-hidden />
                  </>
                )}
              </button>
            </div>
          </Form>
        </section>

        <aside className="space-y-4" aria-label="Other ways to reach me">
          <h2 className="text-sm font-semibold tracking-tight">Or reach me directly</h2>
          <div className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70 bg-card/60">
            <a
              href={`mailto:${contact.email}`}
              className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/60"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                <Mail className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-xs text-muted-foreground">Email</span>
                <span className="block truncate text-sm font-medium">{contact.email}</span>
              </span>
            </a>
            {contact.phone && (
              <a
                href={`tel:${contact.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/60"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Phone className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs text-muted-foreground">Phone</span>
                  <span className="block text-sm font-medium">{contact.phone}</span>
                </span>
              </a>
            )}
            {contact.links.map((link) => {
              const Icon = socialIcons[link.label.toLowerCase()] ?? Globe;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/60"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-medium">{link.label}</span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              );
            })}
          </div>
        </aside>
      </div>
    </main>
  );
}
