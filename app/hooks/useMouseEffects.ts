import { useState, useEffect } from 'react'

interface MousePosition {
  x: number
  y: number
}

interface Particle {
  id: number
  x: number
  y: number
  scale: number
}

export const useMouseEffects = () => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState<boolean>(false)
  const [activeParticles, setActiveParticles] = useState<Particle[]>([])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent): void => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (isHovering) {
        const newParticle: Particle = {
          id: Date.now(),
          x: Math.random() * 100,
          y: Math.random() * 100,
          scale: Math.random() * 0.5 + 0.5,
        }
        setActiveParticles(prev => [...prev.slice(-10), newParticle])
      }
    }, 200)
    return () => clearInterval(interval)
  }, [isHovering])

  const handleMouseEnter = (): void => {
    setIsHovering(true)
  }

  const handleMouseLeave = (): void => {
    setIsHovering(false)
  }

  return {
    mousePosition,
    activeParticles,
    handleMouseEnter,
    handleMouseLeave
  }
} 