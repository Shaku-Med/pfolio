import React from 'react'
import { motion } from 'framer-motion'
import { MapPin, Coffee, Heart, Code2 } from "lucide-react"
import { Achievements } from './Achievements'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface HeroProps {
  isTyping: boolean
}

export const Hero: React.FC<HeroProps> = ({ isTyping }) => {
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const }
    }
  }

  return (
    <TooltipProvider>

            <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mx-auto mb-10"
            >
            <motion.div variants={itemVariants} className="text-center mb-8 sm:mb-16">
                <motion.h1 
                className="text-4xl sm:text-6xl md:text-8xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary via-destructive to-primary bg-clip-text text-transparent"
                animate={{ 
                    backgroundPosition: isTyping ? '0% 50%' : '100% 50%',
                    textShadow: '0 0 20px rgba(var(--primary), 0.3)'
                }}
                transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    repeatType: 'reverse' 
                }}
                >
                About Me
                </motion.h1>
                <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-1 bg-gradient-to-r from-primary via-destructive to-primary mx-auto max-w-[200px] sm:max-w-xs rounded-full shadow-lg shadow-primary/20"
                />
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 items-start">
                <motion.div
                variants={itemVariants}
                className="prose prose-lg dark:prose-invert max-w-none p-4 sm:p-8"
                >
                <motion.p 
                    className="text-base sm:text-xl leading-relaxed mb-4 sm:mb-6 text-foreground/90"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                >
                Yo! ???? I'm <b className={`text-chart-2`}>Mohamed</b>, and I'm supposedly studying  <b> </b>
                <Tooltip>
                    <TooltipTrigger>
                        <i className={`text-destructive`}>Computer Science</i>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>I'm doing a bachelors of science in Computer Science at CUNY College of Staten Island</p>
                    </TooltipContent>
                </Tooltip>  at <b> </b>
                <Tooltip>
                    <TooltipTrigger>
                        <b className={`text-blue-400`}>CUNY College of Staten Island</b>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>A public university in Staten Island, NY, part of the City University of New York system</p>
                    </TooltipContent>
                </Tooltip> 
                <b> </b>
                <Tooltip>
                    <TooltipTrigger>
                        <i className={`text-muted-foreground`}>(when I'm not procrastinating)</i>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Just kidding! I'm actually quite focused... most of the time 😅</p>
                    </TooltipContent>
                </Tooltip>. I ran out of Netflix shows to binge during the pandemic, so I <b> </b>
                <Tooltip>
                    <TooltipTrigger>
                        <b className={`text-destructive`}>accidentally learned how to code</b>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Started with Python, then moved to web development. Best accident ever!</p>
                    </TooltipContent>
                </Tooltip>. Plot twist: I got quite good at it. Now I spend my days attempting to make computers do things they probably don't want to do, and people somehow call that <b> </b>
                <Tooltip>
                    <TooltipTrigger>
                        <b className={`text-primary`}>"software development"</b>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>AKA the art of making computers do our bidding while they plot their revenge</p>
                    </TooltipContent>
                </Tooltip>
            </motion.p>
                <motion.p 
                    className="text-sm sm:text-lg leading-relaxed mb-4 sm:mb-6 text-foreground/80"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
                >
                  <b> </b>I actually do a lot of <b> </b>
                  <Tooltip>
                      <TooltipTrigger>
                          <b className={`text-destructive`}> AI and cyber-security</b>
                      </TooltipTrigger>
                      <TooltipContent>
                          <p>Working on machine learning models and security protocols to make applications smarter and safer</p>
                      </TooltipContent>
                  </Tooltip> 
                  <b> </b>type stuff - just figuring out how to make <b> </b>
                  <Tooltip>
                      <TooltipTrigger>
                          <b className={`text-primary`}>smart and secure apps</b>
                      </TooltipTrigger>
                      <TooltipContent>
                          <p>Building applications that can learn from data while keeping user information protected</p>
                      </TooltipContent>
                  </Tooltip>. I don't even write code unless I am literally writing code - otherwise, I just <b> </b>
                  <Tooltip>
                      <TooltipTrigger>
                          <b className={`text-chart-2`}>scan through whatever tech news </b>
                      </TooltipTrigger>
                      <TooltipContent>
                          <p>Keeping up with the latest in tech, from AI breakthroughs to security vulnerabilities</p>
                      </TooltipContent>
                  </Tooltip> 
                 <b> </b>comes my way, <b> </b>
                  <Tooltip>
                      <TooltipTrigger>
                          <b className={`text-blue-400`}> mess around with open-source projects</b>
                      </TooltipTrigger>
                      <TooltipContent>
                          <p>Contributing to and learning from the open-source community</p>
                      </TooltipContent>
                  </Tooltip>, or <b> </b>
                  <Tooltip>
                      <TooltipTrigger>
                          <b className={`text-destructive`}>help other newb students</b>
                      </TooltipTrigger>
                      <TooltipContent>
                          <p>Mentoring and sharing knowledge with fellow developers who are just starting out</p>
                      </TooltipContent>
                  </Tooltip>.
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.6, ease: "easeOut" }}
                    className="flex flex-wrap items-center gap-2 sm:gap-4 text-muted-foreground"
                >
                    <Tooltip>
                        <TooltipTrigger>
                            <motion.div 
                            whileHover={{ scale: 1.1, y: -2 }}
                            className="flex items-center gap-2 p-2 rounded-lg text-sm sm:text-base"
                            >
                            <MapPin className="w-4 h-4 text-primary" />
                            <span>Staten Island, NY</span>
                            </motion.div>
                        </TooltipTrigger>
                        <TooltipContent className={`p-0 rounded-lg overflow-hidden bg-primary`}>
                            <div>
                              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d171501.33631527965!2d-74.31162953420969!3d40.56474933612112!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c245ef79f4d4e7%3A0x50271f8534babc78!2sStaten%20Island%2C%20NY!5e1!3m2!1sen!2sus!4v1749330013445!5m2!1sen!2sus" width="600" height="450"  allowFullScreen={true} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>                            
                            </div>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger>
                            <motion.div 
                            whileHover={{ scale: 1.1, y: -2 }}
                            className="flex items-center gap-2 p-2 rounded-lg text-sm sm:text-base"
                            >
                            <Coffee className="w-4 h-4 text-primary" />
                            <span>Fueled by coffee ☕</span>
                            </motion.div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Essential for those late-night coding sessions</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger>
                            <motion.div 
                            whileHover={{ scale: 1.1, y: -2 }}
                            className="flex items-center gap-2 p-2 rounded-lg text-sm sm:text-base"
                            >
                            <Heart className="w-4 h-4 text-red-500" />
                            <span>Loves clean code ❤️</span>
                            </motion.div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Because messy code is like a messy room - nobody likes it</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger>
                            <motion.div 
                            whileHover={{ scale: 1.1, y: -2 }}
                            className="flex items-center gap-2 p-2 rounded-lg text-sm sm:text-base"
                            >
                            <Code2 className="w-4 h-4 text-primary" />
                            <span>Full-stack dev 💻</span>
                            </motion.div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>From frontend, backend, and training, I've got you covered</p>
                        </TooltipContent>
                    </Tooltip>
                </motion.div>
                </motion.div>

                <Achievements />
            </div>
            </motion.div>

    </TooltipProvider>
  )
} 