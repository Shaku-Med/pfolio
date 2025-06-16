'use client'

import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Calendar, Users, Activity, TrendingUp, Eye, MessageCircle, Clock, FileText } from 'lucide-react'
import ProjectGallery from './ProjectGallery'
import { useState } from 'react'

interface ProjectFile {
  customName?: string
  fileType?: string
}

interface Project {
  id: string
  title: string
  description: string
  date: string
  programmingLanguages: string[]
  thumbnail?: {
    url: string
    totalChunks: number
  }
  sourceCodeLinks?: {
    id: string
    url: string
    label: string
  }[]
  previewLinks?: {
    id: string
    url: string
    label: string
  }[]
  status: 'completed' | 'in-progress' | 'on-hold'
  featured: boolean
  user_id: string
  team: string[]
  priority: string
  category: string
  technologies: string[]
  view: number
  comments: number
  created_at: string
  updated_at?: string
  duration: string
  teamSize: number
  clientName: string
  team_links?: string[]
  project_files?: ProjectFile[]
  timeline_events?: { title: string; date: string }[]
}

interface ProjectMetricsProps {
  project: Project
}

export function ProjectMetrics({ project }: ProjectMetricsProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState<number | null>(null)
  const getProgressValue = (status: string) => {
    switch (status) {
      case 'completed': return 100
      case 'in-progress': return 65
      case 'on-hold': return 30
      default: return 0
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const progressValue = getProgressValue(project.status)

  return (
    <div className="space-y-6">
      <Card className="bg-card/10 backdrop-blur-lg rounded-3xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
            <BarChart className="h-5 w-5 sm:h-6 sm:w-6" />
            Project Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-base font-semibold">Progress</span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">{progressValue}%</span>
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <Progress value={progressValue} className="h-3" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-card/10 backdrop-blur-lg rounded-3xl">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Eye className="h-4 w-4" />
                  <div className="text-2xl font-bold">{project.view.toLocaleString()}</div>
                </div>
                <div className="text-sm text-muted-foreground">Views</div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/10 backdrop-blur-lg rounded-3xl">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <MessageCircle className="h-4 w-4" />
                  <div className="text-2xl font-bold">{project.comments}</div>
                </div>
                <div className="text-sm text-muted-foreground">Comments</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/10 backdrop-blur-lg rounded-3xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
            <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {project.timeline_events?.map((event, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium">{event.title}</div>
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(event.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            </div>
          ))}
          
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Duration</span>
            </div>
            <Badge variant="secondary">
              {project.duration}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/10 backdrop-blur-lg rounded-3xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
            <Users className="h-5 w-5 sm:h-6 sm:w-6" />
            Team & Links
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <span className="text-sm font-medium">Team Size</span>
            <Badge variant="secondary">
              {project.teamSize}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <span className="text-sm font-medium">Client</span>
            <span className="text-sm font-semibold capitalize">
              {project.clientName}
            </span>
          </div>
          
          {project.team_links && project.team_links.length > 0 && (
            <div className="space-y-3">
              <span className="text-sm font-medium">Team Links</span>
              <div className="space-y-2">
                {project.team_links.map((link: string, index: number) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <span className="text-sm text-primary hover:underline truncate">
                      {link}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {project.project_files && project.project_files.length > 0 && (
        <>
          <Card className="bg-card/10 backdrop-blur-lg rounded-3xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
                <Activity className="h-5 w-5 sm:h-6 sm:w-6" />
                Project Gallery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.project_files.map((file: ProjectFile, index: number) => (
                <div key={index} className="flex hover:scale-102 cursor-pointer transition-all duration-300 items-center justify-between p-3 rounded-lg border" onClick={() => setIsGalleryOpen(index)}>
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm font-medium line-clamp-1">
                      {file.customName || `File ${index + 1}`}
                    </span>
                  </div>
                  <Badge variant="outline">
                    {file.fileType?.split('/')[0] || 'File'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
          {
            isGalleryOpen !== null && (
              <ProjectGallery setIsGalleryOpen={setIsGalleryOpen} isGalleryOpen={isGalleryOpen} project={project}/>
            )
          }
        </>
      )}
    </div>
  )
}