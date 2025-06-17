import React from 'react'
import { motion } from 'framer-motion'
import { Mail, Github, Linkedin } from "lucide-react"

export const Contact: React.FC = () => {
  return (
    <motion.section
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 }
      }}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="bg-gradient-to-r from-card/20 via-accent/20 to-card/20 p-6 sm:p-12 rounded-3xl shadow-2xl backdrop-blur-sm border border-border/50"
    >
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 ">
          Let's Build Something Amazing
        </h2>
        <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          I'm always excited to collaborate on innovative projects, discuss emerging technologies, 
          or simply connect with fellow developers. Whether you have an idea brewing or want to 
          chat about the future of tech, I'd love to hear from you!
        </p>
      </div>
      <motion.div 
        className="flex flex-wrap justify-center gap-4 sm:gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <motion.a
          href="mailto:amaramohamedb@gmail.com"
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-3 px-6 sm:px-10 py-3 sm:py-5 bg-gradient-to-r from-card to-accent text-card-foreground rounded-xl hover:shadow-lg hover:shadow-card/20 transition-all duration-300 text-sm sm:text-base"
        >
          <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
          Get In Touch
        </motion.a>
        <motion.a
          href="https://github.com/Shaku-Med"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-3 px-6 sm:px-10 py-3 sm:py-5 bg-secondary text-secondary-foreground rounded-xl hover:shadow-lg hover:shadow-secondary/20 transition-all duration-300 text-sm sm:text-base"
        >
          <Github className="w-5 h-5 sm:w-6 sm:h-6" />
          View My Code
        </motion.a>
        <motion.a
          href="https://www.linkedin.com/in/mohamed-amara-b84447247"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-3 px-6 sm:px-10 py-3 sm:py-5 bg-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-600/20 transition-all duration-300 text-sm sm:text-base"
        >
          <Linkedin className="w-5 h-5 sm:w-6 sm:h-6" />
          Connect
        </motion.a>
      </motion.div>
    </motion.section>
  )
} 