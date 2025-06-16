'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Github, Linkedin, Mail, Download, Code, GraduationCap, Briefcase, Eye, ChevronRight, HelpCircle, ArrowUpRight, Sparkles, Zap, Rocket, ArrowRight } from 'lucide-react';
import ImageCard from '@/components/ui/ImageCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skill } from '@/app/admin/projects/page';
import { Post } from '@/app/admin/posts/[id]/page';
export const drawCanvasImage = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void => {
  canvas.width = 400;
  canvas.height = 500;

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#1e293b');
  gradient.addColorStop(0.5, '#334155');
  gradient.addColorStop(1, '#0f172a');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const overlayGradient = ctx.createRadialGradient(200, 200, 0, 200, 200, 300);
  overlayGradient.addColorStop(0, 'rgba(44, 145, 110, 0.2)');
  overlayGradient.addColorStop(0.5, 'rgba(75, 234, 51, 0.1)');
  overlayGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');

  ctx.fillStyle = overlayGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const profileGradient = ctx.createLinearGradient(120, 120, 280, 280);
  profileGradient.addColorStop(0, 'rgba(22, 103, 45, 0.3)');
  profileGradient.addColorStop(1, 'rgba(0, 0, 0, 0.97)');
  
  ctx.fillStyle = profileGradient;
  ctx.beginPath();
  ctx.arc(200, 200, 80, 0, 2 * Math.PI);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(200, 200, 80, 0, 2 * Math.PI);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = 'bold 24px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('MA', 200, 210);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.font = 'bold 28px Inter, system-ui, sans-serif';
  ctx.fillText('Mohamed Amara', 200, 320);

  ctx.fillStyle = 'rgba(59, 130, 246, 0.9)';
  ctx.font = '20px Inter, system-ui, sans-serif';
  ctx.fillText('Software Developer', 200, 350);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '16px Inter, system-ui, sans-serif';
  ctx.fillText('College of Staten Island', 200, 380);

  const statusGradient = ctx.createLinearGradient(252, 152, 268, 168);
  statusGradient.addColorStop(0, '#10B981');
  statusGradient.addColorStop(1, '#059669');
  
  ctx.fillStyle = statusGradient;
  ctx.beginPath();
  ctx.arc(260, 160, 10, 0, 2 * Math.PI);
  ctx.fill();

  ctx.strokeStyle = 'white';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(260, 160, 10, 0, 2 * Math.PI);
  ctx.stroke();
};

