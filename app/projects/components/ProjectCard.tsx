'use client'

import { Project } from "@/app/admin/projects/page"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { ArrowRight, Code2, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { format } from 'date-fns'
import { AnimatedSection } from "@/components/home/AnimatedSection"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import NonHls from "@/app/contact/[id]/Body/components/FileHandler/NoNHls/NonHls"

interface ProjectCardProps {
  project: Project
  index: number
}

const ProjectCard = ({ project, index }: ProjectCardProps) => {
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

//   
//   const endpoint = '/api/chat/messages/file/nostream/'
//   const baseUrl = project?.thumbnail?.url[0]?.[project?.thumbnail?.url[0]?.length - 1]
//   const imageUrl = `${endpoint}?url=${encodeURIComponent(baseUrl?.split('_')[0] || '')}&id=${project?.user_id}&length=${project?.thumbnail?.totalChunks}&type=image/png`

  return (
    <AnimatedSection delay={index * 150}>
        <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        >
        <Link href={`/projects/${project.id}`} className="block h-full">
            <Card className={`group relative overflow-hidden max-h-150 pt-0 bg-background backdrop-blur-xl border transition-all duration-700 hover:scale-[1.02] hover:shadow-2xl ${
                project.featured ? 'md:col-span-2 lg:col-span-1 ring-2 ring-primary/20' : ''
            }`} 
            >
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute -inset-0.5 bg-primary/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm -z-10"></div>
        
            <div className="h-100 w-full overflow-hidden bg-black">
                    <>
                     <NonHls 
                        key={index}
                        message={{
                            file_object: {
                            url: project.thumbnail?.url || '',
                            type: 'image/png',
                            totalChunks: project.thumbnail?.totalChunks || 1
                            },
                            chat_id: project.id,
                            user_id: project.user_id,
                        }} 
                        isPreview
                        className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                        endpoint={`/api/open/`}
                    />
                    </>
            </div>
            
            <CardHeader>
                <CardTitle className="text-2xl">{project.title}</CardTitle>
                <CardDescription>{format(new Date(project.date), 'MMM d, yyyy')}</CardDescription>
            </CardHeader>
            
            <CardContent>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <p className="mb-6 line-clamp-3 cursor-help">
                                {project.description.slice(0, 100)}...
                            </p>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[300px] p-4 z-[10000000001]">
                            <p className="text-sm">{project.description}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                
                <div className="flex flex-wrap gap-2 mb-6">
                {project.programmingLanguages?.slice(0, 5)?.map((tech: string, idx: number) => (
                    <Badge
                    key={idx}
                    className="px-3 rounded-full text-sm font-medium"
                    >
                    {tech}
                    </Badge>
                ))}
                {
                    project.programmingLanguages.length - 5 > 0 && (
                        <span className="text-sm font-medium">
                            + {project.programmingLanguages.length - 5}
                        </span>
                    )
                }
                </div>
            </CardContent>
            
            <CardFooter className="flex gap-4">
                {project.sourceCodeLinks?.[0]?.url && (
                <Link
                    href={project.sourceCodeLinks[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Code2 className="w-5 h-5 mr-2" />
                    GitHub
                    <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
                )}
                {project.previewLinks?.[0]?.url && (
                <Link
                    href={project.previewLinks[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-green-600 hover:text-green-800 font-medium transition-colors"
                    onClick={(e) => e.stopPropagation()}
                >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Live Demo
                    <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
                )}
            </CardFooter>
            </Card>
        </Link>
        </motion.div>
    </AnimatedSection>
  )
}

export default ProjectCard
