'use client'

import { ReactNode } from 'react'

interface CommentsSectionProps {
  children: ReactNode
}

const CommentsSection = ({ children }: CommentsSectionProps) => {
  return (
    <div className="h-full w-full relative border-l">
      <div className="max-w-full w-full h-full absolute">
        {children}
      </div>
    </div>
  )
}

export default CommentsSection 