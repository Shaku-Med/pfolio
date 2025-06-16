'use client'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface SearchButtonProps {
  onOpen: () => void
}

export const SearchButton = ({ onOpen }: SearchButtonProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpen}
            className="w-9 h-9 rounded-lg hover:bg-accent transition-all duration-300 group"
          >
            <Search className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Search (⌘K)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
} 