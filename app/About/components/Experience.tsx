import React from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, Target, Rocket, Shield, Users, Zap, Calendar } from "lucide-react"
import { Experience as ExperienceType } from '@/app/admin/projects/page'
import { format } from 'date-fns'

interface ExperienceProps {
  isInView: boolean
  experience?: ExperienceType[]
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return format(date, 'MMM yyyy');
}

export const Experience: React.FC<ExperienceProps> = ({ isInView, experience }) => {
  return (
    <motion.section 
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0 }
      }}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="mb-8 sm:mb-16"
    >
      <div className={`grid ${experience && experience.length > 0 ? 'grid-cols-1 lg:grid-cols-2' : ''} gap-8`}>
        {
            experience && experience.length > 0 && (
                <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-card/10 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-border/50 hover:border-primary/50 transition-all duration-300"
                >
                <h2 className="text-3xl font-semibold mb-8 text-primary flex items-center gap-3">
                    <GraduationCap className="w-8 h-8" />
                    Education & Experience
                </h2>
                <div className="space-y-8">
                    {experience?.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="relative pl-6 border-l-2 border-primary/20 hover:border-primary/50 transition-colors duration-300"
                    >
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-card/20 border-2 border-primary" />
                        <h3 className="font-medium text-xl mb-1">{item.title}</h3>
                        <p className="text-primary mb-1">{item.sub_title}</p>
                        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.start)} - {formatDate(item.end)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                        {item.description}
                        </p>
                    </motion.div>
                    ))}
                </div>
                </motion.div>
            )
        }

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-card/10 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-border/50 hover:border-primary/50 transition-all duration-300"
        >
          <h2 className="text-3xl font-semibold mb-8 text-primary flex items-center gap-3">
            <Target className="w-8 h-8" />
            What Drives Me
          </h2>
          <div className="space-y-6">
            {[
                {
                    icon: <Rocket className="w-6 h-6" />,
                    title: "Innovation",
                    description: "I love diving into new tech and figuring out how to use it to actually solve problems people face"
                },
                {
                    icon: <Shield className="w-6 h-6" />,
                    title: "Security First",
                    description: "I believe privacy and security aren't afterthoughts—they need to be baked in from day one"
                },
                {
                    icon: <Users className="w-6 h-6" />,
                    title: "Team Leadership", 
                    description: "There's nothing better than helping teammates grow and watching a project come together through great collaboration"
                },
                {
                    icon: <Zap className="w-6 h-6" />,
                    title: "Continuous Learning",
                    description: "The tech world moves fast, and I genuinely enjoy keeping up with what's new and how it can make our work better"
                }
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02, x: 10 }}
                className="flex items-start gap-4 p-4 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors duration-300"
              >
                <div className="text-primary mt-1">{item.icon}</div>
                <div>
                  <h3 className="font-medium text-lg mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
} 