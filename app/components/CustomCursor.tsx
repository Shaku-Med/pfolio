'use client'
import React from 'react'
import { useMouseEffects } from '@/app/hooks/useMouseEffects'

const CustomCursor: React.FC = () => {
  const { mousePosition } = useMouseEffects()

  return (
    // <div 
    //   className="fixed sm:block hidden top-0 left-0 w-20 h-20 pointer-events-none z-[1000001] mix-blend-difference transition-transform duration-200 ease-out"
    //   style={{
    //     transform: `translate(${mousePosition.x - 12}px, ${mousePosition.y - 12}px)`,
    //   }}
    // >
    //   <div className="w-full h-full bg-destructive rounded-full opacity-80 animate-pulse"></div>
    // </div>
    <></>
  )
}

export default CustomCursor 