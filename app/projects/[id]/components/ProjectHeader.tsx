'use client'

import { Project } from '@/app/admin/projects/page'
import NonHls from '@/app/contact/[id]/Body/components/FileHandler/NoNHls/NonHls'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Star, Eye, ExternalLink, Github, Users, Sparkles, Code } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

interface LinkItem {
  url: string;
  label: string;
}

interface ProjectHeaderProps {
  project: Project & {
    category?: string;
    view?: number;
    teamSize?: number;
    clientName?: string;
    tags?: string[];
    previewLinks?: LinkItem[];
    sourceCodeLinks?: LinkItem[];
  }
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30 shadow-emerald-500/20'
      case 'in-progress': return 'bg-blue-500/20 text-blue-300 border-blue-400/30 shadow-blue-500/20'
      case 'on-hold': return 'bg-amber-500/20 text-amber-300 border-amber-400/30 shadow-amber-500/20'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30 shadow-gray-500/20'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-400/30 shadow-red-500/20'
      case 'medium': return 'bg-orange-500/20 text-orange-300 border-orange-400/30 shadow-orange-500/20'
      case 'low': return 'bg-green-500/20 text-green-300 border-green-400/30 shadow-green-500/20'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30 shadow-gray-500/20'
    }
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const renderDescription = () => {
    const lines = project?.description?.split('\n') || []
    const displayLines = isExpanded ? lines : lines.slice(0, Math.ceil(lines.length / 2))
    
    return (
      <>
        {displayLines.map((line: string, index: number) => (
          <p key={index} className="mb-4">
            {line}
          </p>
        ))}
        {lines.length > 2 && (
          <button
            onClick={toggleExpand}
            className="text-blue-500 hover:text-blue-600 transition-colors"
          >
            {isExpanded ? 'Show Less' : 'Read More'}
          </button>
        )}
      </>
    )
  }

  return (
    <div className="relative overflow-hidden w-full">
      {/* Dynamic Background with Project Thumbnail */}
      <div className="absolute inset-0 z-0">
        {project.thumbnail?.url ? (
          <div className="relative w-full h-full">
            <div className="absolute inset-0 scale-110 blur-3xl opacity-30">
              <NonHls 
                message={{
                  file_object: {
                    url: project.thumbnail.url,
                    type: 'image/png',
                    totalChunks: project.thumbnail.totalChunks || 1
                  },
                  chat_id: project.id,
                  user_id: project.user_id,
                }} 
                isPreview
                endpoint={'/api/open/'}
                className='w-full h-full object-cover object-top'
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background/80"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
          </div>
        ) : (
          <div className="w-full h-full ">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%, var(--background),transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%, var(--background),transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%, var(--background),transparent_50%)]"></div>
          </div>
        )}
      </div>

      {/* Floating Particles Effect */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="absolute top-20 left-20 w-2 h-2 bg-foreground/20 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-chart-2/30 rounded-full animate-bounce"></div>
        <div className="absolute bottom-40 left-1/4 w-3 h-3 bg-blue-400/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-foreground/10 rounded-full animate-bounce"></div>
      </div>

      {/* Content */}
      <div className="relative flex items-center justify-center flex-col z-20 px-8 py-16">
        <div className=" container lg:px-10 mx-auto">
          
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-start items-center gap-12 mb-10">
            
            {/* Project Avatar */}
            <div className="relative group">
              <div className=" min-w-100 lg:max-w-120 max-w-full aspect-square rounded-4xl overflow-hidden">
                {project.thumbnail?.url ? (
                  <NonHls 
                    message={{
                      file_object: {
                        url: project.thumbnail.url,
                        type: 'image/png',
                        totalChunks: project.thumbnail.totalChunks || 1
                      },
                      chat_id: project.id,
                      user_id: project.user_id,
                    }} 
                    isPreview
                    endpoint={'/api/open/'}
                    className='w-full h-full lg:object-contain object-cover object-top lg:object-center'
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-chart-2/30 to-chart-2/30 flex items-center justify-center">
                    <div className="text-foreground/70 lg:text-6xl text-4xl font-bold">
                      {project.title.charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Glow Effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-chart-2/30 to-chart-2/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
            </div>

            {/* Project Details */}
            <div className="flex-1 space-y-8">
              
              {/* Featured Badge */}
              {project.featured && (
                <Badge className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm">
                  <Sparkles className="h-4 w-4 " />
                  <span className=" font-medium">Featured Project</span>
                </Badge>
              )}

              {/* Title */}
              <div>
                <h1 className="text-4xl lg:text-7xl font-black bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent mb-6 leading-tight">
                  {project.title}
                </h1>
                <p className="lg:text-xl text-lg text-foreground/70 leading-relaxed max-w-3xl font-light">
                  {renderDescription()}
                </p>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-4">
                <Badge className={`${getStatusColor(project.status)} border backdrop-blur-sm font-medium px-4 py-2 text-sm shadow-lg`}>
                  {project.status.replace('-', ' ').charAt(0).toUpperCase() + project.status.replace('-', ' ').slice(1)}
                </Badge>
                <Badge className={`${getPriorityColor(project.priority)} border backdrop-blur-sm font-medium px-4 py-2 text-sm shadow-lg`}>
                  {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)} Priority
                </Badge>
                <Badge className="bg-foreground/10 text-foreground/90 border-white/20 backdrop-blur-sm font-medium px-4 py-2 text-sm shadow-lg">
                  {project.category?.replace('-', ' ').charAt(0).toUpperCase() + project.category?.replace('-', ' ').slice(1)}
                </Badge>
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-8 text-foreground/60">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-foreground/10 backdrop-blur-sm">
                    <Eye className="h-4 w-4" />
                  </div>
                  <span className="font-medium">{project.view?.toLocaleString() ?? '0'}</span>
                  <span className="text-sm">views</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-foreground/10 backdrop-blur-sm">
                    <Users className="h-4 w-4" />
                  </div>
                  <span className="text-sm">team:</span>
                  <span className="font-medium">{project.teamSize || ''}</span>
                </div>
                <div className="text-sm">
                  <span className="text-foreground/40">Client:</span> <span className="text-foreground/80 font-medium">{project.clientName || ''}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                {project.previewLinks && project.previewLinks.length > 0 && project.previewLinks.map((link: LinkItem, index: number) => (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant={`link`}
                          className="" 
                          asChild
                        >
                          <Link href={link.url} target="_blank">
                            <ExternalLink className="h-5 w-5 mr-2" />
                            {link.label}
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Live Preview</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
                {project.sourceCodeLinks && project.sourceCodeLinks.length > 0 && project.sourceCodeLinks.map((link: LinkItem, index: number) => (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          className="bg-foreground/10 hover:bg-foreground/20 text-foreground border border-white/20 hover:border-white/40 backdrop-blur-sm px-6 py-3 text-base font-medium rounded-xl transition-all duration-300 hover:scale-105 shadow-lg" 
                          asChild
                        >
                          <Link href={link.url} target="_blank">
                            <Code className="h-5 w-5 mr-2" />
                            {link.label}
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Source Code</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          </div>

          {/* Technologies Section */}
          {project.technologies && project.technologies.length > 0 && (
            <div className="backdrop-blur-xl bg-card/10 border rounded-3xl p-8 hover:shadow-2xl transition-all duration-300">
              <h3 className="lg:text-2xl text-xl font-bold text-foreground mb-6">Technologies Used</h3>
              <div className="flex flex-wrap gap-4">
                {project.technologies.map((tag: string, index: number) => (
                  <div className="flex items-center justify-between">
                    <Link 
                      href={`/search/?q=${encodeURIComponent(tag)}`}
                      target="_blank"
                      className="group/badge"
                    >
                      <Badge 
                        className="bg-foreground/10 hover:bg-foreground/20 text-foreground/90 border border-white/20 hover:border-white/40 backdrop-blur-sm px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 hover:scale-105 shadow-lg cursor-pointer"
                      >
                        {tag}
                      </Badge>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}