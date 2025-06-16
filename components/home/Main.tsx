'use client'
import React from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Code2, Github, Linkedin, Mail, ExternalLink, Calendar, MapPin, Download, Star, ChevronDown, ChevronRight, Building, GraduationCap, Briefcase, Play, Pause } from "lucide-react"

import 'swiper/css'
import 'swiper/css/effect-fade'
import HomeSection from '@/components/home/HomeSection'
import AboutSection from '@/components/home/AboutSection'
import ExperienceSection from '@/components/home/ExperienceSection'
import ProjectsSection from '@/components/home/ProjectsSection'
import ContactSection from '@/components/home/ContactSection'
import { Experience, Skill, Project } from '@/app/admin/projects/page'
import { Post } from '@/app/admin/posts/[id]/page'

export default function ModernPortfolio({skills, experience, projects, posts}: {skills?: Skill[], experience?: Experience[], projects?: Project[], posts?: Post[]}) {

  // const projects = [
  //   {
  //     title: "Real-time Social Media Platform",
  //     description: "A comprehensive social media platform built for Software Engineering class with real-time messaging, video/image posting, likes, comments, and private chat functionality.",
  //     image: "https://images.unsplash.com/photo-1611262588024-d12430b98920?w=600&h=400&fit=crop",
  //     tags: ["PHP", "JavaScript", "MySQL", "Socket.io"],
  //     github: "#",
  //     live: "http://163.238.35.165/~amara/PROJECT/php/UI/Index.php",
  //     featured: true
  //   },
  //   {
  //     title: "Real-time Networking Platform",
  //     description: "Advanced networking platform enabling real-time communication and professional connections with modern UI/UX design.",
  //     image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop",
  //     tags: ["React", "Node.js", "Socket.io", "MongoDB"],
  //     github: "#",
  //     live: "https://clp-one.vercel.app",
  //     featured: true
  //   },
  //   {
  //     title: "ToonJoy Entertainment Platform",
  //     description: "Interactive entertainment platform providing engaging content and user experiences with responsive design and optimized performance.",
  //     image: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&h=400&fit=crop",
  //     tags: ["React", "Next.js", "TypeScript", "Tailwind"],
  //     github: "#",
  //     live: "https://toonjoy.org",
  //     featured: false
  //   },
  //   {
  //     title: "AI Development Project",
  //     description: "Building accessible and intelligent AI systems designed to rival industry leaders, focusing on innovation and user accessibility.",
  //     image: "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=600&h=400&fit=crop",
  //     tags: ["Python", "TensorFlow", "Machine Learning", "AI"],
  //     github: "https://github.com/Shaku-Med/ai",
  //     live: "#",
  //     featured: false
  //   }
  // ]

  const timeline = [
    {
      year: "2025",
      date: "Mar 2025 - May 2025",
      title: "Software Development Intern",
      company: "AURISTOR Inc.",
      location: "New York City, NY (remote)",
      description: "Completed a three-month internship at AURISTOR Inc., where I dove deep into shell scripting and Linux systems. I contributed to their dashboard development, gaining valuable experience with enterprise software development. It was an exciting opportunity to work with real-world systems and get hands-on experience with production code.",
      current: false,
      icon: <Code2 className="w-4 h-4" />,
      nested: [
        {
          date: "May 2025",
          title: "Dashboard Development",
          description: "Successfully completed dashboard interface enhancements, implementing new features and improving user experience."
        },
        {
          date: "Apr 2025",
          title: "Shell Scripting & Linux",
          description: "Developed and maintained shell scripts for system automation and process optimization."
        },
        {
          date: "Mar 2025",
          title: "System Administration",
          description: "Started with Linux system administration, helping streamline internal processes and workflows."
        }
      ]
    },
    {
      year: "2024",
      date: "Jan 2024 - Present",
      title: "Computer Science Student",
      company: "CUNY College of Staten Island",
      location: "Staten Island, NY (On-site)",
      description: "Currently pursuing Bachelor's in Computer Science with minor in Cyber Security. Working on innovative projects and expanding technical expertise.",
      current: true,
      icon: <GraduationCap className="w-4 h-4" />,
      nested: [
        {
          date: "Spring 2024",
          title: "Advanced Software Engineering",
          description: "Led team development of real-time social media platform with comprehensive features."
        },
        {
          date: "Fall 2023",
          title: "Database Systems & Web Development",
          description: "Focused on database design, optimization, and full-stack web development."
        }
      ]
    },
    {
      year: "2023",
      date: "Sep 2023 - Dec 2023",
      title: "Software Engineering Project",
      company: "CSI Academic Project",
      location: "Staten Island, NY (Hybrid)",
      description: "Led team development of real-time social media platform with advanced features including messaging, content sharing, and user engagement systems.",
      current: false,
      icon: <Code2 className="w-4 h-4" />,
      nested: [
        {
          date: "Dec 2023",
          title: "Platform Launch",
          description: "Successfully deployed real-time social media platform with full functionality."
        },
        {
          date: "Oct 2023",
          title: "Development Phase",
          description: "Implemented real-time messaging, content sharing, and user interaction features."
        }
      ]
    },
    {
      year: "2022",
      date: "Jan 2022 - Aug 2023",
      title: "Full Stack Development Focus",
      company: "Independent Projects",
      location: "Remote",
      description: "Developed multiple real-time communication applications and entertainment platforms, expanding expertise in modern web technologies.",
      current: false,
      icon: <Briefcase className="w-4 h-4" />,
      nested: [
        {
          date: "Aug 2023",
          title: "ToonJoy Platform",
          description: "Launched entertainment platform with interactive content and user experiences."
        },
        {
          date: "Mar 2023",
          title: "Networking Platform",
          description: "Developed real-time networking platform with professional connection features."
        }
      ]
    },
    {
      year: "2019",
      date: "Mar 2019 - Dec 2021",
      title: "Programming Journey Begins",
      company: "Self-taught Development",
      location: "Remote",
      description: "Started programming journey during COVID-19 pandemic with Python, leading to exploration of web development, mobile apps, and machine learning.",
      current: false,
      icon: <Building className="w-4 h-4" />,
      nested: [
        {
          date: "2021",
          title: "Advanced Python & ML",
          description: "Explored machine learning, data science, and advanced Python development."
        },
        {
          date: "2020",
          title: "Web Development",
          description: "Transitioned to web development, learning JavaScript, HTML, CSS, and frameworks."
        },
        {
          date: "2019",
          title: "First Steps",
          description: "Started with Python basics during the pandemic, building first simple applications."
        }
      ]
    }
  ]

  const stats = [
    { number: "15+", label: "Projects Completed" },
    { number: "5+", label: "Years Learning" },
    { number: "20+", label: "Technologies" },
    { number: "Active", label: "Open Source" }
  ]

  const technologies = [
    "Python & Machine Learning",
    "JavaScript (ES6+)",
    "C#, C, C++, Java",
    "React & Next.js",
    "Node.js & Express",
    "SQL, MySQL, PostgreSQL, NoSQL"
  ]

  return (
    <div className="min-h-screen bg-background  overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div 
          className="absolute w-96 h-96 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full blur-3xl opacity-30"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
        <div 
          className="absolute w-64 h-64 bg-gradient-to-br from-purple-50 to-pink-50 rounded-full blur-3xl opacity-20"
          style={{
            right: '20%',
            bottom: '20%'
          }}
        />
      </div>

      <HomeSection skills={skills??[]} posts={posts??[]} />
      <AboutSection stats={stats} technologies={technologies} />
      <ExperienceSection timeline={experience??[]} />
      <ProjectsSection projects={projects??[]} />
      <ContactSection />

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes spin-box {
          0% {
            transform: rotateX(-15deg) rotateY(0deg);
          }
          100% {
            transform: rotateX(-15deg) rotateY(360deg);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 1s ease-out forwards;
        }

        .animate-fade-in-right {
          animation: fadeInRight 1s ease-out forwards;
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .animate-spin-box {
          animation: spin-box 12s linear infinite;
        }

        .perspective-1000 {
          perspective: 1000px;
        }

        .preserve-3d {
          transform-style: preserve-3d;
        }

        .backface-hidden {
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  )
}