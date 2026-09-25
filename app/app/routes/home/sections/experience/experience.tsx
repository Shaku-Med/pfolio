import Timeline, {
  experienceToTimeline,
  projectsToTimeline,
  sortTimeline,
} from "../../../../components/accessories/Timeline/Timeline";
import { SectionHeader } from "../../../../components/accessories/Rail/Rail";
import { useContextHook } from "../../../../components/accessories/context/Context";

const ExperienceSection = () => {
  const { experience, projects } = useContextHook();
  const items = sortTimeline([
    ...experienceToTimeline(experience),
    ...projectsToTimeline(projects),
  ]);
  if (!items.length) return null;

  return (
    <section id="experience" className="space-y-8">
      <SectionHeader
        title="Experience"
        description="The roles and projects that shaped how I work."
        to="/experience"
      />
      <Timeline items={items} />
    </section>
  );
};

export default ExperienceSection;
