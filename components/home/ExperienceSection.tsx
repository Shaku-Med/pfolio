'use client'
import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Calendar, MapPin, ChevronRight, Briefcase, GraduationCap, Code2, Building2, Rocket, HeartHandshake } from "lucide-react"
import { AnimatedSection } from '@/components/home/AnimatedSection'
import { Experience } from '@/app/admin/projects/page'
import { format } from 'date-fns'
import { Badge } from "@/components/ui/badge"
import Link from 'next/link'

interface TimelineItem {
  year: string;
  date: string;
  title: string;
  company: string;
  location: string;
  description: string;
  current: boolean;
  icon: React.ReactElement<{ className?: string }>;
  nested?: {
    date: string;
    title: string;
    description: string;
  }[];
}

interface ExperienceSectionProps {
  timeline: Experience[];
}

const getExperienceIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'internship':
      return <Code2 className="w-5 h-5 lg:w-6 lg:h-6 transition-all duration-300 group-hover/card:scale-110" />;
    case 'school':
      return <GraduationCap className="w-5 h-5 lg:w-6 lg:h-6 transition-all duration-300 group-hover/card:scale-110" />;
    case 'work':
      return <Briefcase className="w-5 h-5 lg:w-6 lg:h-6 transition-all duration-300 group-hover/card:scale-110" />;
    case 'project':
      return <Rocket className="w-5 h-5 lg:w-6 lg:h-6 transition-all duration-300 group-hover/card:scale-110" />;
    case 'volunteer':
      return <HeartHandshake className="w-5 h-5 lg:w-6 lg:h-6 transition-all duration-300 group-hover/card:scale-110" />;
    default:
      return <Building2 className="w-5 h-5 lg:w-6 lg:h-6 transition-all duration-300 group-hover/card:scale-110" />;
  }
};

const getExperienceColor = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'internship':
      return 'from-blue-500/10 to-blue-600/10';
    case 'school':
      return 'from-purple-500/10 to-purple-600/10';
    case 'work':
      return 'from-green-500/10 to-green-600/10';
    case 'project':
      return 'from-orange-500/10 to-orange-600/10';
    case 'volunteer':
      return 'from-red-500/10 to-red-600/10';
    default:
      return 'from-primary/10 to-secondary/10';
  }
};