interface HomeSectionProps {
  skills?: Skill[],
  posts?: Post[]
}
const HomeSection: React.FC<HomeSectionProps> = ({skills, posts}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => container.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  // const skills: string[] = ['Python', 'Java', 'C++', `C#`, `Web Development`, `Backend Development`, `Mobile Development`, `Desktop Development`, `AI Development`, `React`, 'TypeScript', 'Node.js', 'SQL', 'NoSQL', `Friendly`, `Team Player`, `Adaptable`, `Problem Solver`, `Creative`, `Detail-Oriented`];

  const socialLinks = [
    {
      icon: Github,
      href: 'https://github.com/Shaku-Med',
      label: 'GitHub',
      color: 'hover:bg-gray-500/20'
    },
    {
      icon: Linkedin,
      href: 'https://www.linkedin.com/in/mohamed-amara-b84447247/',
      label: 'LinkedIn',
      color: 'hover:bg-blue-500/20'
    },
    {
      icon: Mail,
      href: 'mailto:amaramohamedb@gmail.com',
      label: 'Email',
      color: 'hover:bg-purple-500/20'
    }
  ];

  const imageCards = [
    {
      username: "mohamed_amara_dev",
      location: "College of Staten Island",
      caption: "Ready to build the future with code! 💻",
      hashtags: ['SoftwareDeveloper', 'ComputerScience', 'React', 'TypeScript']
    },
    {
      username: "mohamed_amara_dev",
      location: "College of Staten Island",
      caption: "Ready to build the future with code! 💻",
      hashtags: ['SoftwareDeveloper', 'ComputerScience', 'React', 'TypeScript']
    },
    {
      username: "mohamed_amara_dev",
      location: "College of Staten Island",
      caption: "Ready to build the future with code! 💻",
      hashtags: ['SoftwareDeveloper', 'ComputerScience', 'React', 'TypeScript']
    },
    {
      username: "mohamed_amara_dev",
      location: "College of Staten Island",
      caption: "Ready to build the future with code! 💻",
      hashtags: ['SoftwareDeveloper', 'ComputerScience', 'React', 'TypeScript']
    }
  ];

  return (
    <div 
      ref={containerRef}
      className="min-h-screen w-full relative  flex flex-col justify-center items-center bg-gradient-to-br from-background via-background to-background"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,var(--chart-4),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,var(--chart-2),transparent_50%)]" />
      
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, var(--background), transparent 40%)`,
        }}
      />
      
      <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-pink-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      
      <div className="container lg:px-8 px-4 py-16 md:py-24 flex items-center relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 w-full">
          <div className={`space-y-10 transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'} z-20 relative`}>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/10 backdrop-blur-sm border border">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <GraduationCap className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-foreground/80">Computer Science Student</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-none">
                Mohamed 
                <br />
                <span className="text-chart-2">
                  Amara
                </span>
              </h1>
              
              <div className="flex items-center gap-4 text-2xl">
                <Button variant={`outline`} className="w-10 h-10 rounded-2xl">
                  <Code className="w-8 h-8" />
                </Button>
                <span className="font-bold">Software Developer</span>
              </div>
              
              <p className="text-xl leading-relaxed max-w-lg text-muted-foreground font-light">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-blue-500 font-medium">CS student at College of Staten Island</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Pursuing a Bachelor's degree in Computer Science with focus on software development</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider> who somehow convinced people I can code. 
                I build <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-blue-500 font-medium">things that usually work</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Specializing in building  applications that works</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider> and create <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-chart-2 font-medium">apps that don't crash</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Focusing on error handling and performance optimization</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider> (most of the time) with <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-purple-500 font-medium">modern tech</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Using modern technologies like NumPy, Pandas, Scikit-learn, React, and TensorFlow</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>.
              </p>
            </div>

            {
              skills && skills.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Button variant={`outline`} className="">
                      <Briefcase className="w-5 h-5" />
                    </Button>
                    <h3 className="text-xl font-bold">My Skills</h3>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {skills?.map((skill: Skill, index: number) => (
                      <Link href={`/skills/${skill.id}`} key={skill.id}>
                        <Badge 
                          variant={`outline`}
                          className="px-4 py-2 rounded-full "
                          style={{
                            animationDelay: `${index * 0.1}s`
                          }}
                        >
                          {skill.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            }


            <div className="flex flex-wrap gap-6 pt-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/resume">
                      <Button variant={`outline`} className="group px-8 py-4 text-lg font-semibold bg-gradient-to-r from-chart-2/90 to-chart-2 text-white rounded-2xl shadow-lg shadow-chart-2/25 transition-all duration-300 hover:scale-105">
                        <Eye className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
                        View (Resume/CV)
                        <ArrowRight className="w-4 h-4 ml-2 transition-all group-hover:translate-x-2 group-hover:-translate-y-0" />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      View this website in PDF or Paper form depending on how you like it.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/contact">
                      <Button variant={`outline`} className="px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-300">
                        <Mail className="w-5 h-5 mr-3" />
                        Contact Me
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Get in touch with me via Live Chat or Email.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex gap-4 pt-2">
              {socialLinks.map((link) => (
                <Button
                  key={link.label}
                  variant={`outline`}
                  size="icon"
                  className={`${link.color}`}
                  asChild
                >
                  <a href={link.href} target="_blank" rel="noopener noreferrer">
                    <link.icon className="w-6 h-6" />
                  </a>
                </Button>
              ))}
            </div>
          </div>

          <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-32 opacity-0'}`}>
            <div className="relative w-full max-w-lg mx-auto">
              <div className="absolute pointer-events-none -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl" />
              
              <div className="relative">
                <Swiper
                  spaceBetween={20}
                  slidesPerView={1}
                  autoplay={{
                    delay: 4000,
                    disableOnInteraction: false,
                  }}
                  className="w-full rounded-3xl overflow-hidden shadow-2xl border border-white/10"
                >
                  {posts?.map((post, index) => (
                    <SwiperSlide key={index}>
                      <ImageCard
                        type={`image`}
                        onDrawCanvas={drawCanvasImage}
                        post={post}
                        routeURL={`/posts`}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
              
              <div className="flex justify-center items-center mt-8 gap-4 z-[100]">
                <Button variant="outline" className="group rounded-2xl px-6 py-3 transition-all duration-300">
                  <Sparkles className="w-4 h-4 mr-2" />
                  View My Posts
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className=" rounded-2xl transition-colors"
                      >
                        <HelpCircle className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="">
                      <p className="max-w-[200px]">This section showcases my latest posts and thoughts on software development.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeSection;