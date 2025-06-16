'use client'
import React, { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRouter } from 'next/navigation'
import { Gallery } from '@/app/admin/projects/page'
import { Button } from "@/components/ui/button"
import ModalItem from './ModalItem'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useDeviceStatus } from '@/app/hooks/useDeviceStatus'
import GalleryPreviewItem from '@/app/admin/gallery/[id]/components/GalleryPreviewItem'

const GalleryModal = ({ gallery }: { gallery: Gallery[] }) => {
  const nav = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const { isMobileInstalledPortrait } = useDeviceStatus()

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1))
  }, [gallery.length])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1))
  }, [gallery.length])

  return (
    <Dialog onOpenChange={() => {
        if (window.history.length > 2) {
            nav.back()
        } else {
            nav.push('/gallery')
        }
    }} defaultOpen>
      <DialogContent className={`min-w-full ${isMobileInstalledPortrait && `max-h-[90vh]`} h-full rounded-none z-[1000000001] p-0 flex flex-col items-center justify-between w-full bg-black/95 backdrop-blur-xl`}>
          <div className={`w-full h-full flex items-center justify-center relative bg-black/50`}>
            <GalleryPreviewItem gallery={gallery[currentIndex]} />
          </div>

          {gallery.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm hover:bg-black/70 z-10 h-12 w-12 rounded-full transition-all duration-300"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm hover:bg-black/70 z-10 h-12 w-12 rounded-full transition-all duration-300"
                onClick={handleNext}
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </Button>
            </>
          )}

          <div className={`flex w-full gap-2 py-4 items-center justify-center bg-black/50 backdrop-blur-xl overflow-x-auto`}>
            {(gallery || []).map((_, index) => (
              <button
                key={index}
                className={`h-2.5 rounded-full transition-all duration-300 hover:scale-110 ${
                  currentIndex === index ? 'bg-white w-8' : 'bg-white/50 w-2.5'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
      </DialogContent>
    </Dialog>
  )
}

export default GalleryModal
