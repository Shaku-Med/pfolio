'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu, Command, Search, Bell, User, Settings, HelpCircle, LogOut, X } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useDeviceStatus } from '@/app/hooks/useDeviceStatus'
interface MobileNavProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

const MobileNav = ({ searchQuery, onSearchChange, open, onOpenChange }: MobileNavProps) => {
  const { isMobileInstalledPortrait } = useDeviceStatus()
  const navigationItems = [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'Users', href: '/admin/users' },
    { name: 'Projects', href: '/admin/projects' },
    { name: 'Settings', href: '/admin/settings' }
  ]

  const quickActions = [
    { label: 'Add User', href: '/admin/users/new', icon: User },
    { label: 'System Settings', href: '/admin/system', icon: Settings },
    { label: 'Projects', href: '/admin/projects', icon: Bell },
    { label: 'Help Center', href: '/admin/help', icon: HelpCircle }
  ]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden hover:bg-accent/50 transition-all duration-200 rounded-xl mr-1"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className={`w-full sm:w-[400px] sm:border-l border-none overflow-y-auto overflow-x-hidden p-0 ${isMobileInstalledPortrait ? 'pt-[50px] pb-10' : 'pt-0'}`}>
        <div className="flex flex-col h-full">
          <SheetHeader className="p-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                  <img src={`/Icons/web/icon-512.png`} className="h-8 w-8 text-primary-foreground" />
                </div>
                <SheetTitle className="text-lg font-bold">Admin Panel</SheetTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="hover:bg-accent/50 transition-all duration-200 rounded-xl"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            {/* Search Bar */}
            <div className="p-4 border-b border-border/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users, settings, logs..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 pr-4 bg-accent/30 border-border/50 focus:bg-background/80 focus:border-primary/50 transition-all duration-200 rounded-xl"
                />
              </div>
            </div>

            {/* Navigation */}
            <div className="p-4">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Navigation</h3>
              <nav className="space-y-1">
                {navigationItems.map((item) => (
                  <Button 
                    key={item.name}
                    variant="ghost" 
                    asChild 
                    className="w-full justify-start hover:bg-accent/60 transition-all duration-200 rounded-xl font-medium"
                  >
                    <Link href={item.href}>
                      {item.name}
                    </Link>
                  </Button>
                ))}
              </nav>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-t border-border/50">
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Quick Actions</h3>
              <div className="space-y-1">
                {quickActions.map((action) => (
                  <Button 
                    key={action.label}
                    variant="ghost" 
                    asChild 
                    className="w-full justify-start hover:bg-accent/60 transition-all duration-200 rounded-xl font-medium"
                  >
                    <Link href={action.href} className="flex items-center">
                      <action.icon className="mr-3 h-4 w-4" />
                      {action.label}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="p-4 border-t border-border/50">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/avatars/admin.png" alt="Admin" className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent font-semibold">AD</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">Admin User</p>
                <p className="text-xs text-muted-foreground truncate">admin@example.com</p>
              </div>
            </div>
            <div className="mt-4 space-y-1">
              <Button 
                variant="ghost" 
                className="w-full justify-start hover:bg-accent/60 transition-all duration-200 rounded-xl font-medium"
              >
                <User className="mr-3 h-4 w-4" />
                Profile Settings
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start hover:bg-accent/60 transition-all duration-200 rounded-xl font-medium"
              >
                <Settings className="mr-3 h-4 w-4" />
                Preferences
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start hover:bg-destructive/10 text-destructive hover:text-destructive transition-all duration-200 rounded-xl font-medium"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default MobileNav 