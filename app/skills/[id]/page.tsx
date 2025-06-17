import React from 'react'
import { getSkills } from '@/app/about/page'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { 
  Code2, 
  ArrowLeft,
  FileText,
  BarChart3,
  Zap,
  Star,
  Trophy,
  Target,
  Calendar,
  Palette,
  TrendingUp,
  Brain,
  Lightbulb
} from "lucide-react"
import Link from 'next/link'

const getSkillIcon = (skillName: string) => {
  const name = skillName.toLowerCase()
  if (name.includes('react') || name.includes('javascript') || name.includes('typescript')) {
    return <Code2 className="w-6 h-6" />
  } else if (name.includes('python') || name.includes('django')) {
    return <Zap className="w-6 h-6" />
  } else if (name.includes('design') || name.includes('ui') || name.includes('ux')) {
    return <Palette className="w-6 h-6" />
  } else if (name.includes('database') || name.includes('sql')) {
    return <BarChart3 className="w-6 h-6" />
  } else if (name.includes('ai') || name.includes('machine') || name.includes('ml')) {
    return <Brain className="w-6 h-6" />
  }
  return <Lightbulb className="w-6 h-6" />
}

const getSkillLevel = (level: number) => {
  if (level >= 90) return { label: 'Expert', icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' }
  if (level >= 75) return { label: 'Advanced', icon: Star, color: 'text-blue-500', bg: 'bg-blue-500/10' }
  if (level >= 50) return { label: 'Intermediate', icon: Target, color: 'text-green-500', bg: 'bg-green-500/10' }
  return { label: 'Beginner', icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-500/10' }
}

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  try {
    let {id} = await params
    let skills = await getSkills(1, ['id', 'name', 'description', 'level', 'color', 'created_at'], {}, [id])

    if (!skills || skills.length === 0) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
          <div className="relative">
            {/* Floating background elements */}
            <div className="absolute -inset-20 opacity-30">
              <div className="absolute top-0 left-0 w-32 h-32 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-accent/20 rounded-full blur-xl animate-pulse delay-1000" />
            </div>
            
            <Card className="w-full max-w-md text-center relative backdrop-blur-sm border-primary/20 shadow-2xl">
              <CardHeader className="pb-4">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mb-6 relative">
                  <Code2 className="w-10 h-10 text-primary animate-pulse" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 to-accent/30 animate-spin" style={{ animationDuration: '3s' }} />
                </div>
                <CardTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Skill Not Found
                </CardTitle>
                <CardDescription className="text-base">
                  The skill you're looking for doesn't exist or has been removed.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button asChild className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300">
                  <Link href="/admin/skills">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Skills
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full border-primary/30 hover:bg-primary/10">
                  <Link href="/admin/skills/new">
                    <Code2 className="w-4 h-4 mr-2" />
                    Create New Skill
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }

    const skill = skills[0]
    const skillLevel = getSkillLevel(skill.level)
    const SkillLevelIcon = skillLevel.icon

    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl animate-pulse delay-500" />
        </div>

        <div className="container mx-auto py-8 px-4 relative z-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="space-y-4">
              <Button asChild variant="ghost" size="sm" className="mb-2 hover:bg-primary/10 transition-colors">
                <Link href="/skills">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Skills
                </Link>
              </Button>
              <div>
                <h1 className="text-4xl uppercase line-clamp-1 sm:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-2">
                  {skill.name}
                </h1>
                <p className="text-muted-foreground text-lg line-clamp-1">
                  Deep dive into my technical expertise
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Details Card */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="relative overflow-hidden border-primary/20 shadow-xl backdrop-blur-sm">
                {/* Card background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                
                <CardHeader className="pb-6 relative">
                  <div className="flex items-start justify-between">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center backdrop-blur-sm border border-primary/30">
                            {getSkillIcon(skill.name)}
                          </div>
                          <div className="absolute -inset-2 bg-gradient-to-r from-primary/30 to-accent/30 rounded-2xl blur opacity-50 animate-pulse" />
                        </div>
                        <div>
                          <CardTitle className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            {skill.name}
                          </CardTitle>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge variant="secondary" className={`flex items-center gap-2 ${skillLevel.bg} ${skillLevel.color} border-current/20`}>
                              <SkillLevelIcon className="w-4 h-4" />
                              {skillLevel.label}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1 border-primary/30">
                              <BarChart3 className="w-3 h-3" />
                              {skill.level}% Mastery
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-8 relative">
                  {/* Description Section */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      Skill Overview
                    </h3>
                    <Card className="bg-muted/50 border-primary/10">
                      <CardContent className="p-6">
                        <p className="text-muted-foreground leading-relaxed text-base">
                          {skill.description?.split('\n').map((line, index) => (
                            <React.Fragment key={index}>
                              {line}
                              {index < skill.description.split('\n').length - 1 && <br />}
                            </React.Fragment>
                          )) || 'No description available for this skill.'}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Separator className="bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                  {/* Proficiency Section */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      Proficiency Analysis
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium">Current Level</span>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            {skill.level}%
                          </span>
                          <SkillLevelIcon className={`w-6 h-6 ${skillLevel.color}`} />
                        </div>
                      </div>
                      
                      <div className="relative">
                        <Progress 
                          value={skill.level} 
                          className="h-4 bg-muted/50" 
                        />
                        <div 
                          className="absolute top-0 left-0 h-4 rounded-full bg-gradient-to-r from-primary to-accent opacity-80 transition-all duration-1000 ease-out"
                          style={{ width: `${skill.level}%` }}
                        />
                        <div 
                          className="absolute top-0 h-4 w-1 bg-white/80 rounded-full shadow-lg transition-all duration-1000 ease-out"
                          style={{ left: `calc(${skill.level}% - 2px)` }}
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground mt-2">
                        <div className={`text-center ${skill.level >= 25 ? 'text-primary font-semibold' : ''}`}>
                          Novice
                        </div>
                        <div className={`text-center ${skill.level >= 50 ? 'text-primary font-semibold' : ''}`}>
                          Competent
                        </div>
                        <div className={`text-center ${skill.level >= 75 ? 'text-primary font-semibold' : ''}`}>
                          Proficient
                        </div>
                        <div className={`text-center ${skill.level >= 90 ? 'text-accent font-semibold' : ''}`}>
                          Expert
                        </div>
                      </div>
                    </div>

                    {/* Skill insights */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                      <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
                        <CardContent className="p-4 text-center">
                          <Target className="w-8 h-8 text-green-500 mx-auto mb-2" />
                          <p className="text-sm font-medium text-green-600">Strengths</p>
                          <p className="text-xs text-green-600/80 mt-1">
                            {skill.level >= 75 ? 'Advanced Knowledge' : skill.level >= 50 ? 'Good Foundation' : 'Learning Progress'}
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
                        <CardContent className="p-4 text-center">
                          <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                          <p className="text-sm font-medium text-blue-600">Growth</p>
                          <p className="text-xs text-blue-600/80 mt-1">
                            {100 - skill.level}% to Master
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
                        <CardContent className="p-4 text-center">
                          <Zap className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                          <p className="text-sm font-medium text-purple-600">Impact</p>
                          <p className="text-xs text-purple-600/80 mt-1">
                            {skill.level >= 80 ? 'High Impact' : skill.level >= 50 ? 'Medium Impact' : 'Growing Impact'}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Skill Metadata Card */}
              <Card className="border-primary/20 shadow-lg backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Code2 className="w-4 h-4" />
                    </div>
                    Skill Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Created Date
                    </p>
                    <p className="font-semibold text-lg">
                      {new Date(skill.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Theme Color
                    </p>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div 
                        className={`w-8 h-8 rounded-full shadow-lg border-2 border-white/20 ${skill?.color || `bg-primary`}`}
                      />
                      <div>
                        <p className="font-semibold text-sm">
                          {skill.color || 'bg-primary'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Primary Theme
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="relative">
          {/* Error state background elements */}
          <div className="absolute -inset-20 opacity-30">
            <div className="absolute top-0 left-0 w-32 h-32 bg-red-500/20 rounded-full blur-xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-orange-500/20 rounded-full blur-xl animate-pulse delay-1000" />
          </div>
          
          <Card className="w-full max-w-md text-center relative backdrop-blur-sm border-red-200 shadow-2xl">
            <CardHeader className="pb-4">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center mb-6 relative">
                <Code2 className="w-10 h-10 text-red-500 animate-pulse" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500/30 to-orange-500/30 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              <CardTitle className="text-2xl bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                Something Went Wrong
              </CardTitle>
              <CardDescription className="text-base">
                We encountered an error while loading the skill details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                <Link href="/admin/skills">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Skills
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
}

export default page