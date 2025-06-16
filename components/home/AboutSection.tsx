'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, MapPin, Calendar, GraduationCap, Zap, Code2, Brain, Users, Trophy, Target } from "lucide-react";
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface AboutSectionProps {
  stats: { number: string; label: string }[];
  technologies: string[];
}

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

const CountingNumber: React.FC<{ target: string; delay: number }> = ({ target, delay }) => {
  const [count, setCount] = useState<string>('0');
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  useEffect(() => {
    if (hasStarted) {
      const timer = setTimeout(() => {
        setCount(target);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [hasStarted, target, delay]);

  useEffect(() => {
    const timer = setTimeout(() => setHasStarted(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return <span>{count}</span>;
};

const TechCard: React.FC<{ tech: string; index: number }> = ({ tech, index }) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  return (
    <Card 
      className="group relative overflow-hidden bg-gradient-to-br from-card/40 overflow-hidden to-muted/40 backdrop-blur-xl border border-gray/10 hover:border-blue-400/50 transition-all duration-500 hover:scale-[1.02]"
      style={{ animationDelay: `${index * 50}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardContent className="flex items-center p-4 relative z-10">
        <div className={`w-2 h-2 rounded-full mr-4 transition-all duration-300 ${
          isHovered ? 'bg-blue-400 shadow-lg shadow-blue-400/50' : 'bg-primary'
        }`} />
        <span className=" font-medium transition-colors duration-300">
          {tech}
        </span>
        <ChevronRight className={`w-4 h-4 text-blue-400 ml-auto transition-all duration-300 ${
          isHovered ? 'translate-x-1 opacity-100' : 'translate-x-0 opacity-60'
        }`} />
      </CardContent>
    </Card>
  );
};

export default function AboutSection({ stats, technologies }: AboutSectionProps) {
  return (
    <section id="about" className="relative min-h-screen py-32 bg-background ">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,var(--chart-4),transparent_50%)]" />
      {/* <div className='absolute top-[-20px] h-20 bg-gradient-to-bl from-background to-chart-2 w-full' /> */}
      <div className="absolute inset-0 top-[-5px] sm:bg-[radial-gradient(circle_at_75%_0%,var(--chart-2),transparent_35%)] bg-[radial-gradient(circle_at_75%_-40%,var(--chart-2),transparent_35%)]" />
      
      <div className="absolute top-40 left-16 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-40 right-16 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />

      <div className="container mx-auto lg:px-8 px-4 relative z-10">
        <AnimatedSection>
          <div className="mb-20">
            <Badge variant={`outline`} className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-foreground/80">Get to know me</span>
            </Badge>
            
            <h2 className="text-6xl md:text-7xl font-black mb-8 ">
              About Me
            </h2>
          </div>
        </AnimatedSection>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          <AnimatedSection delay={200}>
            <div className="space-y-8">
              <div className="text-lg leading-relaxed space-y-6">
                <p className="text-xl text-muted-foreground font-light">
                  Hey there! I'm <span className="font-semibold text-chart-2">Mohamed</span>, and I love creating stuff that lives on devices and the internet.
                </p>
                
                <p>
                  My journey into software development kicked off in 2019 during the COVID-19 pandemic. I began with Python and, over time, explored various areas, getting hooked on programming.
                </p>
                
                <p>
                  Fast forward to today, I'm majoring in Computer Science and minoring in Cyber Security at{" "}
                  <a 
                    href="https://www.csi.cuny.edu" 
                    target="_blank" 
                    className="text-blue-500 hover:text-blue-600 font-semibold underline decoration-2 underline-offset-4 decoration-blue-400/50 hover:decoration-blue-300/70 transition-all duration-300"
                  >
                    CUNY College of Staten Island
                  </a>
                  .
                </p>

                <p>
                  Recently, I worked on a team project for my{" "}
                  <a 
                    href="https://csi-undergraduate.catalog.cuny.edu/courses/0627081" 
                    target="_blank" 
                    className="text-chart-2/80 hover:text-chart-2 font-semibold underline decoration-2 underline-offset-4 decoration-purple-400/50 hover:decoration-purple-300/70 transition-all duration-300"
                  >
                    Software Engineering class
                  </a>
                  . We built a{" "}
                  <a 
                    href="https://spotlight.medzyamara.dev" 
                    target="_blank" 
                    className="text-blue-500 hover:text-blue-600 font-semibold underline decoration-2 underline-offset-4 decoration-blue-400/50 hover:decoration-blue-300/70 transition-all duration-300"
                  >
                    Cuny Student Spotlight
                  </a>
                  <b> </b>
                   We built a Machine Learning Model that predicts the best student based on their votes and comments and recommendations.
                  <b> </b>
                  Our classmates could post videos, images, and text, receiving likes, comments, and engaging in real-time private chats and votes.
                </p> <b> </b>

                <div className="space-y-4">
                  <p className=" text-muted-foreground font-medium">Over the years, I've developed several real-time communication apps:</p>
                  <div className="space-y-3 ml-4">
                    <a 
                      href="https://clp-one.vercel.app" 
                      target="_blank" 
                      className="group flex items-center gap-3 text-blue-500 hover:text-blue-600 font-semibold transition-all duration-300 hover:translate-x-2"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors duration-300">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                      Real-time networking platform
                    </a>
                    <a 
                      href="https://toonjoy.org" 
                      target="_blank" 
                      className="group flex items-center gap-3 text-chart-2/80 hover:text-chart-2 font-semibold transition-all duration-300 hover:translate-x-2"
                    >
                      <div className="w-8 h-8 rounded-lg bg-chart-2/20 flex items-center justify-center group-hover:bg-chart-2/30 transition-colors duration-300">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                      Entertainment Platform
                    </a>
                  </div>
                </div>

                <p>
                  These days, I'm focused on building accessible and intelligent{" "}
                  <a 
                    href="https://github.com/Shaku-Med/ai" 
                    target="_blank" 
                    className="text-chart-2/80 hover:text-chart-2 font-semibold underline decoration-2 underline-offset-4 decoration-chart-2/50 hover:decoration-chart-2/70 transition-all duration-300"
                  >
                    AI systems
                  </a>
                  {" "}that can rival or even surpass industry leaders.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-900/20 to-blue-800/20 backdrop-blur-xl border border-blue-500/20 hover:border-blue-400/40 transition-all duration-500 hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-blue-400" />
                      </div>
                      <h3 className="text-xl font-bold ">Education</h3>
                    </div>
                    <p className="text-blue-500 font-medium mb-1">Bachelor of Science in Computer Science</p>
                    <p className="text-sm text-muted-foreground">(2022 - Present)</p>
                    <p className="text-sm text-blue-400 mt-2">Minor in Cyber Security</p>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden bg-gradient-to-br from-chart-2/20 to-chart-2/20 backdrop-blur-xl border border-chart-2/20 hover:border-chart-2/40 transition-all duration-500 hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-br from-chart-2/5 to-chart-2/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-chart-2/20 flex items-center justify-center">
                        <Target className="w-5 h-5 text-chart-2" />
                      </div>
                      <h3 className="text-xl font-bold ">Philosophy</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      I might still be a Computer Science student, but my skills extend beyond the classroom. I'm an ideal candidate for ambitious projects.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={400}>
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <Card 
                    key={index} 
                    className="group relative overflow-hidden text-center bg-gradient-to-br from-card/40 overflow-hidden to-muted/40 backdrop-blur-xl border border-gray/10 hover:border-gray/20 transition-all duration-700 hover:scale-105"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-chart-2/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <CardContent className="p-6 relative z-10">
                      <div className="text-4xl font-black mb-2 bg-gradient-to-r from-blue-400 to-chart-2/40 bg-clip-text text-transparent">
                        <CountingNumber target={stat.number} delay={index * 200} />
                      </div>
                      <div className="text-muted-foreground font-medium">{stat.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Badge variant={`outline`} className="w-10 h-10 rounded-xl flex items-center justify-center">
                    <Code2 className="w-5 h-5" />
                  </Badge>
                  <h3 className="text-2xl font-bold">Tech Stack</h3>
                </div>
                
                <p className="text-muted-foreground mb-6">Technologies I've been working with recently:</p>
                
                <div className="grid grid-cols-1 gap-3">
                  {technologies.map((tech, index) => (
                    <TechCard key={index} tech={tech} index={index} />
                  ))}
                </div>
              </div>
              
              <Card className="group relative overflow-hidden bg-gradient-to-br from-chart-2/20 to-emerald-800/20 backdrop-blur-xl border border-chart-2/20 hover:border-chart-2/40 transition-all duration-500 hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-chart-2/5 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="p-6 relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-chart-2/20 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-chart-2" />
                    </div>
                    <h3 className="text-xl font-bold ">Availability</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center ">
                      <MapPin className="w-5 h-5 mr-3 text-chart-2" />
                      Staten Island, New York
                    </div>
                    <div className="flex items-center ">
                      <Calendar className="w-5 h-5 mr-3 text-chart-2" />
                      <span>Available for opportunities</span>
                      <div className="ml-2 w-2 h-2 rounded-full bg-chart-2 animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}