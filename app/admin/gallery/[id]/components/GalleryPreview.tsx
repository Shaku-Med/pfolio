'use client'
import React from 'react'
import { ErrorCard } from '@/app/posts/[id]/ErrorCard'
import { Gallery } from '@/app/admin/projects/page'
import GalleryPreviewItem from './GalleryPreviewItem'
import { Swiper, SwiperSlide } from 'swiper/react'
import {Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'

interface GalleryPreviewProps {
    gallery: Gallery[]
}

const GalleryPreview = ({ gallery }: GalleryPreviewProps) => {
  try {
    return (
      <div className="relative w-full">
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          loop={true}
          className="w-full"
        >
          {gallery.map((item) => (
            <SwiperSlide className='bg-black z-[100000001]' key={item.id}>
              <GalleryPreviewItem gallery={item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    )
  } catch {
    return <ErrorCard title="Failed to Load" message="Gallery data is missing or invalid." />
  }
}

export default GalleryPreview
