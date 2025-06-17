import { getSkills } from '@/app/about/components/GetInfos'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronLeft, 
  ChevronRight, 
  Code2, 
  Zap, 
  Star, 
  Trophy, 
  Target,
  TrendingUp,
  Brain,
  Palette,
  Database,
  Smartphone,
  Cloud,
  BarChart3,
  Lightbulb
} from "lucide-react"
import Link from 'next/link'
import { Progress } from "@/components/ui/progress"

const getSkillIcon = (skillName: string) => {
  const name = skillName.toLowerCase()
  if (name.includes('react') || name.includes('javascript') || name.includes('typescript')) {
    return <Code2 className="w-5 h-5" />
  } else if (name.includes('python') || name.includes('django') || name.includes('node')) {
    return <Zap className="w-5 h-5" />
  } else if (name.includes('design') || name.includes('ui') || name.includes('ux')) {
    return <Palette className="w-5 h-5" />
  } else if (name.includes('database') || name.includes('sql') || name.includes('mongo')) {
    return <Database className="w-5 h-5" />
  } else if (name.includes('mobile') || name.includes('ios') || name.includes('android') || name.includes('flutter')) {
    return <Smartphone className="w-5 h-5" />
  } else if (name.includes('cloud') || name.includes('aws') || name.includes('azure') || name.includes('docker')) {
    return <Cloud className="w-5 h-5" />
  } else if (name.includes('ai') || name.includes('machine') || name.includes('ml') || name.includes('data')) {
    return <Brain className="w-5 h-5" />
  }
  return <Lightbulb className="w-5 h-5" />
}

const getSkillLevel = (level: number) => {
  if (level >= 90) return { 
    label: 'Expert', 
    icon: Trophy, 
    color: 'text-yellow-500', 
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30'
  }
  if (level >= 75) return { 
    label: 'Advanced', 
    icon: Star, 
    color: 'text-blue-500', 
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30'
  }
  if (level >= 50) return { 
    label: 'Intermediate', 
    icon: Target, 
    color: 'text-green-500', 
    bg: 'bg-green-500/10',
    border: 'border-green-500/30'
  }
  return { 
    label: 'Beginner', 
    icon: TrendingUp, 
    color: 'text-orange-500', 
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30'
  }
}

const page = async ({ searchParams }: { searchParams: Promise<{ page?: string }> }) => {
  const { page } = await searchParams
  const currentPage = Number(page) || 1
  const itemsPerPage = 6
  const from = (currentPage - 1) * itemsPerPage
  const to = from + itemsPerPage - 1

  let skills = await getSkills(itemsPerPage, ['id', 'name', 'level', 'color'], { from, to })

  const totalSkills = skills?.length || 0
  const averageLevel = skills?.length ? Math.round(skills.reduce((sum, skill) => sum + skill.level, 0) / skills.length) : 0
  const expertSkills = skills?.filter(skill => skill.level >= 90).length || 0
  const advancedSkills = skills?.filter(skill => skill.level >= 75).length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/3 w-60 h-60 bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-6xl font-bold mb-4 text-destructive">
            Technical Skills
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Here's all the tech I've either mastered or completely broken at least once
          </p>
          <div className="w-24 h-1 bg-primary mx-auto mt-4 rounded-full" />
        </div>

        {skills && skills.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <BarChart3 className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-primary">{totalSkills}</p>
                <p className="text-sm text-muted-foreground">Total Skills</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-500">{averageLevel}%</p>
                <p className="text-sm text-muted-foreground">Average Level</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-500">{expertSkills}</p>
                <p className="text-sm text-muted-foreground">Expert Level</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <Star className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-500">{advancedSkills}</p>
                <p className="text-sm text-muted-foreground">Advanced+</p>
              </CardContent>
            </Card>
          </div>
        )}

        {!skills || skills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Code2 className="w-16 h-16 text-primary/60" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30 rounded-full blur" />
            </div>
            <h3 className="text-2xl font-bold mb-3 bg-primary bg-clip-text text-transparent">
              No Skills Yet
            </h3>
            <p className="text-muted-foreground mb-8 max-w-md text-lg leading-relaxed">
              Your technical skills showcase will appear here. Start adding your expertise to build an impressive portfolio.
            </p>
            <Button asChild size="lg" className="bg-primary hover:from-primary/90 hover:to-accent/90">
              <Link href="/admin/skills/new">
                <Code2 className="w-5 h-5 mr-2" />
                Add Your First Skill
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {skills.map((skill, index) => {
                const skillLevel = getSkillLevel(skill.level)
                const SkillLevelIcon = skillLevel.icon

                return (
                  <Link href={`/skills/${skill.id}`} key={skill.id}>
                    <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-primary/20 backdrop-blur-sm relative overflow-hidden">
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <CardHeader className="pb-4 relative">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm border border-primary/30">
                              {getSkillIcon(skill.name)}
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors duration-300 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                                {skill.name}
                              </CardTitle>
                              <Badge 
                                variant="secondary" 
                                className={`mt-2 ${skillLevel.bg} ${skillLevel.color} ${skillLevel.border} border`}
                              >
                                <SkillLevelIcon className="w-3 h-3 mr-1" />
                                {skillLevel.label}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-background font-bold text-sm shadow-lg group-hover:scale-110 transition-transform duration-300">
                              {skill.level}%
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0 relative">
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Proficiency</span>
                            <span className="font-medium">{skill.level}%</span>
                          </div>
                          
                          <div className="relative">
                            <Progress 
                              value={skill.level} 
                              className="h-3 bg-muted/50"
                            />
                            <div 
                              className="absolute top-0 left-0 h-3 rounded-full transition-all duration-1000 ease-out overflow-hidden"
                              style={{ 
                                width: `${skill.level}%`,
                                backgroundColor: skill.color || '#3b82f6'
                              }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                            </div>
                          </div>
                          
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span className={skill.level >= 25 ? "text-primary font-semibold" : ""}>
                              Novice
                            </span>
                            <span className={skill.level >= 50 ? "text-primary font-semibold" : ""}>
                              Competent
                            </span>
                            <span className={skill.level >= 75 ? "text-primary font-semibold" : ""}>
                              Proficient
                            </span>
                            <span className={skill.level >= 90 ? "text-accent font-semibold" : ""}>
                              Expert
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>

            <div className="flex justify-center items-center gap-4 mt-12">
              <div className="flex items-center gap-2">
                {currentPage > 1 && (
                  <Button asChild variant="outline" size="sm" className="border-primary/30 hover:bg-primary/10">
                    <Link href={`?page=${currentPage - 1}`}>
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Link>
                  </Button>
                )}
                
                <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg backdrop-blur-sm">
                  <span className="text-sm text-muted-foreground">Page</span>
                  <span className="text-sm font-bold bg-primary bg-clip-text text-transparent">
                    {currentPage}
                  </span>
                </div>
                
                {skills.length === itemsPerPage && (
                  <Button asChild variant="outline" size="sm" className="border-primary/30 hover:bg-primary/10">
                    <Link href={`?page=${currentPage + 1}`}>
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default page