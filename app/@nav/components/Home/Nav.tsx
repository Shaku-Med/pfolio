'use client'
import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useDeviceStatus } from '@/app/hooks/useDeviceStatus'
import { useScrollPosition } from '@/app/hooks/useScrollPosition'
import { useMouseEffects } from '@/app/hooks/useMouseEffects'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  Menu, 
  Home, 
  User, 
  FolderOpen, 
  Mail, 
  Github,
  Linkedin,
  Twitter,
  Download,
  ExternalLink,
  Zap,
  Heart,
  LucideIcon,
  Sun,
  Moon,
  Bell,
  Settings,
  Coffee,
  Music,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  Command,
  ArrowUp,
  Sparkles,
  Flame,
  Clock,
  Eye
} from 'lucide-react'
import { TimeDisplay } from '@/components/Topbar/TimeDisplay'
import { NotificationButton } from '@/components/Topbar/NotificationButton'
import { isMacOs, isMobile } from 'react-device-detect'

interface NavLink {
  href: string
  label: string
  icon: LucideIcon
}

interface SocialLink {
  icon: LucideIcon
  href: string
  label: string
  gradient?: string
}

interface StatusBadge {
  text: string
  color: string
  pulse: boolean
  icon: LucideIcon
}

interface Activity {
  text: string
  color: string
  icon: LucideIcon
}

interface NavProps {}

