import { Link } from "react-router";
import ProjectCard from "../../../../components/accessories/ProjectCard";
import { useContextHook } from "../../../../components/accessories/context/Context";

const ProjectsSection = () => {
  const { projects } = useContextHook();
  if (!projects.length) return null;

  return (
    <section id="projects" className="space-y-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold tracking-tight">Selected work</h2>
        <Link
          to="/projects"
          className="text-xs font-medium text-primary hover:underline"
        >
          View more
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3 items-stretch">
        {projects.map((project) => (
          <div key={project.id} className="min-w-0 flex">
            <ProjectCard to={`/projects/${project.id}`} project={project} descriptionClamp />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProjectsSection;

