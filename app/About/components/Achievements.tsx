import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Code2, Lightbulb, Users, Database, Server } from "lucide-react"

interface Achievement {
  icon: React.ReactNode
  title: string
  description: string
}

export const Achievements: React.FC = () => {
  const achievements: Achievement[] = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Cybersecurity Expert',
      description: 'Completed intensive training at Codepath, focusing on ethical hacking, penetration testing, and security protocols'
    },
    {
      icon: <Code2 className="w-6 h-6" />,
      title: 'Full-Stack Developer',
      description: 'Built 15+ production-ready applications with modern frameworks and best practices'
    },
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: 'AI Innovation',
      description: 'Developed custom AI solutions without relying on third-party APIs'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Team Leadership',
      description: 'Led development teams in creating complex recommendation systems and collaborative projects'
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: 'Database Specialist',
      description: 'Expert in SQL, NoSQL, and database design with focus on scalability and security'
    },
    {
      icon: <Server className="w-6 h-6" />,
      title: 'Backend Architect',
      description: 'Designed and implemented robust backend systems with Node.js and Python'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: 1.0 }}
      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
    >
      {achievements.map((achievement, index) => (
        <motion.div
          key={index}
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            y: -5
          }}
          className="bg-card/10 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-lg border border-border/50 hover:border-primary/50 transition-all duration-300"
        >
          <div className="text-primary mb-2 sm:mb-3 transform hover:scale-110 transition-transform duration-300">
            {achievement.icon}
          </div>
          <h3 className="font-semibold text-base sm:text-lg mb-1 sm:mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {achievement.title}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {achievement.description}
          </p>
        </motion.div>
      ))}
    </motion.div>
  )
} 