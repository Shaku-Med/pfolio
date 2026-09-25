import ProjectCard from "../../../../components/accessories/ProjectCard";
import { Reveal, SectionHeader } from "../../../../components/accessories/Rail/Rail";
import { useContextHook } from "../../../../components/accessories/context/Context";

const ProjectsSection = () => {
  const { projects } = useContextHook();
  if (!projects.length) return null;

  return (
    <section id="projects" className="space-y-8">
      <SectionHeader
        title="Selected work"
        description="A few projects I'm proud of and still like talking about."
        to="/projects"
      />
      <div className="grid items-stretch gap-5 md:grid-cols-2">
        {projects.map((project, i) => {
          const featured = i === 0 && projects.length % 2 === 1;
          return (
            <Reveal
              key={project.id}
              delay={Math.min(i * 0.07, 0.28)}
              className={featured ? "flex min-w-0 md:col-span-2" : "flex min-w-0"}
            >
              <ProjectCard
                to={`/projects/${project.id}`}
                project={project}
                descriptionClamp
                featured={featured}
              />
            </Reveal>
          );
        })}
      </div>
    </section>
  );
};

export default ProjectsSection;
