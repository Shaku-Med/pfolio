'use client'
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Mail, Linkedin, ArrowUpRight, Sparkles } from "lucide-react";
import { Badge } from '../ui/badge';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({ children, className = "", delay = 0 }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  );
};

const FloatingOrb: React.FC<{ delay: number; size: string; position: string }> = ({ delay, size, position }) => (
  <div
    className={`absolute ${position} ${size} bg-gradient-to-r from-chart-2/20 to-chart-2/20 rounded-full blur-xl animate-pulse`}
    style={{ animationDelay: `${delay}ms`, animationDuration: '3s' }}
  />
);

export default function ContactSection() {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState<boolean>(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section id="contact" className="relative min-h-screen py-6 flex items-center justify-center overflow-hidden bg-gradient-to-br from-chart-4 via-background to-chart-4 border-t">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--chart-2),transparent_50%)]" />
      
      <FloatingOrb delay={0} size="w-72 h-72" position="top-1/4 left-1/4" />
      <FloatingOrb delay={1000} size="w-96 h-96" position="bottom-1/3 right-1/4" />
      <FloatingOrb delay={2000} size="w-64 h-64" position="top-1/2 right-1/3" />

      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(14,165,233,0.1), transparent 40%)`,
        }}
      />

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <AnimatedSection delay={200}>
          <div className="text-center">
            <Badge variant="outline" className="inline-flex items-center gap-2 px-4 py-2 rounded-full  backdrop-blur-sm border  mb-8">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-foreground/80">Available for new projects</span>
            </Badge>

            <h2 className="text-4xl md:text-7xl font-black mb-6 leading-tight">
              Let's Make
              <br />
              <span className="">
                Something That Works
              </span>
            </h2>

            <p className="text-xl sm:text-2xl text-foreground/70 mb-16 max-w-3xl mx-auto leading-relaxed font-light">
            Got a wild idea that might actually work? Let's team up and either create something amazing or learn a lot from our spectacular failure.            </p>

            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
              <Link 
                href="/contact"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="group relative overflow-hidden  backdrop-blur-sm   transition-all duration-500 px-8 py-6 text-lg font-semibold rounded-2xl"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-chart-2 to-chart-2 opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                  <Mail className="mr-3 w-6 h-6 transition-transform group-hover:scale-110" />
                  Start Conversation
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-0" />
                </Button>
              </Link>

              <Link 
                href="https://www.linkedin.com/in/mohamed-amara-b84447247/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  className="group relative overflow-hidden bg-gradient-to-r from-chart-2 to-chart-2 hover:from-blue-600 hover:to-chart-2 text-white transition-all duration-500 px-8 py-6 text-lg font-semibold rounded-2xl shadow-2xl shadow-chart-2/25"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <Linkedin className="mr-3 w-6 h-6 transition-transform group-hover:scale-110" />
                  Connect on LinkedIn
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-0" />
                </Button>
              </Link>
            </div>

            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { title: "Response Time", value: "< 24hrs", icon: "⚡" },
                { title: "Projects Completed", value: "50+", icon: "🚀" },
                { title: "Client Satisfaction", value: "100%", icon: "✨" }
              ].map((stat, index) => (
                <AnimatedSection key={index} delay={600 + index * 200}>
                  <div className="text-center p-6 rounded-2xl  backdrop-blur-sm border bg-primary/50 hover:bg-primary transition-all duration-300">
                    <div className="text-3xl mb-2">{stat.icon}</div>
                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-white/60 text-sm">{stat.title}</div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}