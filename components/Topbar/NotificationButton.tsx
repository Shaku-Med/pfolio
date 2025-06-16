'use client'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface NotificationButtonProps {
  count: number
}

export const NotificationButton = ({ count }: NotificationButtonProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-9 h-9 rounded-lg hover:bg-accent transition-all duration-300 group relative"
          >
            <Bell className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
            {count > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                {count}
              </div>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent className='z-[100000]'>
          <p>Notifications ({count})</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
} 