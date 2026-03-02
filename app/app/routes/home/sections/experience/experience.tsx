import { Link } from "react-router";
import ExperienceItem from "../../../../components/accessories/ExperienceItem";
import { useContextHook } from "../../../../components/accessories/context/Context";

const ExperienceSection = () => {
  const { experience } = useContextHook();
  if (!experience.length) return null;

  return (
    <section id="experience" className="space-y-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold tracking-tight">Experience</h2>
        <Link
          to="/experience"
          className="text-xs font-medium text-primary hover:underline"
        >
          View more
        </Link>
      </div>
      <div className="space-y-6 border-l border-border/40 pl-4 sm:pl-6">
        {experience.map((entry) => (
          <ExperienceItem to={`/experience/${entry.id}`} key={entry.id} entry={entry} />
        ))}
      </div>
    </section>
  );
};

export default ExperienceSection;

