import { Link } from "react-router";
import { Separator } from "~/components/ui/separator";
import ImgLoader from "~/lib/utils/Image/ImgLoader";
import { TechTag } from "../../../../lib/tech/TechTag";

const HeroSection = () => {
  const stacks = [
    'React',
    'TypeScript',
    'Node',
    'Go',
    'Python',
    'Rust',
    'C++',
    'Java',
    'Kotlin',
  ]
  return (
    <section className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="space-y-6">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-primary/80">
          Hi there, I'm
        </p>
        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
          Mohamed Amara
        </h1>
        <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
          Full-stack dev focused on AI/ML and network security. I ship real products, from social platforms to encryption tools, and make music on the side.
        </p>
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
        <dl className="mt-4 grid grid-cols-3 gap-4 text-xs sm:text-sm">
          <div>
            <dt className="text-muted-foreground">Experience</dt>
            <dd className="font-semibold">2+ years</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Projects</dt>
            <dd className="font-semibold">5+ shipped</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Focus</dt>
            <dd className="font-semibold">AI/ML & network security</dd>
          </div>
        </dl>
      </div>
      <div className="relative flex min-w-0 flex-col gap-4 rounded-2xl border border-border/70 bg-muted/20 p-4 shadow-sm">
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
              Full-stack apps, from database to deploy
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
        <div className="absolute -bottom-6 right-5 h-16 w-16">
          <ImgLoader
            src={`/web/icon-512.png`}
            alt="Portrait of Mohamed Amara"
            className="h-full w-full rounded-full border-4 border-background object-cover shadow-sm ring-1 ring-border transition-transform duration-300 hover:scale-105"
            imageClassName="object-cover"
            shouldShowPreview={true}
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
