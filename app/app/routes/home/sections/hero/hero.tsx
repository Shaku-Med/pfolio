import { Link } from "react-router";
import { motion, useReducedMotion } from "motion/react";
import { Separator } from "~/components/ui/separator";
import ImgLoader from "~/lib/utils/Image/ImgLoader";
import { Reveal } from "~/components/accessories/Rail/Rail";
import HeroLogoGlow from "~/components/accessories/HeroLogoGlow/HeroLogoGlow";
import { TechTag } from "../../../../lib/tech/TechTag";

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const stats = [
  { label: "Experience", value: "2+ years" },
  { label: "Projects", value: "5+ shipped" },
  { label: "Focus", value: "AI/ML & network security" },
];

/** Hero stats as stations on a rail line that draws itself in. */
const StatRail = () => {
  const reduce = useReducedMotion();
  const railPath = "M0 6 C 15 4.5, 30 7.5, 50 6 S 85 4.5, 100 6";
  return (
    <div className="relative mt-6">
      <svg
        aria-hidden
        className="absolute inset-x-0 top-0 h-3 w-full"
        viewBox="0 0 100 12"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d={railPath}
          stroke="var(--border)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <motion.div
        aria-hidden
        className="absolute inset-x-0 top-0 h-3"
        initial={reduce ? false : { clipPath: "inset(0 100% 0 0)" }}
        animate={reduce ? undefined : { clipPath: "inset(0 0% 0 0)" }}
        transition={{ duration: 1.4, delay: 0.5, ease: EASE }}
      >
        <svg
          className="h-full w-full"
          viewBox="0 0 100 12"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d={railPath}
            stroke="var(--primary)"
            strokeWidth="1.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </motion.div>
      <dl className="grid grid-cols-3 gap-4 text-xs sm:text-sm">
        {stats.map((stat, i) => (
          <div key={stat.label} className="relative pt-6">
            <motion.span
              aria-hidden
              className="absolute left-0 top-px h-[11px] w-[11px] rounded-full border-2 border-muted-foreground/40 bg-background"
              initial={reduce ? false : { scale: 0 }}
              animate={reduce ? undefined : { scale: 1 }}
              transition={{ duration: 0.35, delay: 0.6 + i * 0.25, ease: EASE }}
            />
            <dt className="text-muted-foreground">{stat.label}</dt>
            <dd className="font-semibold">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

const HeroSection = () => {
  const stacks = [
    "React",
    "TypeScript",
    "Node",
    "Go",
    "Python",
    "Rust",
    "C++",
    "Java",
    "Kotlin",
  ];

  return (
    <section className="relative isolate min-h-[640px] md:min-h-[700px] lg:min-h-[min(78vh,760px)]">
      <HeroLogoGlow />
      <div className="relative z-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-primary/80">
              Hi there, I'm
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Mohamed Amara
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
              Full stack dev focused on AI/ML and network security. I ship real
              products, from social platforms to encryption tools, and make music
              on the side.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/projects"
                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
              >
                View projects
              </Link>
              <Link
                to="/resume"
                className="inline-flex items-center justify-center rounded-full border border-border bg-background px-5 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
              >
                My Resume/CV
              </Link>
            </div>
          </Reveal>
          <StatRail />
        </div>
        <Reveal delay={0.15} className="min-w-0">
          <div className="relative mb-8 flex min-w-0 flex-col gap-4 rounded-2xl border border-border/70 bg-muted/20 p-4 pb-12 shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Snapshot
              </p>
              <p className="mt-1 text-sm font-semibold">
                What I work with, at a glance
              </p>
            </div>
            <Separator />
            <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
              <div className="min-w-0 rounded-xl bg-background/80 p-3">
                <p className="text-[11px] text-muted-foreground">Specialties</p>
                <p className="mt-1 font-medium">
                  Whole apps, from database to deploy
                </p>
              </div>
              <div className="min-w-0 rounded-xl bg-background/80 p-3">
                <p className="text-[11px] text-muted-foreground">Stack</p>
                <div className="mt-1 flex min-w-0 flex-wrap gap-1.5">
                  {stacks.map((stack) => (
                    <Link
                      key={stack}
                      to={`/tags/${encodeURIComponent(stack)}`}
                      className="text-sm font-medium"
                    >
                      <TechTag name={stack} />
                    </Link>
                  ))}
                </div>
              </div>
              <div className="min-w-0 rounded-xl bg-background/80 p-3">
                <p className="text-[11px] text-muted-foreground">Currently</p>
                <p className="mt-1 font-medium">
                  Heads down on new side projects
                </p>
              </div>
              <div className="min-w-0 rounded-xl bg-background/80 p-3">
                <p className="text-[11px] text-muted-foreground">Location</p>
                <p className="mt-1 font-medium">Remote · Worldwide (GMT+2)</p>
              </div>
            </div>
            <div className="absolute -bottom-8 right-5 z-20 h-16 w-16">
              <ImgLoader
                src={`/web/icon-512.png`}
                alt="Portrait of Mohamed Amara"
                className="h-full w-full rounded-full border-4 border-background object-cover shadow-sm ring-1 ring-border transition-transform duration-300 hover:scale-105"
                imageClassName="object-cover"
                shouldShowPreview={true}
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default HeroSection;
