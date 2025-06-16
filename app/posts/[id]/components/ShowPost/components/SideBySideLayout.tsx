'use client'

import { ReactNode, useEffect } from 'react'
import ContentSection from './ContentSection'
import CommentsSection from './CommentsSection'
import ToggleButton from './ToggleButton'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { MessageSquare } from 'lucide-react'
import { useComments } from '@/store/comments-context'
import { useIsMobile } from '@/app/hooks/use-mobile'

interface SideBySideLayoutProps {
  content: ReactNode
  comments: ReactNode
}

const SideBySideLayout = ({
  content,
  comments
}: SideBySideLayoutProps) => {
  const { isDesktopOpen, toggleDesktop } = useComments()
  let isMob = useIsMobile()

  useEffect(() => {
    toggleDesktop()
  }, [isMob])
  
  return (
    <div className="flex h-full w-full fixed top-0 left-0">
      <div className={`h-full transition-all duration-300 ${isDesktopOpen ? 'w-[calc(100%-400px)]' : 'w-full'}`}>
        <ContentSection>{content}</ContentSection>
      </div>
      
      {/* Desktop Comments Section */}
      <div className={`h-full md:relative fixed top-0 right-0 transition-all duration-300 z-[1000000000001] bg-background ${isDesktopOpen ? 'md:w-[400px] w-full' : 'w-0'}`}>
        <CommentsSection>{comments}</CommentsSection>
      </div>
    </div>
  )
}

export default SideBySideLayout 