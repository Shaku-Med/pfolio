'use client'
import React, { useEffect, useState } from 'react'
import { Heart, Sparkles, Star } from 'lucide-react'
import '../../styles/animations.css'

interface LikeAnimationProps {
  isVisible: boolean
  onAnimationComplete?: () => void
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

const LikeAnimation: React.FC<LikeAnimationProps> = ({
  isVisible,
  onAnimationComplete,
  size = 'md',
  color = '#ef4444'
}) => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; rotation: number; type: 'heart' | 'star' | 'sparkle' }[]>([])
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShowAnimation(true)
      const newParticles = Array.from({ length: 24 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 200 + (Math.random() - 0.5) * 100,
        y: (Math.random() - 0.5) * 200 + (Math.random() - 0.5) * 100,
        rotation: Math.random() * 360,
        type: ['heart', 'star', 'sparkle'][Math.floor(Math.random() * 3)] as 'heart' | 'star' | 'sparkle'
      }))
      setParticles(newParticles)

      const timer = setTimeout(() => {
        setShowAnimation(false)
        setParticles([])
        onAnimationComplete?.()
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [isVisible, onAnimationComplete])

  const getSize = () => {
    switch (size) {
      case 'sm': return 'w-16 h-16'
      case 'lg': return 'w-32 h-32'
      default: return 'w-24 h-24'
    }
  }

  const getParticleSize = () => {
    switch (size) {
      case 'sm': return 'w-3 h-3'
      case 'lg': return 'w-4 h-4'
      default: return 'w-3.5 h-3.5'
    }
  }

  const renderParticle = (particle: typeof particles[0]) => {
    const IconComponent = particle.type === 'heart' ? Heart : particle.type === 'star' ? Star : Sparkles
    return (
      <IconComponent 
        className={`${getParticleSize()} fill-current`}
        style={{ color }}
      />
    )
  }

  if (!isVisible && !showAnimation) return null

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none z-50">
      <div className="heart-main relative">
        <div className="heart-glow rounded-full p-2" style={{ '--heart-color-40': `${color}40`, '--heart-color-80': `${color}80` } as React.CSSProperties}>
          <Heart 
            className={`${getSize()} text-red-500 fill-red-500`}
            style={{ 
              color, 
              fill: color,
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
            }}
          />
        </div>
      </div>

      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle fixed z-[100000] top-0 left-0"
          style={{ 
            '--x': `${particle.x}px`,
            '--y': `${particle.y}px`,
            filter: `drop-shadow(0 0 8px ${color}80)`,
          } as React.CSSProperties}
        >
          {renderParticle(particle)}
        </div>
      ))}

      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`shockwave shockwave-${i} absolute rounded-full border-4`}
          style={{ 
            borderColor: `${color}40`,
            width: size === 'lg' ? '8rem' : size === 'sm' ? '4rem' : '6rem',
            height: size === 'lg' ? '8rem' : size === 'sm' ? '4rem' : '6rem',
            background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`
          }}
        />
      ))}

      <div
        className="conic-spin absolute rounded-full"
        style={{ 
          background: `conic-gradient(from 0deg, ${color}60, transparent, ${color}40, transparent, ${color}60)`,
          width: size === 'lg' ? '12rem' : size === 'sm' ? '6rem' : '9rem',
          height: size === 'lg' ? '12rem' : size === 'sm' ? '6rem' : '9rem',
          filter: 'blur(2px)'
        }}
      />

      <div
        className="radial-bloom absolute rounded-full"
        style={{ 
          background: `radial-gradient(circle, ${color}30 0%, ${color}10 50%, transparent 100%)`,
          width: size === 'lg' ? '16rem' : size === 'sm' ? '8rem' : '12rem',
          height: size === 'lg' ? '16rem' : size === 'sm' ? '8rem' : '12rem',
        }}
      />
    </div>
  )
}

export default LikeAnimation