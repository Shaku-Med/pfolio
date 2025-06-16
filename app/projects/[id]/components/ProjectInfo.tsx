'use client'

import { Badge } from '@/components/ui/badge'
import { Calendar, DollarSign, Clock, Target, TrendingUp, BookOpen, Lightbulb, Zap, Monitor, Code } from 'lucide-react'
import MDEditor from '@uiw/react-md-editor'
import DOMPurify from 'dompurify'
import { useLayoutEffect, useState } from 'react'

interface ProjectInfoProps {
  project: any
}

export function ProjectInfo({ project }: ProjectInfoProps) {
  const [sanitizedDescription, setSanitizedDescription] = useState('')

  useLayoutEffect(() => {
    setSanitizedDescription(project.longDescription ? DOMPurify.sanitize(project.longDescription) : '')
  }, [project.longDescription])

  return (
    <div className="relative space-y-8">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 right-20 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-gradient-to-br from-chart-2/10 to-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"></div>
      </div>

      {/* Project Overview Section */}
      <div className="relative backdrop-blur-xl border bg-card/10 rounded-3xl py-8 px-4 hover:shadow-2xl transition-all duration-300">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-2xl border">
            <Calendar className="h-5 w-5 lg:h-6 lg:w-6" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold ">
            Project Overview
          </h2>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Budget & Duration */}
          <div className="space-y-6">
            <div className="group">
              <div className="flex items-center gap-4 p-4 rounded-2xl border">
                <div className="p-2 rounded-xl">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-foreground/60 font-medium">Budget</p>
                  <p className="text-xl font-bold">{project.budget}</p>
                </div>
              </div>
            </div>
            
            <div className="group">
              <div className="flex items-center gap-4 p-4 rounded-2xl border">
                <div className="p-2 rounded-xl">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-foreground/60 font-medium">Duration</p>
                  <p className="text-xl font-bold">{project.duration}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Platforms */}
          <div className="space-y-4 border rounded-2xl px-2 py-4">
            <div className="flex items-center border-b py-2 gap-3 mb-4">
              <div className="p-2 rounded-xl">
                <Monitor className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">Platforms</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {project.platforms.map((platform: string, index: number) => (
                <Badge 
                  key={index} 
                  className=""
                >
                  {platform}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Frameworks */}
          <div className="space-y-4 border rounded-2xl px-2 py-4">
            <div className="flex items-center border-b py-2 gap-3 mb-4">
              <div className="p-2 rounded-xl">
                <Code className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">Frameworks</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {project.frameworks.map((framework: string, index: number) => (
                <Badge 
                  key={index} 
                  className=""
                >
                  {framework}
                </Badge>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Insights Grid */}
      {(project.achievements || project.challenges || project.learnings || project.futureImprovements) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Achievements */}
          {project.achievements && (
            <div className="group relative">
              <div className="absolute h-full inset-0 bg-gradient-to-br from-chart-2/20 to-emerald-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative h-full backdrop-blur-xl bg-gradient-to-br from-chart-2/10 via-emerald-500/5 to-transparent border border-green-400/20 rounded-3xl p-6 shadow-xl hover:border-green-400/40 transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-chart-2/30 to-emerald-500/30 border border-green-400/30">
                    <Target className="h-5 w-5 text-chart-2" />
                  </div>
                  <h3 className="text-xl font-bold text-chart-2">Achievements</h3>
                </div>
                <p className="text-foreground/80 leading-relaxed">
                  {
                    project.achievements?.split('\n').map((line: string, index: number) => (
                      <p key={index}>{line} <br /></p>
                    ))
                  }
                </p>
              </div>
            </div>
          )}
          
          {/* Challenges */}
          {project.challenges && (
            <div className="group relative">
              <div className="absolute h-full inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative h-full backdrop-blur-xl bg-gradient-to-br from-orange-500/10 via-red-500/5 to-transparent border border-orange-400/20 rounded-3xl p-6 shadow-xl hover:border-orange-400/40 transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-300/30 to-red-300/30 border border-orange-400/30">
                    <TrendingUp className="h-5 w-5 text-orange-400" />
                  </div>
                  <h3 className="text-xl font-bold text-orange-400">Challenges</h3>
                </div>
                <p className="text-foreground/80 leading-relaxed">
                  {
                    project.challenges?.split('\n').map((line: string, index: number) => (
                      <p key={index}>{line} <br /></p>
                    ))
                  }
                </p>
              </div>
            </div>
          )}
          
          {/* Key Learnings */}
          {project.learnings && (
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative h-full backdrop-blur-xl bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent border border-blue-400/20 rounded-3xl p-6 shadow-xl hover:border-blue-400/40 transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-300/30 to-cyan-300/30 border border-blue-400/30">
                    <BookOpen className="h-5 w-5 text-blue-300" />
                  </div>
                  <h3 className="text-xl font-bold text-blue-300">Key Learnings</h3>
                </div>
                <p className="text-foreground/80 leading-relaxed">
                  {project.learnings}
                </p>
              </div>
            </div>
          )}
          
          {/* Future Improvements */}
          {project.futureImprovements && (
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative h-full backdrop-blur-xl bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent border border-purple-400/20 rounded-3xl p-6 shadow-xl hover:border-purple-400/40 transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-300/30 to-pink-300/30 border border-purple-400/30">
                    <Lightbulb className="h-5 w-5 text-purple-300" />
                  </div>
                  <h3 className="text-xl font-bold text-purple-300">Future Improvements</h3>
                </div>
                <p className="text-foreground/80 leading-relaxed">
                  {project.futureImprovements}
                </p>
              </div>
            </div>
          )}
          
        </div>
      )}

              
        {/* Long Description */}
        {project.longDescription && (
          <div className="pt-6 border-t border-foreground/10">
            <div data-color-mode="dark">
              <MDEditor.Markdown
                source={sanitizedDescription} 
                className="!bg-transparent"
              />
            </div>
          </div>
        )}
    </div>
  )
}