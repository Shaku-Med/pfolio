'use client'

import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, CheckCircle, Circle, AlertCircle, Calendar, Zap, TrendingUp } from 'lucide-react'

interface Project {
  title: string
  status: 'completed' | 'in-progress' | 'on-hold'
  duration: string
  created_at: string
  updated_at?: string
  date: string
  timeline_events?: {
    title: string
    date: string
    status: 'completed' | 'in-progress' | 'cancelled'
    description: string
  }[]
}

interface ProjectTimelineProps {
  project: Project
}

export function ProjectTimeline({ project }: ProjectTimelineProps) {
  const timelineEvents = project.timeline_events?.length ? project.timeline_events : [
    {
      title: 'Project Created',
      date: project.created_at,
      status: 'completed',
      description: 'Project was initialized and added to portfolio'
    },
    {
      title: 'Development Started',
      date: project.date,
      status: 'completed',
      description: `Started working on ${project.title}`
    },
    {
      title: 'Current Status',
      date: project.updated_at || project.created_at,
      status: project.status === 'in-progress' ? 'in-progress' : project.status,
      description: `Project is currently ${project.status.replace('-', ' ')}`
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle
      case 'in-progress': return AlertCircle
      case 'cancelled': return Circle
      case 'on-hold': return Circle
      default: return Circle
    }
  }

  const getProgressValue = (status: string) => {
    switch (status) {
      case 'completed': return 100
      case 'in-progress': return 65
      case 'cancelled': return 0
      case 'on-hold': return 30
      default: return 0
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed'
      case 'in-progress': return 'In Progress'
      case 'cancelled': return 'Cancelled'
      case 'on-hold': return 'On Hold'
      default: return 'Unknown'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const StatusIcon = getStatusIcon(project.status)
  const progressValue = getProgressValue(project.status)

  return (
    <Card className="w-full bg-card/10 backdrop-blur-lg rounded-3xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
          <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
          Project Timeline
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <Card className="bg-card/10 backdrop-blur-lg rounded-3xl">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 rounded-lg border">
                  <StatusIcon className="h-6 w-6 sm:h-8 sm:w-8" />
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-bold">
                    {getStatusLabel(project.status)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Duration: {project.duration}
                  </div>
                </div>
              </div>
              <Badge variant="secondary" className="w-fit">
                {progressValue}% Complete
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-lg font-semibold">Overall Progress</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">{progressValue}%</span>
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <Progress value={progressValue} className="h-3" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Timeline Events</h3>
          </div>
          
          <div className="space-y-4">
            {timelineEvents.map((event, index) => {
              const EventIcon = getStatusIcon(event.status)
              const isLast = index === timelineEvents.length - 1
              
              return (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="p-2 rounded-lg border">
                      <EventIcon className="h-4 w-4" />
                    </div>
                    {!isLast && (
                      <div className="w-px h-12 bg-border mt-2"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 pb-4">
                    <Card className="bg-card/10 backdrop-blur-lg rounded-3xl">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                          <h4 className="font-semibold">
                            {event.title}
                          </h4>
                          <Badge variant="outline" className="w-fit text-xs">
                            {formatDate(event.date)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {event.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-card/10 backdrop-blur-lg rounded-3xl">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="h-4 w-4" />
                  <div className="text-xl font-bold">
                    {project.duration}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">Total Duration</div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/10 backdrop-blur-lg rounded-3xl">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Calendar className="h-4 w-4" />
                  <div className="text-xl font-bold">
                    {formatDate(project.created_at)}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">Start Date</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}