export default function ExperienceSection({ timeline }: ExperienceSectionProps): React.ReactElement {
  const [showCurrentOnly, setShowCurrentOnly] = React.useState<boolean>(false)
  const [visibleItems, setVisibleItems] = React.useState<Set<number>>(new Set())
  const timelineRefs = React.useRef<(HTMLDivElement | null)[]>([])

  React.useEffect(() => {
    const observers: IntersectionObserver[] = []
    
    timelineRefs.current.forEach((ref, index) => {
      if (ref) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setVisibleItems(prev => new Set(prev).add(index))
              }
            })
          },
          {
            threshold: 0.2,
            rootMargin: '0px 0px -100px 0px'
          }
        )
        
        observer.observe(ref)
        observers.push(observer)
      }
    })

    return () => {
      observers.forEach(observer => observer.disconnect())
    }
  }, [timeline, showCurrentOnly])

  return (
    <section id="experience" className="py-24 relative z-10 overflow-hidden bg-muted/50 backdrop-blur-lg">
      <style jsx>{`
        @keyframes moveDown {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(100px); }
        }
        
        @keyframes progressFill {
          0% { height: 0%; }
          100% { height: 100%; }
        }
        
        .scroll-progress {
          animation: progressFill 0.3s ease-out forwards;
        }
      `}</style>
      <div className="container mx-auto px-4 max-w-7xl">
        <AnimatedSection>
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 animate-in slide-in-from-top-4 duration-700">
              My Journey
            </h2>
            <div className="flex justify-center gap-4 mb-8 animate-in fade-in-50 duration-500 delay-300">
              <Button
                variant={showCurrentOnly ? "default" : "outline"}
                onClick={() => setShowCurrentOnly(true)}
                className="flex items-center gap-2 transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
              >
                <Play className="w-4 h-4 transition-transform group-hover:scale-110" />
                Current Activities
              </Button>
              <Button
                variant={!showCurrentOnly ? "default" : "outline"}
                onClick={() => setShowCurrentOnly(false)}
                className="flex items-center gap-2 transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
              >
                <Calendar className="w-4 h-4 transition-transform group-hover:scale-110" />
                All Activities
              </Button>
            </div>
          </div>
        </AnimatedSection>
        
        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-muted via-muted to-transparent transform -translate-x-1/2 hidden lg:block overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/20 to-transparent animate-pulse"></div>
            <div className="absolute top-0 left-1/2 w-1 h-20 bg-gradient-to-b from-primary/60 to-transparent transform -translate-x-1/2 animate-[moveDown_4s_ease-in-out_infinite]"></div>
          </div>
          
          {timeline
            .filter((item: Experience) => !showCurrentOnly || item.is_present)
            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
            .map((item: Experience, index: number) => {
              const filteredIndex = timeline.filter((_, i) => !showCurrentOnly || timeline[i].is_present).findIndex(filteredItem => filteredItem === item)
              const isVisible = visibleItems.has(filteredIndex)
              
              return (
                <AnimatedSection key={index} delay={index * 200}>
                  <div 
                    ref={(el) => {
                      timelineRefs.current[filteredIndex] = el;
                    }}
                    className={`relative mb-16 last:mb-0 group transition-all duration-1000 ${
                      isVisible 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 translate-y-12'
                    }`}
                  >
                    <div className={`absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2 border-4 bg-background rounded-full px-4 py-2 text-sm font-bold shadow-lg z-10 transition-all duration-700 ${
                      isVisible
                        ? 'scale-100 opacity-100 rotate-0'
                        : 'scale-75 opacity-0 rotate-12'
                    } group-hover:scale-110 group-hover:shadow-xl`}>
                      <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text ">
                        {
                          format(new Date(item.start), 'yyyy')
                        }
                      </span>
                    </div>
                    
                    <div className="relative flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-0">
                      <div className={`w-full lg:w-1/2 ${index % 2 === 0 ? 'lg:pr-12' : 'lg:pl-12 lg:order-2'} transition-all duration-1000 delay-300 ${
                        isVisible
                          ? 'opacity-100 translate-x-0 translate-y-0'
                          : `opacity-0 ${index % 2 === 0 ? '-translate-x-12' : 'translate-x-12'} translate-y-8`
                      }`}>
                        <Link href={`/experience/${item.id}`} className="block">
                          <Card className="relative overflow-hidden group/card h-full transform hover:scale-[1.02] transition-all duration-500 hover:shadow-2xl border-0 bg-gradient-to-br from-background to-background/50 backdrop-blur-sm">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"></div>
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 blur-sm -z-10"></div>
                            
                            <CardHeader className="relative">
                              <div className="flex items-start gap-4">
                                <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${getExperienceColor(item.type)} border border-primary/20 transition-all duration-700 ${
                                  isVisible 
                                    ? 'scale-100 rotate-0 opacity-100' 
                                    : 'scale-0 rotate-180 opacity-0'
                                } group-hover/card:scale-110 group-hover/card:rotate-12 ${
                                  item.is_present 
                                    ? 'animate-pulse shadow-lg shadow-primary/25' 
                                    : ''
                                }`}>
                                  {getExperienceIcon(item.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <CardTitle className="text-lg lg:text-2xl font-bold truncate transition-colors duration-300 group-hover/card:text-primary">{item.title}</CardTitle>
                                  <CardDescription className="text-sm lg:text-lg truncate transition-colors duration-300 group-hover/card:text-foreground/80">{item.company}</CardDescription>
                                  <div className="flex items-center text-xs lg:text-sm mt-1 transition-all duration-300 group-hover/card:text-primary/80">
                                    <MapPin className="w-3 h-3 lg:w-4 lg:h-4 mr-1 flex-shrink0 transition-transform duration-300 group-hover/card:scale-110" />
                                    <span className="truncate">{item.location}</span>
                                  </div>
                                </div>
                              </div>
                            </CardHeader>

                            <CardContent className="relative">
                              <p className="text-sm lg:text-base mb-6 leading-relaxed transition-colors duration-300 group-hover/card:text-foreground/90 bg-card/80 py-2 px-6 rounded-lg border">
                                {
                                  item?.description?.split('\n').map((line: string, index: number) => (
                                    <React.Fragment key={index}>
                                      {line}
                                      <br />
                                    </React.Fragment>
                                  ))
                                }
                              </p>
                              
                              {item?.task_completed && (
                                <div className="space-y-3 flex flex-wrap gap-1">
                                  {item.task_completed.map((nestedItem: any, nestedIndex: number) => (
                                    <div key={nestedIndex} className={`relative transition-all duration-700 ${
                                      isVisible
                                        ? 'opacity-100 translate-x-0'
                                        : 'opacity-0 -translate-x-8'
                                    }`} style={{ transitionDelay: `${700 + (nestedIndex * 200)}ms` }}>
                                      <div className="absolute left-0 top-1/2 w-4 h-0.5 bg-gradient-to-r from-primary/50 to-transparent"></div>
                                      <Badge 
                                        variant="secondary"
                                        className="w-fit text-left px-4 py-2 text-sm font-normal hover:shadow-lg transition-all duration-500 transform hover:translate-x-2 hover:scale-[1.02] bg-gradient-to-r from-background to-background/80"
                                      >
                                        {nestedItem}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </Link>
                      </div>

                      <div className={`absolute left-1/2 transform -translate-x-1/2 z-10 top-[-35px] lg:top-[47.8%] transition-all duration-1000 delay-500 ${
                        isVisible
                          ? 'scale-100 opacity-100'
                          : 'scale-0 opacity-0'
                      }`}>
                        <div className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full border-4 flex items-center justify-center transform hover:scale-125 transition-all duration-500 border bg-background shadow-lg hover:shadow-xl ${
                          item.is_present 
                            ? 'animate-pulse border-primary shadow-primary/25' 
                            : `hover:border-${getExperienceColor(item.type).split('/')[0].split('-')[1]}/50`
                        }`}>
                          <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${getExperienceColor(item.type)} opacity-0 hover:opacity-100 transition-opacity duration-300`}></div>
                          {getExperienceIcon(item.type)}
                        </div>
                      </div>

                      <div className={`w-full lg:w-1/2 ${index % 2 === 0 ? 'lg:pl-12' : 'lg:pr-12'} lg:opacity-[1] opacity-0 text-center lg:text-left transition-all duration-1000 delay-700 ${
                        isVisible
                          ? 'opacity-100 translate-x-0'
                          : `opacity-0 ${index % 2 === 0 ? 'translate-x-8' : '-translate-x-8'}`
                      }`}>
                        <div className={`flex flex-col items-center ${index % 2 ? 'lg:items-end' : 'lg:items-start'}`}>
                          <span className="text-sm font-medium  hover:scale-105 transition-transform duration-300 cursor-default"> {format(new Date(item.start), 'MMM yyyy')} { `${item.is_present ? ' - Present' : `${new Date(item.end).getFullYear() < 2022 ? '' : `- ${format(new Date(item.end), 'MMM yyyy')}` }`}`}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}

          <div className="flex justify-center mt-16 animate-in slide-in-from-bottom-4 duration-700 delay-500">
            <Link href="/experience">
              <Button
                size="lg"
                variant="outline"
                className="group relative overflow-hidden transform hover:scale-105 transition-all duration-500 hover:shadow-2xl bg-gradient-to-r from-background to-background/80 backdrop-blur-sm border-primary/20 hover:border-primary/40"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="relative flex items-center justify-center lg:justify-start gap-3 z-10">
                  <Calendar className="w-5 h-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                  <span className="text-base lg:text-lg font-medium transition-colors duration-300 group-hover:text-primary">View Past Timeline</span>
                  <ChevronRight className="w-5 h-5 transform group-hover:translate-x-2 group-hover:scale-110 transition-all duration-300" />
                </div>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}