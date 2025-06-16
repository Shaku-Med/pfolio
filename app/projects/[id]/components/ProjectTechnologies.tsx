'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Code, Layers, Cpu, Sparkles } from 'lucide-react'

interface Project {
  programmingLanguages?: string[]
  frameworks?: string[]
  technologies?: string[]
}

interface ProjectTechnologiesProps {
  project: Project
}

export function ProjectTechnologies({ project }: ProjectTechnologiesProps) {
  const techSections = [
    {
      title: 'Programming Languages',
      icon: Code,
      items: project.programmingLanguages || [],
    },
    {
      title: 'Frameworks',
      icon: Layers,
      items: project.frameworks || [],
    },
    {
      title: 'Technologies',
      icon: Cpu,
      items: project.technologies || [],
    }
  ]

  const totalTech = (project.programmingLanguages?.length || 0) + 
                   (project.frameworks?.length || 0) + 
                   (project.technologies?.length || 0)

  return (
    <Card className="w-full bg-card/10 backdrop-blur-lg rounded-3xl">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
            <Code className="h-5 w-5 sm:h-6 sm:w-6" />
            Tech Stack
          </CardTitle>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">
              {totalTech} Technologies
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {techSections.map((section, index) => {
          const IconComponent = section.icon
          
          if (!section.items || section.items.length === 0) return null
          
          return (
            <div key={index} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg border">
                  <IconComponent className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-semibold">
                  {section.title}
                </h3>
                <Badge variant="secondary" className="ml-auto">
                  {section.items.length}
                </Badge>
              </div>
              
              <div className="flex flex-wrap gap-2 pl-0 sm:pl-9">
                {section.items.map((item: string, itemIndex: number) => (
                  <Badge
                    key={itemIndex}
                    variant="outline"
                    className="text-xs sm:text-sm"
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )
        })}
        
        <div className="border-t pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-card/10 backdrop-blur-lg rounded-3xl">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Code className="h-4 w-4" />
                  <div className="text-2xl font-bold">
                    {project.programmingLanguages?.length || 0}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">Languages</div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/10 backdrop-blur-lg rounded-3xl">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Layers className="h-4 w-4" />
                  <div className="text-2xl font-bold">
                    {project.frameworks?.length || 0}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">Frameworks</div>
              </CardContent>
            </Card>
            
            <Card className="bg-card/10 backdrop-blur-lg rounded-3xl">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Cpu className="h-4 w-4" />
                  <div className="text-2xl font-bold">
                    {project.technologies?.length || 0}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">Technologies</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}