const Nav: React.FC<NavProps> = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const [notifications, setNotifications] = useState<number>(3)
  const [isOnline, setIsOnline] = useState<boolean>(true)
  const [batteryLevel, setBatteryLevel] = useState<number>(85)
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false)
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null)
  const pathname = usePathname()
  const { isMobileInstalledPortrait } = useDeviceStatus()
  const isScrolled = useScrollPosition(50)
  const { activeParticles, handleMouseEnter, handleMouseLeave } = useMouseEffects()

  const navLinks: NavLink[] = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/about', label: 'About', icon: User },
    { href: '/projects', label: 'Projects', icon: FolderOpen },
    { href: '/contact', label: 'Contact', icon: Mail },
  ]

  const socialLinks: SocialLink[] = [
    { icon: Github, href: '#', label: 'GitHub', gradient: 'from-gray-700 to-gray-900' },
    { icon: Linkedin, href: '#', label: 'LinkedIn', gradient: 'from-blue-500 to-blue-700' },
    { icon: Twitter, href: '#', label: 'Twitter', gradient: 'from-sky-400 to-blue-500' },
  ]

  const activities: Activity[] = [
    { text: 'Coding', color: 'bg-emerald-500', icon: Coffee },
    { text: 'Learning', color: 'bg-purple-500', icon: Sparkles },
    { text: 'Building', color: 'bg-orange-500', icon: Flame },
    { text: 'Designing', color: 'bg-pink-500', icon: Heart },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentActivity(activities[Math.floor(Math.random() * activities.length)])
    }, 5000)

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      clearInterval(timer)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    const updateBatteryLevel = async () => {
      try {
        if ('getBattery' in navigator) {
          const battery = await (navigator as any).getBattery();
          const updateBatteryInfo = () => {
            setBatteryLevel(Math.round(battery.level * 100));
          };
          
          // Initial battery level
          updateBatteryInfo();
          
          // Listen for battery level changes
          battery.addEventListener('levelchange', updateBatteryInfo);
          
          return () => {
            battery.removeEventListener('levelchange', updateBatteryInfo);
          };
        }
      } catch (error) {
        console.log('Battery API not supported');
      }
    };

    updateBatteryLevel();
  }, []);

  const getStatusBadge = (): StatusBadge => {
    const hour = new Date().getHours()
    if (hour >= 9 && hour <= 17) {
      return { text: 'Available', color: 'bg-emerald-500', pulse: true, icon: Zap }
    } else if (hour >= 18 && hour <= 23) {
      return { text: 'Evening', color: 'bg-amber-500', pulse: false, icon: Coffee }
    } else {
      return { text: 'Sleeping', color: 'bg-slate-500', pulse: false, icon: Moon }
    }
  }

  const status: StatusBadge = getStatusBadge()

  const handleMenuClose = (): void => {
    setIsMenuOpen(false)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <TooltipProvider>
        <nav 
          className={`z-50 transition-all duration-500 z-[100] ${
            (isMobileInstalledPortrait) && isScrolled 
              ? 'pt-[50px] sticky top-0' 
              : `${isMobileInstalledPortrait ? 'pt-[50px]' : 'pt-0'} sticky top-0 w-full`
          }`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className={`absolute inset-0 ${isMobileInstalledPortrait ? `bg-background/80 backdrop-blur-xl border-b border-border/50` : ` ${!isMobile ? `bg-background/80 backdrop-blur-xl` : `bg-background`}`}`}></div>
          
          {isScrolled && (
            <>
              <div className={`absolute bottom-0 left-0 right-0 h-px ${isMobileInstalledPortrait ? `bg-gradient-to-r from-transparent via-primary/30 to-transparent` : `bg-background`}`}></div>
            </>
          )}
          
          {activeParticles.map(particle => (
            <div
              key={particle.id}
              className="absolute w-1 h-1 bg-primary/20 rounded-full animate-ping"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                transform: `scale(${particle.scale})`,
                animationDuration: '3s'
              }}
            />
          ))}

          <div className="relative lg:container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex-shrink-0 group">
                <Link href="/" className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-11 h-11 bg-white overflow-hidden rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-primary/20 transition-all duration-300 group-hover:scale-105 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                      <img src="/Icons/web/icon-512.png" alt="Logo" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -top-1 -right-1">
                      <div className={`w-3 h-3 ${status.color} rounded-full ${status.pulse ? 'animate-pulse' : ''} shadow-sm border-2 border-background`}></div>
                    </div>
                    {currentActivity && (
                      <div className="absolute -bottom-1 -left-1">
                        <div className={`w-3 h-3 ${currentActivity.color} rounded-full animate-bounce shadow-sm border border-background`}></div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                      Mohamed Amara
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground">
                        Software Developer
                      </span>
                      {currentActivity && (
                        <div className="flex items-center space-x-1">
                          <div className="w-1 h-1 bg-muted-foreground/50 rounded-full"></div>
                          <span className="text-xs text-muted-foreground">
                            {currentActivity.text}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </div>

              <div className="hidden lg:flex items-center space-x-2">
                {navLinks.map((link: NavLink, index: number) => {
                  const Icon = link.icon
                  const isActive: boolean = pathname === link.href
                  return (
                    <Tooltip key={link.href}>
                      <TooltipTrigger asChild>
                        <Link
                          href={link.href}
                          className={`group relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 overflow-hidden
                            ${isActive
                              ? 'text-primary-foreground bg-primary shadow-sm'
                              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                            }`}
                        >
                          <div className="relative flex items-center space-x-2 z-10">
                            <Icon className={`w-4 h-4 transition-all duration-300 ${isActive ? '' : 'group-hover:scale-110'}`} />
                            <span>{link.label}</span>
                          </div>
                          
                          {isActive && (
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-primary-foreground/50 rounded-full"></div>
                          )}
                          
                          {!isActive && (
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                          )}
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent className='z-[100000]'>
                        <p>{link.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>

              <div className="hidden lg:flex items-center space-x-3">
                <TimeDisplay />

                {/* <NotificationButton count={notifications} /> */}

                <div className="flex items-center space-x-2">
                  {isOnline ? (
                    <Wifi className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-500" />
                  )}
                  
                  <div className="flex items-center space-x-1">
                    {batteryLevel > 20 ? (
                      <Battery className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <BatteryLow className="w-4 h-4 text-red-500 animate-pulse" />
                    )}
                    <span className="text-xs text-muted-foreground">{!isNaN(batteryLevel) ? batteryLevel : 0}%</span>
                  </div>
                </div>

                <Badge variant="outline" className={`${status.color} text-white border-0 ${status.pulse ? 'animate-pulse' : ''} px-2.5 py-1 text-xs flex items-center space-x-1`}>
                  <status.icon className="w-3 h-3" />
                  <span>{status.text}</span>
                </Badge>
              </div>

              <div className="lg:hidden">
                <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                  <SheetTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="w-11 h-11 rounded-xl hover:bg-accent transition-all duration-300 group relative"
                    >
                      <Menu className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                      {notifications > 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {notifications}
                        </div>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className={`w-full h-full max-w-sm ${isMobileInstalledPortrait && `pt-[35px]`} px-4 bg-background/95 backdrop-blur-xl border-l border-border/80 z-[1000000] overflow-auto`}>
                    <div className="flex flex-col space-y-8 mt-8 h-full w-full">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 bg-white rounded-lg flex items-center justify-center border border-primary/20">
                            <img src="/Icons/web/icon-512.png" alt="Logo" className="w-full h-full object-contain" />
                          </div>
                          <div>
                            <h2 className="text-lg font-semibold text-foreground">
                              Navigation
                            </h2>
                            <p className="text-xs text-muted-foreground">Explore my portfolio</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={`${status.color} text-white border-0 ${status.pulse ? 'animate-pulse' : ''} text-xs`}>
                            {status.text}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-accent/20 rounded-lg border border-border/50">
                        <TimeDisplay />
                        <div className="flex items-center space-x-2">
                          {isOnline ? (
                            <Wifi className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <WifiOff className="w-4 h-4 text-red-500" />
                          )}
                          <div className="flex items-center space-x-1">
                            {batteryLevel > 20 ? (
                              <Battery className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <BatteryLow className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-xs text-muted-foreground">{!isNaN(batteryLevel) ? batteryLevel : 0}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-1">
                        {navLinks.map((link: NavLink, index: number) => {
                          const Icon = link.icon
                          const isActive: boolean = pathname === link.href
                          return (
                            <Link
                              key={link.href}
                              href={link.href}
                              className={`group flex items-center px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 relative
                                ${isActive
                                  ? 'text-primary-foreground bg-primary shadow-sm'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                                }`}
                              onClick={handleMenuClose}
                            >
                              <Icon className={`w-5 h-5 mr-3 transition-all duration-300 ${isActive ? '' : 'group-hover:scale-110'}`} />
                              <span className="flex-1">{link.label}</span>
                              
                              {isActive && (
                                <div className="w-2 h-2 bg-primary-foreground/60 rounded-full"></div>
                              )}
                            </Link>
                          )
                        })}
                      </div>

                      <div className="flex items-center justify-center space-x-2">
                        {socialLinks.map((social: SocialLink) => {
                          const Icon = social.icon
                          return (
                            <Button
                              key={social.label}
                              variant="ghost"
                              size="sm"
                              asChild
                              className={`w-12 h-12 rounded-xl hover:bg-accent transition-all duration-300 group bg-gradient-to-br ${social.gradient} hover:shadow-lg`}
                            >
                              <a href={social.href} target="_blank" rel="noopener noreferrer">
                                <Icon className="w-5 h-5 text-white transition-transform duration-300 group-hover:scale-110" />
                              </a>
                            </Button>
                          )
                        })}
                      </div>

                      <div className="pt-6 border-t border-border/50 space-y-4">
                        <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 group shadow-lg hover:shadow-primary/20">
                          <Eye className="w-4 h-4 mr-2 group-hover:translate-y-0.5 transition-transform duration-300" />
                          View Resume
                        </Button>
                        
                        <div className="text-center space-y-2">
                          <div className="flex items-center justify-center space-x-1 text-xs text-muted-foreground">
                            <span>Made with</span>
                            <Heart className="w-3 h-3 text-red-500 animate-pulse" />
                            <span>by Mohamed</span>
                          </div>
                          <div className="text-xs text-muted-foreground/60">
                            © medzyamara 2025. All rights reserved
                          </div>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </nav>

        {showScrollTop && (
          <Button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-primary/20 transition-all duration-300 group z-40"
          >
            <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
          </Button>
        )}
      </TooltipProvider>
    </>
  )
}

export default Nav