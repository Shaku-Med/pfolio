'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Mail, 
  Database,
  Menu
} from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useDeviceStatus } from '@/app/hooks/useDeviceStatus'

const navigationItems = [
  { name: 'General', href: '/admin/settings', icon: Settings },
  { name: 'Profile', href: '/admin/settings/profile', icon: User },
  { name: 'Security', href: '/admin/settings/security', icon: Shield },
]

const Sidebar = () => {
  const pathname = usePathname()
  const {isMobileInstalledPortrait} = useDeviceStatus()

  const NavContent = () => (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-semibold tracking-tight">Admin Settings</h2>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-3 rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-accent text-accent-foreground shadow-sm" 
                  : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5 mr-3" />
              <span className="font-medium">{item.name}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-6 bg-primary rounded-full" />
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )

  return (
    <div className="relative">
      <Sheet>
        <SheetTrigger className="lg:hidden fixed bottom-6 left-6 z-50 p-3 rounded-full bg-background border shadow-lg hover:bg-accent/50 transition-colors" asChild>
          <Button variant="ghost" size="icon" className="h-12 w-12">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className={cn(
          "p-0 w-80 max-w-[90vw]",
          isMobileInstalledPortrait ? 'pt-16' : 'pt-0'
        )}>
          <NavContent />
        </SheetContent>
      </Sheet>

      <div className="hidden lg:block w-80 h-screen border-r bg-background">
        <NavContent />
      </div>
    </div>
  )
}

export default Sidebar
