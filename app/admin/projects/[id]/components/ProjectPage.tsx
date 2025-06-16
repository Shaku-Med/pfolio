'use client'

import React, { useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { 
  Github, 
  ExternalLink, 
  Calendar, 
  Users, 
  Clock, 
  DollarSign, 
  Target, 
  Award, 
  Lightbulb, 
  TrendingUp, 
  Star,
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  Send,
  User,
  Code,
  Zap,
  Eye,
  ArrowUpRight,
  Play,
  Download,
  File
} from 'lucide-react'
import Link from 'next/link'
import NonHls from '@/app/contact/[id]/Body/components/FileHandler/NoNHls/NonHls'

interface ProjectFile {
  url: string;
  customName?: string;
  status: string;
  progress: number;
  totalChunks?: number;
  fileType?: string;
}

interface Comment {
  id: string;
  author: string;
  avatar?: string;
  content: string;
  timestamp: string;
  likes: number;
}

interface ProjectPageProps {
  title?: string;
  description?: string;
  longDescription?: string;
  date?: string;
  category?: string;
  status?: string;
  priority?: string;
  tags?: string[];
  thumbnail?: {
    url: string;
    totalChunks: number;
  };
  project_files?: ProjectFile[];
  user_id?: string;
  programmingLanguages?: string[];
  frameworks?: string[];
  technologies?: string[];
  platforms?: string[];
  duration?: string;
  teamSize?: string;
  clientName?: string;
  budget?: string;
  challenges?: string;
  learnings?: string;
  achievements?: string;
  futureImprovements?: string;
  sourceCodeLinks?: {
    id: string;
    url: string;
    label: string;
  }[];
  previewLinks?: {
    id: string;
    url: string;
    label: string;
  }[];
  featured?: boolean;
  id?: string;
}

const ProjectPage = ({ project }: { project: ProjectPageProps }) => {
  const [newComment, setNewComment] = useState('')
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: 'Sarah Chen',
      avatar: '',
      content: 'Amazing work! The UI is incredibly clean and the performance optimizations are impressive. How did you handle the state management?',
      timestamp: '2 hours ago',
      likes: 12
    },
    {
      id: '2',
      author: 'Mike Rodriguez',
      avatar: '',
      content: 'This is exactly what I was looking for in my current project. Thanks for sharing the source code!',
      timestamp: '1 day ago',
      likes: 8
    }
  ])

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="text-center space-y-6 p-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <Code className="w-10 h-10 text-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Project not found</h1>
            <p className="text-muted-foreground">The project you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    )
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed': 
        return { 
          bg: 'bg-emerald-50 dark:bg-emerald-950/20', 
          text: 'text-emerald-700 dark:text-emerald-300',
          border: 'border-emerald-200 dark:border-emerald-800',
          icon: '✓'
        }
      case 'in-progress': 
        return { 
          bg: 'bg-blue-50 dark:bg-blue-950/20', 
          text: 'text-blue-700 dark:text-blue-300',
          border: 'border-blue-200 dark:border-blue-800',
          icon: '⚡'
        }
      case 'planning': 
        return { 
          bg: 'bg-purple-50 dark:bg-purple-950/20', 
          text: 'text-purple-700 dark:text-purple-300',
          border: 'border-purple-200 dark:border-purple-800',
          icon: '📋'
        }
      case 'on-hold': 
        return { 
          bg: 'bg-orange-50 dark:bg-orange-950/20', 
          text: 'text-orange-700 dark:text-orange-300',
          border: 'border-orange-200 dark:border-orange-800',
          icon: '⏸️'
        }
      case 'cancelled': 
        return { 
          bg: 'bg-red-50 dark:bg-red-950/20', 
          text: 'text-red-700 dark:text-red-300',
          border: 'border-red-200 dark:border-red-800',
          icon: '❌'
        }
      default: 
        return { 
          bg: 'bg-gray-50 dark:bg-gray-950/20', 
          text: 'text-gray-700 dark:text-gray-300',
          border: 'border-gray-200 dark:border-gray-800',
          icon: '📝'
        }
    }
  }

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high': 
        return { 
          bg: 'bg-red-50 dark:bg-red-950/20', 
          text: 'text-red-700 dark:text-red-300',
          border: 'border-red-200 dark:border-red-800'
        }
      case 'medium': 
        return { 
          bg: 'bg-amber-50 dark:bg-amber-950/20', 
          text: 'text-amber-700 dark:text-amber-300',
          border: 'border-amber-200 dark:border-amber-800'
        }
      case 'low': 
        return { 
          bg: 'bg-green-50 dark:bg-green-950/20', 
          text: 'text-green-700 dark:text-green-300',
          border: 'border-green-200 dark:border-green-800'
        }
      default: 
        return { 
          bg: 'bg-gray-50 dark:bg-gray-950/20', 
          text: 'text-gray-700 dark:text-gray-300',
          border: 'border-gray-200 dark:border-gray-800'
        }
    }
  }

  const handleCommentSubmit = () => {
    if (!newComment.trim()) return
    
    const comment: Comment = {
      id: Date.now().toString(),
      author: 'You',
      content: newComment,
      timestamp: 'Just now',
      likes: 0
    }
    
    setComments([comment, ...comments])
    setNewComment('')
  }

  const statusConfig = project.status ? getStatusConfig(project.status) : null
  const priorityConfig = project.priority ? getPriorityConfig(project.priority) : null

  let endpoint = '/api/open/'
  const baseUrl = project?.thumbnail?.url[0][project?.thumbnail?.url[0]?.length - 1]
  const audioUrl = `${endpoint}?url=${encodeURIComponent(baseUrl?.split('_')[0] || '')}&id=${project?.user_id}&length=${project?.thumbnail?.totalChunks}&type=image/png`


  return (
    <div className="min-h-screen ">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Project Image */}
        <div className="relative">
          <div className="h-[60vh] bg-card/40 w-full relative overflow-hidden">
            {project.thumbnail?.url ? (
              <div className="relative h-full w-full">
                {/* <NonHls 
                  message={{
                    file_object: {
                      url: project.thumbnail.url,
                      type: 'image/png',
                      totalChunks: 1
                    },
                    chat_id: project.id,
                    user_id: project.user_id,
                  }} 
                  isPreview
                /> */}
                <img src={audioUrl} alt={project.title} className="w-full h-full object-cover object-start" />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center relative">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 mx-auto /20 dark:bg-black/20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
                    <Code className="w-12  text-slate-600 dark:text-slate-300" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">No preview image</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
            )}
          </div>

          {/* Floating badges */}
          <div className="absolute top-6 right-6 flex flex-col gap-3">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-900"
              asChild
            >
              <Link href={`/admin/projects/${project.id}/edit`}>
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-pencil"
                  >
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    <path d="m15 5 4 4" />
                  </svg>
                  <span>Edit Project</span>
                </div>
              </Link>
            </Button>
            {project.featured && (
              <div className="flex items-center gap-2  text-foreground px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-semibold">Featured</span>
              </div>
            )}
            {statusConfig && (
              <div className={`flex items-center gap-2 ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border} px-4 py-2 rounded-full shadow-lg backdrop-blur-sm`}>
                <span className="text-sm">{statusConfig.icon}</span>
                <span className="text-sm font-medium capitalize">{project.status?.replace('-', ' ')}</span>
              </div>
            )}
          </div>

          {/* Project Header */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {priorityConfig && (
                  <Badge className={`${priorityConfig.bg} ${priorityConfig.text} border ${priorityConfig.border} px-3 py-1.5 font-medium`}>
                    {project.priority} priority
                  </Badge>
                )}
                {project.category && (
                  <Badge variant="outline" className=" backdrop-blur-sm px-3 py-1.5 font-medium">
                    {project.category.replace('-', ' ')}
                  </Badge>
                )}
                {project.date && (
                  <Badge variant="outline" className=" backdrop-blur-sm px-3 py-1.5 font-medium">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(project.date).getFullYear()}
                  </Badge>
                )}
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-foreground leading-tight">
                {project.title}
              </h1>
              
              <p className="text-xl md:text-2xl text-foreground/90 mb-8 max-w-4xl leading-relaxed font-light">
                {project.description}
              </p>

              {/* Primary Action Buttons */}
              <div className="flex flex-wrap gap-4 mb-8">
                {project.previewLinks?.filter(link => link.url.trim()).slice(0, 2).map((link) => (
                  <Button key={link.id} asChild size="lg" className=" px-6  text-black shadow-xl">
                    <Link href={link.url} target="_blank">
                      <Play className="w-4 h-4 mr-2" />
                      {link.label || 'Live Demo'}
                      <ArrowUpRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                ))}
                {project.sourceCodeLinks?.filter(link => link.url.trim()).slice(0, 1).map((link) => (
                  <Button key={link.id} variant="outline" asChild size="lg" className=" px-6 bg-transparent border-white/30 text-foreground backdrop-blur-sm">
                    <Link href={link.url} target="_blank">
                      <Github className="w-4 h-4 mr-2" />
                      {link.label || 'View Code'}
                    </Link>
                  </Button>
                ))}
              </div>

              {/* Engagement Bar */}
              <div className="flex items-center gap-6 text-foreground/80">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsLiked(!isLiked)}
                  className={`text-foreground/80 hover:text-foreground ${isLiked ? 'text-red-400' : ''}`}
                >
                  <Heart className={`w-5 h-5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="hidden sm:inline">Like</span>
                </Button>
                <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  <span className="hidden sm:inline">{comments.length} Comments</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`text-foreground/80 hover:text-foreground ${isBookmarked ? 'text-blue-400' : ''}`}
                >
                  <Bookmark className={`w-5 h-5 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                  <span className="hidden sm:inline">Save</span>
                </Button>
                <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground">
                  <Share className="w-5 h-5 mr-2" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Overview */}
            {project.longDescription && (
              <Card className="border-0 shadow-lg bg-card/50 border backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                      <Eye className="w-4 h-4 text-foreground" />
                    </div>
                    <h2 className="text-2xl font-semibold">Project Overview</h2>
                  </div>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-slate-900 dark:prose-headings:text-slate-100 prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-a:text-blue-600 dark:prose-a:text-blue-400"
                    dangerouslySetInnerHTML={{ __html: project.longDescription }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Links Section */}
            {((project.previewLinks && project.previewLinks.some(link => link.url.trim())) || 
              (project.sourceCodeLinks && project.sourceCodeLinks.some(link => link.url.trim()))) && (
              <Card className="border-0 shadow-lg bg-card/50 border backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8  rounded-lg flex items-center justify-center">
                      <ExternalLink className="w-4 h-4 text-foreground" />
                    </div>
                    <h2 className="text-2xl font-semibold">Project Links</h2>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Preview Links */}
                    {project.previewLinks && project.previewLinks.some(link => link.url.trim()) && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-md flex items-center justify-center">
                            <Play className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                          </div>
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Live Demos</h3>
                        </div>
                        <div className="space-y-3">
                          {project.previewLinks.filter(link => link.url.trim()).map((link) => (
                            <Button key={link.id} variant="outline" asChild className="w-full justify-between hover:bg-blue-50 dark:hover:bg-blue-950/50 border-slate-200 dark:border-slate-700">
                              <Link href={link.url} target="_blank">
                                <div className="flex items-center gap-2">
                                  <ExternalLink className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                  <span>{link.label || 'Live Demo'}</span>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-slate-400" />
                              </Link>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Source Code Links */}
                    {project.sourceCodeLinks && project.sourceCodeLinks.some(link => link.url.trim()) && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-md flex items-center justify-center">
                            <Code className="w-3 h-3 text-green-600 dark:text-green-400" />
                          </div>
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Source Code</h3>
                        </div>
                        <div className="space-y-3">
                          {project.sourceCodeLinks.filter(link => link.url.trim()).map((link) => (
                            <Button key={link.id} variant="outline" asChild className="w-full justify-between hover:bg-green-50 dark:hover:bg-green-950/50 border-slate-200 dark:border-slate-700">
                              <Link href={link.url} target="_blank">
                                <div className="flex items-center gap-2">
                                  <Github className="w-4 h-4 text-green-600 dark:text-green-400" />
                                  <span>{link.label || 'Source Code'}</span>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-slate-400" />
                              </Link>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tech Stack */}
            <Card className="border-0 shadow-lg bg-card/50 border backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-foreground" />
                  </div>
                  <h2 className="text-2xl font-semibold">Technology Stack</h2>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {project.programmingLanguages && project.programmingLanguages.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        Languages
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {project.programmingLanguages.map((lang, index) => (
                          <Badge key={index} className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800 px-3 py-1">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {project.frameworks && project.frameworks.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Frameworks
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {project.frameworks.map((framework, index) => (
                          <Badge key={index} className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800 px-3 py-1">
                            {framework}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {project.technologies && project.technologies.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Tools & Technologies
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, index) => (
                          <Badge key={index} className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800 px-3 py-1">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {project.platforms && project.platforms.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Platforms
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {project.platforms.map((platform, index) => (
                          <Badge key={index} className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800 px-3 py-1">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Project Journey */}
            {(project.challenges || project.learnings || project.achievements || project.futureImprovements) && (
              <Card className="border-0 shadow-lg bg-card/50 border backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-foreground" />
                    </div>
                    <h2 className="text-2xl font-semibold">Project Journey</h2>
                  </div>
                </CardHeader>
                <CardContent className="space-y-8">
                  {project.challenges && (
                    <div className="p-6 rounded-xl bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border border-red-100 dark:border-red-900/30">
                      <div className="flex items-start gap-4">
                        <div className="w-12  bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Target className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-red-800 dark:text-red-300">Challenges Overcome</h3>
                          <p className="text-red-700 dark:text-red-300 leading-relaxed">{project.challenges}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {project.learnings && (
                    <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-100 dark:border-blue-900/30">
                      <div className="flex items-start gap-4">
                        <div className="w-12  bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Lightbulb className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300">Key Learnings</h3>
                          <p className="text-blue-700 dark:text-blue-300 leading-relaxed">{project.learnings}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {project.achievements && (
                    <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-100 dark:border-green-900/30">
                      <div className="flex items-start gap-4">
                        <div className="w-12  bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">Achievements & Impact</h3>
                          <p className="text-green-700 dark:text-green-300 leading-relaxed">{project.achievements}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {project.futureImprovements && (
                    <div className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-100 dark:border-purple-900/30">
                      <div className="flex items-start gap-4">
                        <div className="w-12  bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300">Future Roadmap</h3>
                          <p className="text-purple-700 dark:text-purple-300 leading-relaxed">{project.futureImprovements}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )} 

            {/* Gallery */}
            {project.project_files && project.project_files.length > 0 && (
              <Card className="border-0 shadow-lg bg-card/50 border backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                      <Eye className="w-4 h-4 text-foreground" />
                    </div>
                    <h2 className="text-2xl font-semibold">Project Gallery</h2>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {project.project_files.map((file, index) => (
                      <div key={index} className="group relative">
                        <div className="aspect-video rounded-xl overflow-hidden border bg-card shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
                            {
                                file.fileType === 'image' ? (
                                    <NonHls 
                                      message={{
                                        file_object: {
                                          url: file.url,
                                          type: 'image/png',
                                          totalChunks: file.totalChunks || 1
                                        },
                                        chat_id: project.id,
                                        user_id: project.user_id,
                                      }} 
                                      isPreview
                                    />
                                ) : (
                                    <>
                                       <div className='flex items-center justify-center text-center line-clamp-2 h-full flex-col gap-2'>
                                          <File className='w-10 h-10'/>
                                          <p className='text-sm font-medium text-slate-700 dark:text-slate-300'>{file.customName}</p>
                                       </div>
                                    </>
                                )
                            }
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comments Section */}

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              
              {/* Project Info Card */}
              <Card className="border-0 shadow-lg bg-card/50 border backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-slate-400 to-slate-600 rounded-md flex items-center justify-center">
                      <Clock className="w-3 h-3 text-foreground" />
                    </div>
                    Project Details
                  </h3>
                </CardHeader>
                <CardContent className="space-y-5">
                  {project.date && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">Date</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{new Date(project.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                  
                  {project.duration && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">Duration</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{project.duration}</p>
                      </div>
                    </div>
                  )}
                  
                  {project.teamSize && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">Team Size</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{project.teamSize}</p>
                      </div>
                    </div>
                  )}
                  
                  {project.clientName && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                        <Award className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">Client</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{project.clientName}</p>
                      </div>
                    </div>
                  )}
                  
                  {project.budget && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">Budget</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{project.budget}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tags */}
              {project.tags && project.tags.length > 0 && (
                <Card className="border-0 shadow-lg bg-card/50 border backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-pink-400 to-purple-600 rounded-md flex items-center justify-center">
                        <Star className="w-3 h-3 text-foreground" />
                      </div>
                      Tags
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs px-3 py-1 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Links */}
              {((project.previewLinks && project.previewLinks.some(link => link.url.trim())) || 
                (project.sourceCodeLinks && project.sourceCodeLinks.some(link => link.url.trim()))) && (
                <Card className="border-0 shadow-lg bg-card/50 border backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-md flex items-center justify-center">
                        <ExternalLink className="w-3 h-3 text-foreground" />
                      </div>
                      Quick Access
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {project.previewLinks?.filter(link => link.url.trim()).map((link) => (
                      <Button key={link.id} variant="outline" asChild className="w-full justify-start text-sm h-10 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-950/40">
                        <Link href={link.url} target="_blank">
                          <Play className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                          {link.label || 'Live Demo'}
                          <ArrowUpRight className="w-3 h-3 ml-auto text-slate-400" />
                        </Link>
                      </Button>
                    ))}
                    
                    {project.sourceCodeLinks?.filter(link => link.url.trim()).map((link) => (
                      <Button key={link.id} variant="outline" asChild className="w-full justify-start text-sm h-10 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-950/40">
                        <Link href={link.url} target="_blank">
                          <Github className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                          {link.label || 'Source Code'}
                          <ArrowUpRight className="w-3 h-3 ml-auto text-slate-400" />
                        </Link>
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectPage