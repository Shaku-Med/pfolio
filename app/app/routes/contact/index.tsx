import { Loader2, Mail, MessageSquare, Phone, CheckCircle, AlertCircle } from "lucide-react";
import { Form, useActionData, useNavigation } from "react-router";
import { contact } from "../../lib/contact";
import { buildPageMeta } from "../../lib/seo";

export function meta() {
  return buildPageMeta({
    title: "Contact – Mohamed Amara",
    description: "Get in touch.",
    canonicalPath: "/contact",
  });
}

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/;
const GENERIC_ERROR =
  "Couldn't send your message right now. Please try again later or email me directly.";

function field(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function action({ request }: { request: Request }) {
  if (request.method !== "POST") return null;

  const { rateLimit, clientIp, isSameOrigin } = await import(
    "../../lib/security/http.server"
  );

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
  if (email.length > 254 || !EMAIL_RE.test(email)) {
    return { success: false, error: "That email address doesn't look valid." };
  }
  if (message.length < 10) {
    return { success: false, error: "Message should be at least 10 characters." };
  }
  if (message.length > 4000) {
    return { success: false, error: "Message is too long (4000 characters max)." };
  }

  const { sendContactEmail } = await import("../../lib/send-contact-email.server");
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
    <main className="mx-auto w-full max-w-2xl px-4 py-14 sm:px-5 sm:py-16 md:px-6 md:py-24 xl:max-w-3xl 2xl:max-w-4xl">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Get in touch
        </h1>
        <p className="text-sm text-muted-foreground">
          Have a project in mind or want to say hi? Send a message and I’ll get
          back to you.
        </p>
      </header>

      <div className="mt-10 space-y-10">
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
            <MessageSquare className="h-4 w-4 text-primary/80" />
            Send a message
          </h2>

          {actionData?.success && (
            <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-foreground">
              <CheckCircle className="h-5 w-5 shrink-0 text-primary" />
              <span>Message sent. I’ll get back to you soon.</span>
            </div>
          )}

          {actionData && !actionData.success && actionData.error && (
            <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{actionData.error}</span>
            </div>
          )}

          <Form
            method="post"
            className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-background/80 p-4 sm:p-6"
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
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Name
                </span>
                <input
                  type="text"
                  name="name"
                  required
                  disabled={isSubmitting}
                  placeholder="Your name"
                  className="rounded-lg border border-border/70 bg-background px-3 py-2.5 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 disabled:pointer-events-none disabled:opacity-60"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Email
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  disabled={isSubmitting}
                  placeholder="you@your-domain.com"
                  className="rounded-lg border border-border/70 bg-background px-3 py-2.5 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 disabled:pointer-events-none disabled:opacity-60"
                />
              </label>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Message
              </span>
              <textarea
                name="message"
                required
                rows={5}
                disabled={isSubmitting}
                placeholder="What's on your mind?"
                className="min-h-[120px] resize-y rounded-lg border border-border/70 bg-background px-3 py-2.5 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 disabled:pointer-events-none disabled:opacity-60"
              />
            </label>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-70 sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Sending…
                </>
              ) : (
                "Send message"
              )}
            </button>
          </Form>
        </section>

        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
            <Mail className="h-4 w-4 text-primary/80" />
            Email
          </h2>
          <a
            href={`mailto:${contact.email}`}
            className="block rounded-2xl border border-border/70 bg-background/80 p-4 transition hover:border-primary/40 hover:shadow-sm sm:p-5"
          >
            <span className="text-sm font-medium text-foreground">
              {contact.email}
            </span>
            <p className="mt-1 text-xs text-muted-foreground">
              Click to open your mail client
            </p>
          </a>
        </section>

        {contact.phone ? (
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
              <Phone className="h-4 w-4 text-primary/80" />
              Phone
            </h2>
            <a
              href={`tel:${contact.phone.replace(/\s/g, "")}`}
              className="block rounded-2xl border border-border/70 bg-background/80 p-4 transition hover:border-primary/40 hover:shadow-sm sm:p-5"
            >
              <span className="text-sm font-medium text-foreground">
                {contact.phone}
              </span>
              <p className="mt-1 text-xs text-muted-foreground">
                Click to call
              </p>
            </a>
          </section>
        ) : null}

        {contact.links.length > 0 ? (
          <section className="space-y-4">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Elsewhere
            </h2>
            <div className="flex flex-wrap gap-2">
              {contact.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-border/70 bg-background/80 px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-primary/40 hover:shadow-sm"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
