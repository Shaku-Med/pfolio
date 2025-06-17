import React from 'react'
import { getExperience } from '@/app/about/components/GetInfos'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Building2, 
  Calendar, 
  MapPin, 
  Briefcase, 
  Edit, 
  Trash2, 
  Clock,
  ArrowLeft,
  CheckCircle2,
  User,
  FileText
} from "lucide-react"
import { format } from 'date-fns'
import Link from 'next/link'
import DeleteButton from './edit/components/DeleteButton'
import { MarkdownPreview } from '@/app/admin/experience/[id]/edit/components/MarkdownPreview'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  try {
    let {id} = await params
    if(!id) return {}
    // 
    let experience = await getExperience(1, ['id', 'title', 'sub_title', 'company', 'position', 'start', 'end', 'is_present', 'description', 'location', 'type', 'task_completed', 'long_description'], {}, [id])
    if(!experience || experience.length === 0) return {}
    const exp = experience[0]
 
    const cleanDescription = exp.description?.replace(/\n+/g, ' ').trim() || `${exp.position} at ${exp.company} - Professional experience by Mohamed Amara`;
    const startDate = new Date(exp.start).getFullYear();
    const endDate = exp.is_present ? 'Present' : new Date(exp.end).getFullYear();
    const duration = exp.is_present ? `${startDate} - Present` : `${startDate} - ${endDate}`;
    const experienceType = exp.type?.charAt(0).toUpperCase() + exp.type?.slice(1) || 'Experience';
    
    return {
      title: {
        absolute: `${exp.position} at ${exp.company} - Mohamed Amara | Medzy Amara`
      },
      description: `${cleanDescription} (${duration}) - ${exp.location}. ${experienceType} experience showcasing ${exp.sub_title} development skills.`.slice(0, 160),
      keywords: [
        `${exp.position}`,
        `${exp.company}`,
        'Mohamed Amara experience',
        exp.sub_title,
        exp.type,
        'professional experience',
        'software development',
        'tech career',
        exp.location,
        `${exp.company} developer`,
        `${exp.position} experience`,
        'career journey',
        'work experience',
        'professional growth'
      ].filter(Boolean),
      authors: [{ name: 'Mohamed Amara' }],
      creator: 'Mohamed Amara',
      publisher: 'Mohamed Amara',
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      openGraph: {
        title: `${exp.position} at ${exp.company} | Mohamed Amara`,
        description: `${cleanDescription} Professional ${exp.type} experience (${duration}) showcasing expertise in ${exp.sub_title} development.`,
        url: `/experience/${id}`,
        siteName: 'Mohamed Amara - Professional Experience',
        images: [
          {
            url: `/Icons/web/OgImages/og-experience.png`,
            width: 1200,
            height: 630,
            alt: `${exp.position} at ${exp.company} - Mohamed Amara Experience`,
          },
        ],
        locale: 'en_US',
        type: 'profile',
        profile: {
          firstName: 'Mohamed',
          lastName: 'Amara',
          username: 'medzyamara',
        }
      },
      twitter: {
        card: 'summary_large_image',
        title: `${exp.position} at ${exp.company} | Mohamed Amara`,
        description: `${experienceType} experience in ${exp.sub_title} development (${duration}). ${cleanDescription.slice(0, 100)}...`,
        images: [`/Icons/web/OgImages/og-experience.png`],
        creator: '@medzyamara',
        site: '@medzyamara',
      },
      alternates: {
        canonical: `/experience/${id}`,
      },
      category: `${experienceType} Experience`,
      classification: 'Professional Experience',
      other: {
        'profile:first_name': 'Mohamed',
        'profile:last_name': 'Amara',
        'profile:username': 'medzyamara',
        'article:author': 'Mohamed Amara',
        'article:section': 'Experience',
        'job:title': exp.position,
        'job:company': exp.company,
        'job:location': exp.location,
        'job:type': exp.type,
        'job:start_date': exp.start,
        'job:end_date': exp.is_present ? 'present' : exp.end,
        'job:is_current': exp.is_present.toString(),
        'job:duration': duration,
        'job:specialty': exp.sub_title,
        'job:tasks_count': exp.task_completed?.length?.toString() || '0',
      }
    }
  }
  catch {
    return {
      title: {
        absolute: 'Experience - Mohamed Amara | Medzy Amara'
      },
      description: 'Explore Mohamed Amara\'s professional experience in software development, AI, and cybersecurity. Discover roles, projects, and growth in the tech industry.',
      keywords: ['Mohamed Amara experience', 'software developer experience', 'professional experience', 'tech career'],
      openGraph: {
        title: 'Experience - Mohamed Amara | Professional Journey',
        description: 'Learn about Mohamed\'s professional experience and career development in technology.',
        url: '/experience',
        siteName: 'Mohamed Amara Experience',
        type: 'profile',
      },
      twitter: {
        card: 'summary',
        title: 'Experience - Mohamed Amara | Tech Career',
        description: 'Professional experience and career journey in software development.',
        creator: '@medzyamara',
      },
      alternates: {
        canonical: '/experience',
      }
    }
  }
 }

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return format(date, 'MMM yyyy')
}

