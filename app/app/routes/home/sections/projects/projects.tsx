import ProjectCard from "../../../../components/accessories/ProjectCard";
import { Reveal, SectionHeader } from "../../../../components/accessories/Rail/Rail";
import { useContextHook } from "../../../../components/accessories/context/Context";

const ProjectsSection = () => {
  const { projects } = useContextHook();
  if (!projects.length) return null;

  return (
    <section id="projects" className="space-y-4">
      <SectionHeader title="Selected work" to="/projects" />
      <div className="grid gap-4 md:grid-cols-3 items-stretch">
        {projects.map((project, i) => (
          <Reveal key={project.id} delay={Math.min(i * 0.07, 0.28)} className="min-w-0 flex">
            <ProjectCard to={`/projects/${project.id}`} project={project} descriptionClamp />
          </Reveal>
        ))}
      </div>
    </section>
  );
};

export default ProjectsSection;
