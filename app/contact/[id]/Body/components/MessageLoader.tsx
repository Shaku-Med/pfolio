import React from 'react'

interface MessageLoaderProps {
  variant?: 'dots' | 'pulse' | 'wave' | 'skeleton'
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

const MessageLoader: React.FC<MessageLoaderProps> = ({ 
  variant = 'dots', 
  size = 'md', 
  text = 'Loading messages...',
  className = '' 
}) => {
  const sizeClasses = {
    sm: { container: 'py-2', dot: 'w-2 h-2', text: 'text-xs' },
    md: { container: 'py-4', dot: 'w-3 h-3', text: 'text-sm' },
    lg: { container: 'py-6', dot: 'w-4 h-4', text: 'text-base' }
  }

  const currentSize = sizeClasses[size]

  const DotsLoader = () => (
    <div className="flex items-center space-x-2">
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`${currentSize.dot} bg-primary/60 rounded-full animate-bounce`}
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: '0.8s'
            }}
          />
        ))}
      </div>
      <span className={`${currentSize.text} text-muted-foreground font-medium ml-3`}>
        {text}
      </span>
    </div>
  )

  const PulseLoader = () => (
    <div className="flex items-center space-x-3">
      <div className="relative">
        <div className="w-8 h-8 bg-primary/20 rounded-full animate-ping" />
        <div className="absolute inset-0 w-8 h-8 bg-primary/40 rounded-full animate-pulse" />
      </div>
      <span className={`${currentSize.text} text-muted-foreground font-medium`}>
        {text}
      </span>
    </div>
  )

  const WaveLoader = () => (
    <div className="flex items-center space-x-3">
      <div className="flex space-x-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-1 bg-primary/60 rounded-full animate-pulse"
            style={{
              height: '20px',
              animationDelay: `${i * 0.1}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
      <span className={`${currentSize.text} text-muted-foreground font-medium`}>
        {text}
      </span>
    </div>
  )

  const SkeletonLoader = () => (
    <div className="space-y-3">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-muted/60 rounded-full animate-pulse" />
        <span className={`${currentSize.text} text-muted-foreground font-medium`}>
          {text}
        </span>
      </div>
      <div className="space-y-2">
        {[0, 1].map((i) => (
          <div key={i} className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-muted/40 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted/40 rounded animate-pulse" style={{ width: `${70 + Math.random() * 30}%` }} />
              <div className="h-3 bg-muted/30 rounded animate-pulse" style={{ width: `${40 + Math.random() * 40}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderLoader = () => {
    switch (variant) {
      case 'pulse':
        return <PulseLoader />
      case 'wave':
        return <WaveLoader />
      case 'skeleton':
        return <SkeletonLoader />
      default:
        return <DotsLoader />
    }
  }

  return (
    <div className={`flex justify-center items-center ${currentSize.container} ${className}`}>
      <div className="bg-background/80 backdrop-blur-sm rounded-lg px-4 py-3 border border-border/20 shadow-sm">
        {renderLoader()}
      </div>
    </div>
  )
}

export default MessageLoader