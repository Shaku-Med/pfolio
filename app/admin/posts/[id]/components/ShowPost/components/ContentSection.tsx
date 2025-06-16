'use client'

import { ReactNode } from 'react'
import { useIsMobile } from '@/app/hooks/use-mobile'
import { Menu } from 'lucide-react'
import { useComments } from '@/store/comments-context'
interface ContentSectionProps {
  children: ReactNode
}

const ContentSection = ({ children }: ContentSectionProps) => {
  let isMob = useIsMobile()
  const { toggleDesktop } = useComments()
  return (
    <div className="h-full relative overflow-y-auto">

          <div onClick={() => toggleDesktop()} className="absolute top-4 right-2 z-[1000000000001] bg-background/90 backdrop-blur-sm px-6 py-2 rounded-full">
            <Menu/>
          </div>
      {children}
    </div>
  )
}

export default ContentSection 