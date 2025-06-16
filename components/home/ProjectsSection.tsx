'use client'
import React, { useState, useEffect, useRef, JSX } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, ExternalLink, Star, ArrowRight, Eye, Code, Code2 } from "lucide-react";
import { Badge } from '../ui/badge';
import { Project } from '@/app/admin/projects/page';
import NonHls from '@/app/contact/[id]/Body/components/FileHandler/NoNHls/NonHls';
import Link from 'next/link';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({ children, className = "", delay = 0 }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      } ${className}`}
    >
      {children}
    </div>
  );
};

const ProjectCard: React.FC<{ project: Project; index: number }> = ({ project, index }) => {
  return (
    <AnimatedSection delay={index * 150}>
      <Link 
        href={`/projects/${project.id}`}
        className="block h-full"
      >
        <Card 
          className={`group h-full relative overflow-hidden pt-0 bg-background backdrop-blur-xl border transition-all duration-700 hover:scale-[1.02] hover:shadow-2xl ${
            project.featured ? 'md:col-span-2 lg:col-span-1 ring-2 ring-primary/20' : ''
          }`}
        >
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="absolute -inset-0.5 bg-primary/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm -z-10"></div>
          
          <div className="relative aspect-video overflow-hidden">
            <NonHls 
              message={{
                file_object: {
                  url: project.thumbnail?.url,
                  type: 'image/png',
                  totalChunks: project.thumbnail?.totalChunks || 1
                },
                chat_id: project.id,
                user_id: project.user_id,
              }} 
              isPreview
              endpoint={'/api/open/'}
              className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110'
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            
            <div className="absolute top-4 right-4 flex gap-2 transition-all duration-300 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
              <Link 
                href={project.previewLinks?.[0]?.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-background/50 backdrop-blur-sm border hover:bg-background/80 transition-colors cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <Eye className="w-4 h-4" />
              </Link>
              <Link 
                href={project.sourceCodeLinks?.[0]?.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-background/50 backdrop-blur-sm border hover:bg-background/80 transition-colors cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <Code2 className="w-4 h-4" />
              </Link>
            </div>

            {project.featured && (
              <Badge className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary backdrop-blur-sm">
                <Star className="w-4 h-4 text-primary-foreground fill-current" />
                <span className="text-xs font-bold text-primary-foreground">FEATURED</span>
              </Badge>
            )}
          </div>

          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold transition-colors duration-300 group-hover:text-primary">
                {project.title}
              </CardTitle>
            </div>
            <CardDescription className="leading-relaxed text-base">
              {
                project?.description?.slice(0, 150)?.split('\n').map((line, index) => (
                  <p key={index} className="mb-2">
                    {line}
                    <br />
                  </p>
                ))
              }
              <Link href={`/projects/${project.id}`} className="text-primary underline">Read More...</Link>
            </CardDescription>
          </CardHeader>

          <CardContent className="relative z-10">
            <div className="flex flex-wrap gap-2 mb-6">
              {project?.programmingLanguages?.slice(0, 6)?.map((tag, tagIndex) => (
                <Badge 
                  key={tagIndex}
                  variant="outline"
                  className="px-3 py-1.5 text-xs bg-muted border rounded-full font-medium transition-colors duration-300"
                >
                  {tag}
                </Badge>
              ))}
              {
                project?.programmingLanguages?.length > 5 && (
                  <Badge 
                    variant="outline"
                    className="px-3 py-1.5 text-xs bg-muted border rounded-full font-medium transition-colors duration-300"
                  >
                    +{project?.programmingLanguages?.length - 5}
                  </Badge>
                )
              }
            </div>
          </CardContent>

          <CardFooter className="flex gap-4 relative z-10">
            <Link 
              href={project.sourceCodeLinks?.[0]?.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="outline"
                size="sm"
                className="group/btn flex items-center gap-2 transition-all duration-300 rounded-xl"
              >
                <Github className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                Code
                <ArrowRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
              </Button>
            </Link>
            <Link 
              href={project.previewLinks?.[0]?.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                size="sm"
                className="group/btn flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 rounded-xl shadow-lg shadow-primary/25"
              >
                <ExternalLink className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                Live Demo
                <ArrowRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </Link>
    </AnimatedSection>
  );
};

interface ProjectsSectionProps {
  projects: Project[];
}

export default function ProjectsSection({ projects }: ProjectsSectionProps): JSX.Element {
  return (
    <section id="projects" className="relative min-h-screen py-32 bg-background overflow-hidden">
      <div className="absolute inset-0 bg-muted/20" />
      
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <AnimatedSection>
          <div className="text-center mb-24">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted backdrop-blur-sm border mb-8">
              <Star className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Selected Work</span>
            </div>
            
            <h2 className="text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent leading-tight">
              Featured Projects
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A collection of projects that showcase my passion for creating exceptional digital experiences
            </p>
          </div>
        </AnimatedSection>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {projects.map((project, index) => (
            <ProjectCard key={index} project={project} index={index} />
          ))}
        </div>

        <AnimatedSection delay={projects.length * 150}>
          <div className="flex justify-center">
            <Link href="/projects">
              <Button
                size="lg"
                variant="outline"
                className="group relative overflow-hidden bg-background backdrop-blur-sm border transition-all duration-500 px-12 py-6 text-lg font-semibold rounded-2xl  hover:shadow-2xl hover:scale-105"
              >
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative z-10">View All Projects</span>
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-2 group-hover:-translate-y-1 relative z-10" />
              </Button>
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}