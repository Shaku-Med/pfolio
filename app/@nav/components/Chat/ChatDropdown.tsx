import React from 'react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel 
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { 
  MoreHorizontal,
  Pin,
  Bell,
  BellOff,
  Star,
  Info,
  Share,
  Download,
  Archive,
  Settings,
  Trash2
} from 'lucide-react'

interface ChatDropdownProps {
  isPinned: boolean
  isMuted: boolean
  isArchived: boolean
  onTogglePin?: () => void
  onToggleMute?: () => void
  onArchive?: () => void
  onSettings?: () => void
  onShare?: () => void
  onInfo?: () => void
}

const ChatDropdown: React.FC<ChatDropdownProps> = ({
  isPinned,
  isMuted,
  isArchived,
  onTogglePin,
  onToggleMute,
  onArchive,
  onSettings,
  onShare,
  onInfo
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 z-[1000001]">
        <DropdownMenuLabel>Chat Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={onTogglePin} className="flex items-center space-x-2">
          <Pin className="h-4 w-4" />
          <span>{isPinned ? 'Unpin chat' : 'Pin chat'}</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onToggleMute} className="flex items-center space-x-2">
          {isMuted ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
          <span>{isMuted ? 'Unmute notifications' : 'Mute notifications'}</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="flex items-center space-x-2">
          <Star className="h-4 w-4" />
          <span>Add to favorites</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onInfo} className="flex items-center space-x-2">
          <Info className="h-4 w-4" />
          <span>Chat info</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onShare} className="flex items-center space-x-2">
          <Share className="h-4 w-4" />
          <span>Share chat</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Export chat</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onArchive} className="flex items-center space-x-2">
          <Archive className="h-4 w-4" />
          <span>{isArchived ? 'Unarchive' : 'Archive'}</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onSettings} className="flex items-center space-x-2">
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="flex items-center space-x-2 text-red-600">
          <Trash2 className="h-4 w-4" />
          <span>Delete chat</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ChatDropdown 