const calculateDuration = (start: string, end: string | null, isPresent: boolean) => {
  const startDate = new Date(start)
  const endDate = isPresent ? new Date() : new Date(end || '')
  
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
    return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`
  }
}

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  try {
    let {id} = await params
    let experience = await getExperience(1, ['id', 'title', 'sub_title', 'company', 'position', 'start', 'end', 'is_present', 'description', 'location', 'type', 'task_completed', 'long_description'], {}, [id])

    if (!experience || experience.length === 0) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <CardTitle className="text-2xl">Experience Not Found</CardTitle>
              <CardDescription>
                The experience you're looking for doesn't exist or has been removed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full">
                <Link href="/admin/experience">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Experiences
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/experience/new">
                  Create New Experience
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    const exp = experience[0]
    const duration = calculateDuration(exp.start, exp.end, exp.is_present)

    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto py-8 px-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="space-y-2">
              <Button asChild variant="ghost" size="sm" className="mb-2">
                <Link href="/experience">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Experiences
                </Link>
              </Button>
              <h1 className="text-3xl sm:text-4xl font-bold">
                Experience Details
              </h1>
              <p className="text-muted-foreground">
                View and manage your professional experience
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Details Card */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-2xl sm:text-3xl font-bold">
                        {exp.title}
                      </CardTitle>
                      <CardDescription className="text-lg">
                        {exp.sub_title}
                      </CardDescription>
                    </div>
                    {exp.is_present && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Current
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Description
                    </h3>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {exp.description}
                    </p>
                  </div>

                  {exp.task_completed && exp.task_completed.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5" />
                          Key Achievements
                        </h3>
                        <div className="space-y-3">
                          {exp.task_completed.map((task: string, index: number) => (
                            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                              <p className="text-sm leading-relaxed">{task}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {exp.long_description && (
                    <MarkdownPreview content={exp.long_description} />
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Company Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Company Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Company</p>
                    <p className="font-semibold">{exp.company}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Position</p>
                    <p className="font-semibold flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {exp.position}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Employment Type</p>
                    <Badge variant="outline" className="capitalize">
                      {exp.type?.replace('-', ' ') || 'Not specified'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                    <p className="font-semibold">{formatDate(exp.start)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">End Date</p>
                    <p className="font-semibold">
                      {exp.is_present ? (
                        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3" />
                          Present
                        </Badge>
                      ) : (
                        formatDate(exp.end)
                      )}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                    <p className="font-semibold flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {exp.location}
                    </p>
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Something Went Wrong</CardTitle>
            <CardDescription>
              We encountered an error while loading the experience details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/admin/experience">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Experiences
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
}

export default page