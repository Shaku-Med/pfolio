import { Fragment } from "react";
import { Link } from "react-router";
import { ArrowRight, Mail } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Reveal } from "~/components/accessories/Rail/Rail";
import HeroLogoGlow from "~/components/accessories/HeroLogoGlow/HeroLogoGlow";
import { Github, Linkedin } from "~/components/ui/brand-icons";
import { contact } from "~/lib/contact";

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const stats = [
  { label: "Experience", value: "2+ years" },
  { label: "Projects", value: "5+ shipped" },
  { label: "Focus", value: "Full stack SWE" },
];

const stacks = ["React", "TypeScript", "Node", "Go", "Python", "Rust", "C++", "Java", "Kotlin"];

const snapshot = [
  { label: "Specialties", value: "Whole apps, from database to deploy" },
  { label: "Currently", value: "Heads down on new side projects" },
  { label: "Location", value: "US and remote" },
];

const socialIcons = { github: Github, linkedin: Linkedin } as const;

const StatRail = () => {
  const reduce = useReducedMotion();
  const railPath = "M0 6 C 15 4.5, 30 7.5, 50 6 S 85 4.5, 100 6";
  return (
    <div className="relative">
      <svg
        aria-hidden
        className="absolute inset-x-0 top-0 h-3 w-full"
        viewBox="0 0 100 12"
        preserveAspectRatio="none"
        fill="none"
      >
        <path d={railPath} stroke="var(--border)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <motion.div
        aria-hidden
        className="absolute inset-x-0 top-0 h-3"
        initial={reduce ? false : { clipPath: "inset(0 100% 0 0)" }}
        animate={reduce ? undefined : { clipPath: "inset(0 0% 0 0)" }}
        transition={{ duration: 1.4, delay: 0.5, ease: EASE }}
      >
        <svg className="h-full w-full" viewBox="0 0 100 12" preserveAspectRatio="none" fill="none">
          <path
            d={railPath}
            stroke="var(--primary)"
            strokeWidth="1.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </motion.div>
      <dl className="grid grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div key={stat.label} className="relative pt-6">
            <motion.span
              aria-hidden
              className="absolute left-0 top-px h-[0.6875rem] w-[0.6875rem] rounded-full border-2 border-muted-foreground/40 bg-background"
              initial={reduce ? false : { scale: 0 }}
              animate={reduce ? undefined : { scale: 1 }}
              transition={{ duration: 0.35, delay: 0.6 + i * 0.25, ease: EASE }}
            />
            <dt className="text-xs text-muted-foreground">{stat.label}</dt>
            <dd className="mt-0.5 text-sm font-semibold sm:text-base">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

const HeroSection = () => {
  return (
    <section>
      <div className="relative isolate flex min-h-[min(calc(100svh-14rem),35rem)] items-center">
        <HeroLogoGlow />
        <div className="relative z-10 w-full max-w-2xl space-y-8 py-10 lg:max-w-[55%]">
          <div className="space-y-5">
            <Reveal>
              <p className="text-sm text-muted-foreground">Hey, I'm</p>
            </Reveal>
            <Reveal delay={0.06}>
              <h1 className="text-balance text-5xl font-semibold tracking-tighter sm:text-6xl lg:text-7xl">
                Mohamed Amara
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                <span className="text-foreground">Full stack</span> software engineer.
                I build whole products and ship them for real people, from social
                platforms to encryption tools, and I make music on the side. Right now I'm looking for software
                engineering roles and internships.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.18}>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link
                to="/projects"
                className="group inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                View projects
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/resume"
                className="text-sm font-medium underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
              >
                Read my resume
              </Link>
              <div className="flex items-center gap-4 text-muted-foreground">
                {contact.links.map((link) => {
                  const Icon =
                    socialIcons[link.label.toLowerCase() as keyof typeof socialIcons];
                  if (!Icon) return null;
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.label}
                      className="transition-colors hover:text-foreground"
                    >
                      <Icon className="h-[1.125rem] w-[1.125rem]" />
                    </a>
                  );
                })}
                <a
                  href={`mailto:${contact.email}`}
                  aria-label="Email me"
                  className="transition-colors hover:text-foreground"
                >
                  <Mail className="h-[1.125rem] w-[1.125rem]" />
                </a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.24} className="max-w-xl pt-4">
            <StatRail />
          </Reveal>
        </div>
      </div>

      <Reveal delay={0.3}>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-6 border-t border-border/60 pt-8 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {snapshot.map((row) => (
            <div key={row.label} className="space-y-1">
              <dt className="text-xs text-muted-foreground">{row.label}</dt>
              <dd className="font-medium">{row.value}</dd>
            </div>
          ))}
          <div className="space-y-1">
            <dt className="text-xs text-muted-foreground">Stack</dt>
            <dd className="leading-relaxed">
              {stacks.map((stack, i) => (
                <Fragment key={stack}>
                  <Link
                    to={`/tags/${encodeURIComponent(stack)}`}
                    className="font-medium transition-colors hover:text-primary"
                  >
                    {stack}
                  </Link>
                  {i < stacks.length - 1 && <span className="text-muted-foreground">, </span>}
                </Fragment>
              ))}
            </dd>
          </div>
        </dl>
      </Reveal>
    </section>
  );
};

export default HeroSection;
