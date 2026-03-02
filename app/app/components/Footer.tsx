import { Link } from "react-router";
import { Github, Mail, Linkedin, ArrowUp } from "lucide-react";

const Footer = () => {
  const year = new Date().getFullYear();

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="border-t border-border/60 bg-background/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 text-xs text-muted-foreground sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80">
              Mohamed Amara
            </p>
            <p className="max-w-md text-[11px] leading-relaxed text-muted-foreground">
              Shipping thoughtful, maintainable software with React, TypeScript, and a focus on systems that stay reliable in production.
            </p>
          </div>

          <div className="flex flex-wrap gap-8 text-[11px]">
            <div className="space-y-2 min-w-[120px]">
              <p className="font-semibold uppercase tracking-[0.18em] text-muted-foreground/80">
                Navigate
              </p>
              <nav className="flex flex-col gap-1">
                <Link to="/projects" className="hover:text-foreground">
                  Projects
                </Link>
                <Link to="/experience" className="hover:text-foreground">
                  Experience
                </Link>
                <Link to="/stack" className="hover:text-foreground">
                  Stack
                </Link>
                <Link to="/blog" className="hover:text-foreground">
                  Blogs
                </Link>
                <Link to="/gallery" className="hover:text-foreground">
                  Gallery
                </Link>
                <Link to="/contact" className="hover:text-foreground">
                  Contact
                </Link>
                <Link to="/settings" className="hover:text-foreground">
                  Settings
                </Link>
              </nav>
            </div>

            <div className="space-y-2 min-w-[140px]">
              <p className="font-semibold uppercase tracking-[0.18em] text-muted-foreground/80">
                Contact
              </p>
              <div className="flex flex-col gap-1">
                <a
                  href="mailto:contact@amara.so"
                  className="inline-flex items-center gap-1 hover:text-foreground"
                >
                  <Mail className="h-3 w-3" />
                  <span>Email</span>
                </a>
                <a
                  href="https://github.com/amara"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-foreground"
                >
                  <Github className="h-3 w-3" />
                  <span>GitHub</span>
                </a>
                <a
                  href="https://www.linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-foreground"
                >
                  <Linkedin className="h-3 w-3" />
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border/50 pt-4 text-[11px] text-muted-foreground/80 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p>© {year} Amara. All rights reserved.</p>
            <p className="text-[10px] text-muted-foreground/70">
              Built with Remix, React, TypeScript, and a lot of small, careful iterations.
            </p>
          </div>
          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted"
          >
            <ArrowUp className="h-3 w-3" />
            <span>Back to top</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

