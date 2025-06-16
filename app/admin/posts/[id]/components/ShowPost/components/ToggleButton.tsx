'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ToggleButtonProps {
  isOpen: boolean
  onClick: () => void
}

const ToggleButton = ({ isOpen, onClick }: ToggleButtonProps) => {
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      size="icon"
      className="absolute right-0 z-[100000001] top-1/2 -translate-y-1/2 rounded-l-none border-l-0 hidden md:flex"
    >
      {isOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
    </Button>
  )
}

export default ToggleButton 