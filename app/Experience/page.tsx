import { getExperience } from '@/app/about/components/GetInfos'
import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  MapPin, 
  Building2, 
  Briefcase, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  User,
  TrendingUp,
  Target,
  Award,
  Timer
} from "lucide-react"
import { format } from 'date-fns'
import Link from 'next/link'

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return format(date, 'MMM yyyy')
}

const calculateDuration = (start: string, end: string) => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  
  const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                 (endDate.getMonth() - startDate.getMonth())
  
  if (months < 12) {
    return `${months} month${months !== 1 ? 's' : ''}`
  } else {
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`
    }
    return `${years}y ${remainingMonths}m`
  }
}

const getExperienceIcon = (title: string, company: string) => {
  const text = `${title} ${company}`.toLowerCase()
  if (text.includes('senior') || text.includes('lead') || text.includes('principal') || text.includes('head')) {
    return <Award className="w-5 h-5 text-yellow-600" />
  } else if (text.includes('manager') || text.includes('director') || text.includes('cto') || text.includes('ceo')) {
    return <Target className="w-5 h-5 text-blue-600" />
  } else if (text.includes('intern') || text.includes('junior') || text.includes('trainee')) {
    return <TrendingUp className="w-5 h-5 text-green-600" />
  }
  return <User className="w-5 h-5 text-primary" />
}

const page = async ({ searchParams }: { searchParams: Promise<{ page?: string }> }) => {
  const { page } = await searchParams
  const currentPage = Number(page) || 1
  const itemsPerPage = 6
  const from = (currentPage - 1) * itemsPerPage
  const to = from + itemsPerPage - 1

  let experience = await getExperience(itemsPerPage, ['id', 'title', 'company', 'location', 'start', 'end', 'is_present'], { from, to })
  
  const totalExperience = experience?.length || 0
  const currentPositions = experience?.filter(exp => exp.is_present).length || 0
  const totalYears = experience?.length ? 
    Math.round(experience.reduce((sum, exp) => {
      const start = new Date(exp.start)
      const end = exp.is_present ? new Date() : new Date(exp.end)
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
      return sum + months
    }, 0) / 12 * 10) / 10 : 0

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-foreground">
            My Professional Experience
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            View my professional journey and career milestones
          </p>
          <div className="w-24 h-1 bg-primary mx-auto mt-4 rounded-full" />
        </div>

        {experience && experience.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 text-center">
                <Briefcase className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-primary">{totalExperience}</p>
                <p className="text-sm text-muted-foreground">Total Positions</p>
              </CardContent>
            </Card>
            
            <Card className="border-green-500/20 bg-green-500/5">
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{currentPositions}</p>
                <p className="text-sm text-muted-foreground">Current Roles</p>
              </CardContent>
            </Card>
            
            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardContent className="p-4 text-center">
                <Timer className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{totalYears}</p>
                <p className="text-sm text-muted-foreground">Years Experience</p>
              </CardContent>
            </Card>
          </div>
        )}

        {!experience || experience.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center mb-8">
              <Briefcase className="w-16 h-16 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-foreground">
              No Experience Added Yet
            </h3>
            <p className="text-muted-foreground mb-8 max-w-md text-lg leading-relaxed">
              Start building your professional journey by adding your work experiences. Each role helps tell your career story.
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link href="/admin/experience/new">
                <Briefcase className="w-5 h-5 mr-2" />
                Add Your First Experience
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {experience.map((exp) => (
                <Link href={`/experience/${exp.id}`} key={exp.id}>
                  <Card className="group bg-card/10 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50 hover:border-primary/30 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {exp.is_present && (
                      <div className="absolute top-4 right-4">
                        <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                          <Clock className="w-3 h-3 mr-1" />
                          Current
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="pb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300">
                          {getExperienceIcon(exp.title, exp.company)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors duration-300 line-clamp-2">
                            {exp.title}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1 text-sm">
                            <Building2 className="w-4 h-4 shrink-0" />
                            <span className="truncate">{exp.company}</span>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 shrink-0" />
                          <span className="truncate">
                            {formatDate(exp.start)} - {exp.is_present ? 'Present' : formatDate(exp.end)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Timer className="w-4 h-4 shrink-0" />
                          <span>
                            {exp.is_present ? 
                              calculateDuration(exp.start, new Date().toISOString()) :
                              calculateDuration(exp.start, exp.end)
                            }
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 shrink-0" />
                          <span className="truncate">{exp.location}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border/50">
                        <p className="text-sm text-muted-foreground/60 text-center line-clamp-3 leading-relaxed">
                          Click Me to Learn More
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
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
                
                <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Page</span>
                  <span className="text-sm font-bold text-primary">
                    {currentPage}
                  </span>
                </div>
                
                {experience.length === itemsPerPage && (
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