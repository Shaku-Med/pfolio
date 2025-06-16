import { Bell, Clock, AlertCircle, User, Shield, Zap } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Notification {
  id: number
  type: string
  title: string
  message: string
  time: string
  unread: boolean
  icon: any
  color: string
}

interface NotificationsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const notifications: Notification[] = [
  {
    id: 1,
    type: 'alert',
    title: 'System Alert',
    message: 'High CPU usage detected on server-01',
    time: '2 min ago',
    unread: true,
    icon: AlertCircle,
    color: 'text-red-500'
  },
  {
    id: 2,
    type: 'message',
    title: 'New User Registration',
    message: 'John Doe has registered for an account',
    time: '5 min ago',
    unread: true,
    icon: User,
    color: 'text-blue-500'
  },
  {
    id: 3,
    type: 'update',
    title: 'System Update',
    message: 'Security patch v2.1.3 has been applied',
    time: '1 hour ago',
    unread: false,
    icon: Shield,
    color: 'text-green-500'
  },
  {
    id: 4,
    type: 'performance',
    title: 'Performance Boost',
    message: 'Database optimization completed successfully',
    time: '2 hours ago',
    unread: false,
    icon: Zap,
    color: 'text-yellow-500'
  }
]

export const Notifications = ({ open, onOpenChange }: NotificationsProps) => {
  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative hover:bg-accent/50 transition-all duration-200 rounded-xl group"
        >
          <Bell className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 p-0 text-[10px] sm:text-xs font-semibold animate-pulse shadow-lg shadow-destructive/30 flex items-center justify-center"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[calc(100vw-2rem)] sm:w-96 backdrop-blur-xl bg-background/95 border-border/50 shadow-2xl" align="end" sideOffset={8}>
        <div className="flex items-center justify-between p-3 sm:p-4">
          <DropdownMenuLabel className="text-sm font-semibold p-0">
            Notifications
          </DropdownMenuLabel>
          <Button variant="ghost" size="sm" className="text-xs hover:bg-accent/60 rounded-lg">
            Mark all read
          </Button>
        </div>
        <DropdownMenuSeparator className="bg-border/60" />
        <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto">
          {notifications.map((notification) => (
            <div key={notification.id} className="hover:bg-accent/30 transition-colors duration-200 mx-2 my-1 rounded-lg">
              <div className="flex items-start space-x-3 p-2 sm:p-3">
                <div className={`flex-shrink-0 p-1.5 rounded-lg bg-accent/50 ${notification.color}`}>
                  <notification.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">
                      {notification.title}
                    </p>
                    {notification.unread && (
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 ml-2" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {notification.time}
                    </span>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs hover:bg-accent/60 rounded">
                      {notification.unread ? 'Mark read' : 'Read'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <DropdownMenuSeparator className="bg-border/60" />
        <div className="p-2">
          <Button variant="ghost" className="w-full justify-center text-sm hover:bg-accent/60 rounded-lg">
            View all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 