import { Link } from "react-router";
import { ArrowUp, Github, Globe, Linkedin, Mail, type LucideIcon } from "lucide-react";
import { contact } from "../lib/contact";

const exploreLinks = [
  { label: "Projects", to: "/projects" },
  { label: "Experience", to: "/experience" },
  { label: "Stack", to: "/stack" },
  { label: "Gallery", to: "/gallery" },
];

const moreLinks = [
  { label: "Blog", to: "/blog" },
  { label: "Resume", to: "/resume" },
  { label: "Search", to: "/search" },
  { label: "Settings", to: "/settings" },
];

const socialIcons: Record<string, LucideIcon> = {
  github: Github,
  linkedin: Linkedin,
};

const Footer = () => {
  const year = new Date().getFullYear();

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="border-t border-border/60 bg-background/80">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm space-y-3">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <img
                src="/web/icon-192.png"
                alt=""
                className="h-8 w-8 rounded-lg object-contain"
              />
              <span className="text-sm font-semibold tracking-tight text-foreground">
                Mohamed Amara
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-muted-foreground">
              I build and ship real things. Sometimes I drop a song too.
            </p>
            <div className="flex gap-2 pt-1">
              <a
                href={`mailto:${contact.email}`}
                aria-label="Email me"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <Mail className="h-3.5 w-3.5" />
              </a>
              {contact.links.map((link) => {
                const Icon = socialIcons[link.label.toLowerCase()] ?? Globe;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-x-16 gap-y-8">
            <nav className="space-y-3" aria-label="Explore">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                Explore
              </p>
              <div className="flex flex-col gap-2">
                {exploreLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>
            <nav className="space-y-3" aria-label="More">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                More
              </p>
              <div className="flex flex-col gap-2">
                {moreLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>
            <nav className="space-y-3" aria-label="Contact">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                Say hi
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  to="/contact"
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  Contact form
                </Link>
                <a
                  href={`mailto:${contact.email}`}
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  {contact.email}
                </a>
              </div>
            </nav>
          </div>
        </div>

        {/* Bottom rail — the line ends here, buffer stop and all. */}
        <div className="relative mt-10">
          <div aria-hidden className="absolute left-0 right-9 top-0 h-3">
            <svg
              className="h-full w-full"
              viewBox="0 0 100 12"
              preserveAspectRatio="none"
              fill="none"
            >
              <path
                d="M0 6 C 25 4.5, 55 7.5, 100 6"
                stroke="var(--border)"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
          <svg
            aria-hidden
            className="absolute right-0 top-0 h-3 w-9"
            viewBox="0 0 36 12"
            fill="none"
          >
            <path d="M0 6 H14" stroke="var(--border)" strokeWidth="1.5" />
            <circle
              cx="20"
              cy="6"
              r="3"
              fill="var(--background)"
              stroke="var(--muted-foreground)"
              strokeOpacity="0.5"
              strokeWidth="1.5"
            />
            <path
              d="M30 1.5 V10.5"
              stroke="var(--muted-foreground)"
              strokeOpacity="0.6"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          <div className="flex flex-col gap-3 pt-8 text-xs text-muted-foreground/80 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p>© {year} Mohamed Amara. All rights reserved.</p>
              <p className="text-[11px] text-muted-foreground/60">
                This site is{" "}
                <a
                  href="https://github.com/Shaku-Med/pfolio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 transition-colors hover:text-foreground"
                >
                  open source
                </a>
                . Fork it and make it yours.
              </p>
            </div>
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border/70 bg-background px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <ArrowUp className="h-3 w-3" />
              Back to top
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
