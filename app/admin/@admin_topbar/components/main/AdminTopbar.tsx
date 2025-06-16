'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { 
  User, 
  LogOut, 
  Settings, 
  HelpCircle, 
  Command,
  ChevronDown,
  Home,
  BarChart2,
  Users
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import MobileNav from './components/MobileNav'
import { Search } from './components/Search'
import { QuickActions } from './components/QuickActions'
import { Notifications } from './components/Notifications'
import { useDeviceStatus } from '@/app/hooks/useDeviceStatus'
import { useScrollPosition } from '@/app/hooks/useScrollPosition'

const AdminTopbar = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const { isMobileInstalledPortrait } = useDeviceStatus()
  const isScrolled = useScrollPosition(50)

  return (
    <div className={`bg-background/95 backdrop-blur-2xl px-2 border-b border-border/50 w-full z-50 supports-[backdrop-filter]:bg-background/80 flex justify-center items-center ${
        (isMobileInstalledPortrait) && isScrolled 
          ? 'pt-[50px] sticky top-0' 
          : `${isMobileInstalledPortrait ? 'pt-[50px]' : 'pt-0'} sticky top-0 w-full`
      }`}>
      <div className=" container px-2 sm:px-4 md:px-6 lg:px-8 w-full">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <div className="flex items-center flex-1">
            <MobileNav 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              open={mobileNavOpen}
              onOpenChange={setMobileNavOpen}
            />
            
            <div className="flex items-center space-x-4 sm:space-x-8">
              <div className="flex items-center space-x-4 sm:space-x-6">
                <Link href="/admin" className="flex items-center space-x-2 group">
                  <div className="w-7 h-7 min-w-7 sm:w-8 sm:h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <img src={`/Icons/web/icon-512.png`} className="h-8 w-8 min-w-8 text-primary-foreground" />
                  </div>
                  <span className="font-bold text-base sm:text-lg bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent hidden sm:block">
                    Admin
                  </span>
                </Link>
              </div>

              <nav className="hidden md:flex items-center space-x-1">
                {[
                  { name: 'Home', href: '/admin', icon: Home },
                  { name: 'Users', href: '/admin/users', icon: Users },
                  { name: 'Projects', href: '/admin/projects', icon: BarChart2 },
                  { name: 'Settings', href: '/admin/settings', icon: Settings }
                ].map((item) => (
                  <Button 
                    key={item.name}
                    variant="ghost" 
                    asChild 
                    className="hover:bg-accent/60 transition-all duration-200 rounded-xl font-medium relative group"
                  >
                    <Link href={item.href} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {item.name}
                      <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </Link>
                  </Button>
                ))}
              </nav>
            </div>

            <Search 
              query={searchQuery}
              onSearchChange={setSearchQuery}
              onMobileClick={() => setMobileNavOpen(true)}
            />
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            <QuickActions />
            <Notifications 
              open={notificationsOpen}
              onOpenChange={setNotificationsOpen}
            />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-accent/50 transition-all duration-200 group"
                >
                  <Avatar className="h-7 w-7 sm:h-9 sm:w-9 ring-2 ring-transparent group-hover:ring-primary/20 transition-all duration-200">
                    <AvatarImage src="/avatars/admin.png" alt="Admin" className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent font-semibold text-xs sm:text-sm">AD</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 border-2 border-background rounded-full" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-[calc(100vw-2rem)] sm:w-72 backdrop-blur-xl bg-background/95 border-border/50 shadow-2xl" 
                align="end" 
                forceMount
                sideOffset={8}
              >
                <DropdownMenuLabel className="font-normal p-3 sm:p-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                      <AvatarImage src="/avatars/admin.png" alt="Admin" className="object-cover" />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent font-semibold">AD</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none">Admin User</p>
                      <p className="text-xs leading-none text-muted-foreground font-medium">
                        admin@example.com
                      </p>
                      <div className="flex items-center space-x-1 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-xs text-green-600 font-medium">Online</span>
                      </div>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/60" />
                <DropdownMenuItem className="hover:bg-accent/60 transition-colors duration-200 rounded-lg mx-2 my-1 cursor-pointer">
                  <User className="mr-3 h-4 w-4" />
                  <span className="font-medium">Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-accent/60 transition-colors duration-200 rounded-lg mx-2 my-1 cursor-pointer">
                  <Settings className="mr-3 h-4 w-4" />
                  <span className="font-medium">Preferences</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-accent/60 transition-colors duration-200 rounded-lg mx-2 my-1 cursor-pointer">
                  <HelpCircle className="mr-3 h-4 w-4" />
                  <span className="font-medium">Help & Support</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/60" />
                <DropdownMenuItem className="hover:bg-destructive/10 text-destructive hover:text-destructive transition-colors duration-200 rounded-lg mx-2 my-1 cursor-pointer">
                  <LogOut className="mr-3 h-4 w-4" />
                  <span className="font-medium">Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminTopbar