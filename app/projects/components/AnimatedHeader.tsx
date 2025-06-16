'use client'

import { motion } from 'framer-motion'

const AnimatedHeader = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1]
      }}
      className="text-left relative min-w-fit"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-2 md:mb-4 ">
          My Projects
        </h1>
      </motion.div>
    </motion.div>
  )
}

export default AnimatedHeader 