import { Link } from "react-router";
import Timeline, {
  experienceToTimeline,
  projectsToTimeline,
  sortTimeline,
} from "../../../../components/accessories/Timeline/Timeline";
import { useContextHook } from "../../../../components/accessories/context/Context";

const ExperienceSection = () => {
  const { experience, projects } = useContextHook();
  const items = sortTimeline([
    ...experienceToTimeline(experience),
    ...projectsToTimeline(projects),
  ]);
  if (!items.length) return null;

  return (
    <section id="experience" className="space-y-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold tracking-tight">Timeline</h2>
        <Link
          to="/experience"
          className="text-xs font-medium text-primary hover:underline"
        >
          View more
        </Link>
      </div>
      <Timeline items={items} />
    </section>
  );
};

export default ExperienceSection;
