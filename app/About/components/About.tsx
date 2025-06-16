'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useScroll, useTransform, useInView } from 'framer-motion'
import { Hero } from './Hero'
import { Skills } from './Skills'
import { Projects } from './Projects'
import { Experience } from './Experience'
import { Contact } from './Contact'
import { Project, Experience as ExperienceType } from '@/app/admin/projects/page'

interface Skill {
  name: string
  level: number
  color: string
}

interface AboutData {
    projects?: Project[]
    experience?: ExperienceType[]
    skills?: Skill[]
}
export default function About({projects, experience, skills}: AboutData) {
  const [isTyping, setIsTyping] = useState<boolean>(true)
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  
  // Add refs for scroll animations
  const aboutRef = useRef(null)
  const skillsRef = useRef(null)
  const projectsRef = useRef(null)
  const experienceRef = useRef(null)
  
  // Add useInView hooks
  const isAboutInView = useInView(aboutRef, { once: true, amount: 0.3 })
  const isSkillsInView = useInView(skillsRef, { once: true, amount: 0.3 })
  const isProjectsInView = useInView(projectsRef, { once: true, amount: 0.3 })
  const isExperienceInView = useInView(experienceRef, { once: true, amount: 0.3 })


  useEffect(() => {
    const timer = setTimeout(() => setIsTyping(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen w-full bg-background text-foreground overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-16 relative z-10">
        <div ref={aboutRef}>
          <Hero isTyping={isTyping} />
        </div>

        <div ref={skillsRef}>
          <Skills skills={skills || []} isInView={isSkillsInView} />
        </div>

        <div ref={projectsRef}>
          <Projects projects={projects} isInView={isProjectsInView} />
        </div>

        <div ref={experienceRef}>
          <Experience isInView={isExperienceInView} experience={experience} />
        </div>

        <Contact />
      </div>
    </div>
  )
}