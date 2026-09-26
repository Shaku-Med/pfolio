import { Link } from "react-router";
import { ArrowUp, ArrowUpRight } from "lucide-react";
import { contact } from "../lib/contact";

const columns = [
  {
    title: "Explore",
    links: [
      { label: "Projects", to: "/projects" },
      { label: "Experience", to: "/experience" },
      { label: "Stack", to: "/stack" },
      { label: "Gallery", to: "/gallery" },
    ],
  },
  {
    title: "More",
    links: [
      { label: "Blog", to: "/blog" },
      { label: "Music", to: "/#music" },
      { label: "Resume", to: "/resume" },
      { label: "Search", to: "/search" },
      { label: "Settings", to: "/settings" },
    ],
  },
];

const linkClassName = "text-sm text-muted-foreground transition-colors hover:text-foreground";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border/60">
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-16 sm:px-5 md:px-6">
        <div className="grid gap-12 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div className="max-w-sm">
            <Link to="/" className="text-lg font-semibold tracking-tight">
              Mohamed Amara
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Software engineer. I build and ship real things, and sometimes I drop a
              song too.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
              {contact.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group inline-flex items-center gap-1 ${linkClassName}`}
                >
                  {link.label}
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              ))}
              <a href={`mailto:${contact.email}`} className={linkClassName}>
                Email
              </a>
              <a href="/rss.xml" className={linkClassName}>
                RSS
              </a>
              <a href="/llms.txt" className={linkClassName}>
                llms.txt
              </a>
            </div>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <p className="text-xs text-muted-foreground/70">{column.title}</p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className={linkClassName}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* The rail ends here, buffer stop and all. */}
        <div className="relative mt-16">
          <div aria-hidden className="absolute left-0 right-9 top-0 h-3">
            <svg className="h-full w-full" viewBox="0 0 100 12" preserveAspectRatio="none" fill="none">
              <path
                d="M0 6 C 25 4.5, 55 7.5, 100 6"
                stroke="var(--border)"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
          <svg aria-hidden className="absolute right-0 top-0 h-3 w-9" viewBox="0 0 36 12" fill="none">
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

          <div className="flex flex-col gap-4 pt-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} Mohamed Amara. This site is{" "}
              <a
                href="https://github.com/Shaku-Med/pfolio"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground"
              >
                open source
              </a>
              , so fork it and make it yours.
            </p>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="group inline-flex w-fit items-center gap-1.5 transition-colors hover:text-foreground"
            >
              Back to top
              <ArrowUp className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
