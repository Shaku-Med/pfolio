'use client'
import React, { useEffect, useState } from 'react'
import { isMobile, isTablet, isBrowser, isAndroid, isIOS } from 'react-device-detect'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Smartphone, Laptop, Tablet, ImageIcon, ZoomIn, X } from 'lucide-react'
import Image from 'next/image'
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { motion, AnimatePresence } from 'framer-motion'

const DownloadPage = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedImageRect, setSelectedImageRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice

    // We no longer need the prompt. Clear it up
    setDeferredPrompt(null)
    setIsInstallable(false)

    // Optionally, send analytics event with outcome
    console.log(`User response to the install prompt: ${outcome}`)
  }

  const getDeviceType = () => {
    if (isMobile) return 'mobile'
    if (isTablet) return 'tablet'
    if (isBrowser) return 'desktop'
    return 'unknown'
  }

  const getDownloadOptions = () => {
    const deviceType = getDeviceType()
    
    if (isAndroid) {
      return {
        title: "Install on Android",
        description: "Add this website to your home screen for the best experience",
        icon: <Smartphone className="w-8 h-8" />,
        action: () => {
          // Show instructions for Android
          alert("To install on Android:\n1. Open this website in Chrome\n2. Tap the menu (⋮)\n3. Select 'Add to Home screen'")
        }
      }
    }
    
    if (isIOS) {
      return {
        title: "Install on iOS",
        description: "Add this website to your home screen for the best experience",
        icon: <Smartphone className="w-8 h-8" />,
        action: () => {
          // Show instructions for iOS
          alert("To install on iOS:\n1. Open this website in Safari\n2. Tap the share button\n3. Select 'Add to Home Screen'")
        }
      }
    }

    return {
      title: "Install on Desktop",
      description: "Install this website as a desktop application",
      icon: <Laptop className="w-8 h-8" />,
      action: handleInstall
    }
  }

  const downloadOption = getDownloadOptions()

  const screenshots = [
    {
      src: `/download/desktop.png`,
      alt: "Desktop App View",
      device: "Desktop"
    },
    {
      src: `/download/mobile.jpg`,
      alt: "Mobile App View",
      device: "Mobile"
    }
  ]

  const handleImageClick = (src: string, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setSelectedImageRect(rect)
    setSelectedImage(src)
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Install Our App</h1>
        <p className="text-center text-muted-foreground mb-12">
          Get the best experience by installing our Progressive Web App
        </p>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {downloadOption.icon}
              {downloadOption.title}
            </CardTitle>
            <CardDescription>{downloadOption.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              size="lg" 
              className="w-full" 
              onClick={downloadOption.action}
              disabled={!isInstallable && !isMobile}
            >
              <Download className="w-5 h-5 mr-2" />
              {isInstallable ? 'Install Now' : 'Install Instructions'}
            </Button>
          </CardContent>
        </Card>

        <div className="mt-16 allow_copy_image">
          <h2 className="text-2xl font-bold text-center mb-8">App Screenshots</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {screenshots.map((screenshot, index) => (
              <Card 
                key={index} 
                className="overflow-hidden group cursor-pointer" 
                onClick={(e) => handleImageClick(screenshot.src, e)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-6 h-6" />
                    {screenshot.device} View
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <motion.div 
                    className="relative aspect-[16/9] w-full overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-white" />
                    </div>
                    <Image
                      src={screenshot.src}
                      alt={screenshot.alt}
                      fill
                      className="object-contain transition-transform duration-300 group-hover:scale-110"
                    />
                  </motion.div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {selectedImage && (
            <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
              <DialogContent className="z-[100000001] max-h-full min-w-full bg-background backdrop-blur-xl p-0 bg-transparent border-none">
                <motion.div 
                  className="relative w-full h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {selectedImage && (
                    <motion.div 
                      className="relative w-full h-[95vh]"
                      initial={{ 
                        scale: selectedImageRect ? selectedImageRect.width / window.innerWidth : 1,
                        x: selectedImageRect ? selectedImageRect.left : 0,
                        y: selectedImageRect ? selectedImageRect.top : 0
                      }}
                      animate={{ 
                        scale: 1,
                        x: 0,
                        y: 0
                      }}
                      exit={{ 
                        scale: selectedImageRect ? selectedImageRect.width / window.innerWidth : 1,
                        x: selectedImageRect ? selectedImageRect.left : 0,
                        y: selectedImageRect ? selectedImageRect.top : 0
                      }}
                      transition={{ 
                        type: "spring",
                        damping: 25,
                        stiffness: 200
                      }}
                    >
                      <Image
                        src={selectedImage}
                        alt="Full size preview"
                        fill
                        className="object-contain"
                        priority
                      />
                    </motion.div>
                  )}
                </motion.div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-6 h-6" />
                Mobile
              </CardTitle>
              <CardDescription>iOS and Android support</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tablet className="w-6 h-6" />
                Tablet
              </CardTitle>
              <CardDescription>Optimized for tablets</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Laptop className="w-6 h-6" />
                Desktop
              </CardTitle>
              <CardDescription>Windows, Mac, and Linux</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default DownloadPage
