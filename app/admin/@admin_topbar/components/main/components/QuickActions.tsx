import { User, Settings, MessageSquare, HelpCircle, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const quickActions = [
  { label: 'Add User', href: '/admin/users/new', icon: User },
  { label: 'System Settings', href: '/admin/system', icon: Settings },
  { label: 'Analytics', href: '/admin/analytics', icon: MessageSquare },
  { label: 'Help Center', href: '/admin/help', icon: HelpCircle }
]

export const QuickActions = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="hidden sm:flex hover:bg-accent/50 transition-all duration-200 rounded-xl font-medium text-sm px-2 sm:px-3 py-2 h-auto"
        >
          <span className="hidden sm:inline">Quick Actions</span>
          <ChevronDown className="ml-2 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 backdrop-blur-xl bg-background/95 border-border/50 shadow-2xl" align="end" sideOffset={8}>
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2">
          Quick Actions
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/60" />
        {quickActions.map((action) => (
          <DropdownMenuItem key={action.label} asChild className="hover:bg-accent/60 transition-colors duration-200 rounded-lg mx-2 my-1 cursor-pointer">
            <Link href={action.href} className="flex items-center">
              <action.icon className="mr-3 h-4 w-4" />
              <span className="font-medium">{action.label}</span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 