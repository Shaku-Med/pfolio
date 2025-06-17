import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Github } from "lucide-react"
import { Project } from '@/app/admin/projects/page'
import NonHls from '@/app/contact/[id]/Body/components/FileHandler/NoNHls/NonHls'
import Link from 'next/link'

interface ProjectsProps {
  projects?: Project[]
  isInView: boolean
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.getFullYear().toString();
}

export const Projects: React.FC<ProjectsProps> = ({ projects, isInView }) => {
if(!projects) return null;
if(projects.length < 1) return null;

  const [expandedProjects, setExpandedProjects] = useState<{ [key: string]: boolean }>({});

  const toggleDescription = (projectId: string) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  const truncateDescription = (description: string, maxLength: number = 150) => {
    if (description.length <= maxLength) return description;
    return description.slice(0, maxLength) + '...';
  };

  return (
    <motion.section 
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0 }
      }}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="mb-8 sm:mb-16"
    >


      <h2 className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-12 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        Featured Projects
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {projects?.filter(p => p.featured).map((project, index) => (
          <motion.div
          key={project.title}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: index * 0.2 }}
          whileHover={{ 
              y: -10, 
              boxShadow: "0 30px 60px rgba(0,0,0,0.2)",
              scale: 1.02
            }}
            className="bg-card/10 relative overflow-hidden backdrop-blur-sm p-4 sm:p-8 rounded-xl shadow-lg border border-border/50 hover:border-primary/50 transition-all duration-300 group"
            >
            <div className='absolute h-full w-full top-0 left-0 z-[-1]'>
                <div className='bg-gradient-to-b from-background/95 to-background/90 absolute h-full w-full top-0 left-0 z-[1] backdrop-blur-md' />
                <>
                    <NonHls 
                    key={index}
                    message={{
                        file_object: {
                        url: project?.thumbnail?.url || '',
                        type: 'image/png',
                        totalChunks: project?.thumbnail?.totalChunks || 1
                        },
                        chat_id: project.id,
                        user_id: project.user_id,
                    }} 
                    isPreview
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    endpoint={`/api/open/`}
                />
                </>
            </div>
            {project.previewLinks && project.previewLinks.length > 0 ? (
              <Link 
                href={`/projects/${project.id}`}
                className="block"
              >
                <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4">
                      <h3 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {project.title}
                      </h3>
                      <span className="text-xs sm:text-sm text-primary bg-primary/10 px-3 py-1 rounded-full font-medium self-start sm:self-auto">
                        {formatDate(project.date)}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                      {expandedProjects[project.id] 
                        ? project?.description.split('\n').map((line, index) => (
                            <React.Fragment key={index}>
                              {line}
                              <br />
                            </React.Fragment>
                          ))
                        : truncateDescription(project?.description, 200).split('\n').map((line, index) => (
                            <React.Fragment key={index}>
                              {line}
                              <br />
                            </React.Fragment>
                          ))
                      }
                      {project?.description.length > 200 && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleDescription(project.id);
                          }}
                          className="text-primary hover:text-primary/80 font-medium mt-2 inline-block"
                        >
                          {expandedProjects[project.id] ? 'Show Less' : 'Read More'}
                        </button>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                      {project.programmingLanguages?.slice(0, 4).map((tech) => (
                        <motion.span
                          key={tech}
                          whileHover={{ scale: 1.1, y: -2 }}
                          className="px-3 sm:px-4 py-1 sm:py-2 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-medium hover:bg-primary/20 transition-colors duration-300"
                        >
                          {tech}
                        </motion.span>
                      ))}
                      {project.programmingLanguages?.length > 4 && (
                        <motion.span className="px-3 sm:px-4 py-1 sm:py-2 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-medium hover:bg-primary/20 transition-colors duration-300">
                          +{project.programmingLanguages?.length - 4}
                        </motion.span>
                      )}
                    </div>
                </div>
              </Link>
            ) : (
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4">
                  <h3 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {project.title}
                  </h3>
                  <span className="text-xs sm:text-sm text-primary bg-primary/10 px-3 py-1 rounded-full font-medium self-start sm:self-auto">
                    {formatDate(project.date)}
                  </span>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                  {expandedProjects[project.id] 
                    ? project?.description.split('\n').map((line, index) => (
                        <React.Fragment key={index}>
                          {line}
                          <br />
                        </React.Fragment>
                      ))
                    : truncateDescription(project?.description).split('\n').map((line, index) => (
                        <React.Fragment key={index}>
                          {line}
                          <br />
                        </React.Fragment>
                      ))
                  }
                  {project?.description.length > 150 && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleDescription(project.id);
                      }}
                      className="text-primary hover:text-primary/80 font-medium mt-2 inline-block"
                    >
                      {expandedProjects[project.id] ? 'Show Less' : 'Read More'}
                    </button>
                  )}
                </p>
                <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                  {project.programmingLanguages?.slice(0, 4).map((tech) => (
                    <motion.span
                      key={tech}
                      whileHover={{ scale: 1.1, y: -2 }}
                      className="px-3 sm:px-4 py-1 sm:py-2 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-medium hover:bg-primary/20 transition-colors duration-300"
                    >
                      {tech}
                    </motion.span>
                  ))}
                  {project.programmingLanguages?.length > 4 && (
                    <motion.span className="px-3 sm:px-4 py-1 sm:py-2 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-medium hover:bg-primary/20 transition-colors duration-300">
                      +{project.programmingLanguages?.length - 4}
                    </motion.span>
                  )}
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-3 sm:gap-4">
              {project.previewLinks && project.previewLinks.length > 0 && (
                <motion.a
                  href={project.previewLinks[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-300 text-sm sm:text-base"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-4 h-4" />
                  Live Demo
                </motion.a>
              )}
              {project.sourceCodeLinks && project.sourceCodeLinks.length > 0 && (
                <motion.a
                  href={project.sourceCodeLinks[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors duration-300 text-sm sm:text-base"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Github className="w-4 h-4" />
                  View Code
                </motion.a>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
} 