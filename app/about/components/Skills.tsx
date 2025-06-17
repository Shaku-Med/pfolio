import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Skill {
  id: string
  name: string
  level: number
  color: string
}

interface SkillsProps {
  skills: Skill[]
  isInView: boolean
}

export const Skills: React.FC<SkillsProps> = ({ skills, isInView }) => {
  if (!skills) return null
  if (skills.length === 0) return null

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9,
      rotateX: -15
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 10
      }
    }
  }

  const progressVariants = {
    hidden: { width: 0, opacity: 0 },
    visible: (level: number) => ({
      width: `${level}%`,
      opacity: 1,
      transition: {
        duration: 1.5,
        ease: "easeOut" as const,
        delay: 0.3
      }
    })
  }

  const getSkillIcon = (skillName: string) => {
    const name = skillName.toLowerCase()
    if (name.includes('react') || name.includes('javascript') || name.includes('typescript')) {
      return '⚛️'
    } else if (name.includes('python') || name.includes('django')) {
      return '🐍'
    } else if (name.includes('design') || name.includes('ui') || name.includes('ux')) {
      return '🎨'
    } else if (name.includes('database') || name.includes('sql')) {
      return '🗄️'
    } else if (name.includes('cloud') || name.includes('aws') || name.includes('azure')) {
      return '☁️'
    } else if (name.includes('mobile') || name.includes('ios') || name.includes('android')) {
      return '📱'
    }
    return '⚡'
  }

  return (
    <section className="mb-8 sm:mb-16 relative">
      {/* Animated background elements */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-accent/20 to-primary/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div> */}

      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={containerVariants}
        className="relative z-10"
      >
        {/* Header */}
        <motion.div 
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: -30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h2 
            className="text-4xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ['0%', '100%', '0%'],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              backgroundSize: '200% 200%'
            }}
          >
            Technical Expertise
          </motion.h2>
          <motion.div
            className="h-1 w-20 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"
            initial={{ width: 0 }}
            animate={isInView ? { width: 80 } : { width: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </motion.div>

        {/* Skills Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          variants={containerVariants}
        >
          {skills.map((skill, index) => (
            <motion.div
              key={skill.name}
              variants={itemVariants}
              whileHover={{ 
                y: -10,
                scale: 1.05,
                rotateY: 5,
                transition: { type: "spring", stiffness: 300, damping: 20 }
              }}
              className="group relative"
            >
              <Link href={`/skills/${skill.id}`} className="block">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-accent/50 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Main card */}
                <div className="relative bg-card/10 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-border/50 group-hover:border-primary/50 transition-all duration-500 overflow-hidden">
                  {/* Animated background pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `radial-gradient(circle at 20% 20%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                                         radial-gradient(circle at 80% 80%, rgba(255, 119, 198, 0.1) 0%, transparent 50%)`
                      }}
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.1, 0.2, 0.1]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <motion.span 
                          className="text-2xl"
                          animate={{
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: index * 0.2
                          }}
                        >
                          {getSkillIcon(skill.name)}
                        </motion.span>
                        <span className="font-bold text-lg sm:text-xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                          {skill.name}
                        </span>
                      </div>
                      
                      <motion.div
                        className="relative"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
                        transition={{ duration: 0.8, delay: index * 0.1 + 0.5, type: "spring" }}
                      >
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-background font-bold text-sm shadow-lg">
                          {skill.level}%
                        </div>
                        <motion.div
                          className="absolute inset-0 rounded-full bg-primary"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 0.8, 0.5]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: index * 0.3
                          }}
                        />
                      </motion.div>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="relative">
                      <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        <span>Beginner</span>
                        <span>Expert</span>
                      </div>
                      
                      {/* Progress Track */}
                      <div className="relative w-full h-4 bg-muted/50 rounded-full overflow-hidden shadow-inner">
                        {/* Animated background */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{
                            x: ['-100%', '200%']
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: index * 0.5,
                            ease: "easeInOut"
                          }}
                        />
                        
                        {/* Progress Fill */}
                        <motion.div
                          className={`relative h-full rounded-full ${skill.color} shadow-lg overflow-hidden`}
                          custom={skill.level}
                          variants={progressVariants}
                          initial="hidden"
                          animate={isInView ? "visible" : "hidden"}
                        >
                          {/* Shimmer effect */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            animate={{
                              x: ['-100%', '200%']
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: index * 0.2 + 1,
                              ease: "easeInOut"
                            }}
                          />
                          
                          {/* Pulse effect */}
                          <motion.div
                            className="absolute right-0 top-0 w-2 h-full bg-white/50 rounded-r-full"
                            animate={{
                              opacity: [0, 1, 0],
                              scale: [1, 1.2, 1]
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: index * 0.1 + 1.5
                            }}
                          />
                        </motion.div>
                      </div>

                      {/* Skill Level Labels */}
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <motion.span
                          className={skill.level >= 25 ? "text-primary font-semibold" : ""}
                          animate={skill.level >= 25 ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          Basic
                        </motion.span>
                        <motion.span
                          className={skill.level >= 50 ? "text-primary font-semibold" : ""}
                          animate={skill.level >= 50 ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                        >
                          Intermediate
                        </motion.span>
                        <motion.span
                          className={skill.level >= 75 ? "text-primary font-semibold" : ""}
                          animate={skill.level >= 75 ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                        >
                          Advanced
                        </motion.span>
                        <motion.span
                          className={skill.level >= 90 ? "text-primary/60 font-semibold" : ""}
                          animate={skill.level >= 90 ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                        >
                          Expert
                        </motion.span>
                      </div>
                    </div>
                  </div>

                  {/* Floating particles */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-primary/30 rounded-full"
                        style={{
                          left: `${20 + i * 30}%`,
                          top: `${30 + i * 20}%`
                        }}
                        animate={{
                          y: [-10, -20, -10],
                          opacity: [0, 1, 0],
                          scale: [0, 1, 0]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: i * 0.5 + index * 0.1,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}