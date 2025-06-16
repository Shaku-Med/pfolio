import { Gallery } from '@/app/admin/projects/page'
import React, { useState, useEffect } from 'react'
import { ErrorCard } from '@/app/posts/[id]/page'
import NonHls from '@/app/contact/[id]/Body/components/FileHandler/NoNHls/NonHls'
import { cn } from '@/lib/utils'
import { 
  Play,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Calendar,
  Tag,
  User
} from 'lucide-react'
import HlsPlayer from '@/app/contact/[id]/Body/components/FileHandler/HlsPlayer'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';


interface FileData {
  type: string
  url: string
  thumbnail?: string[][]
}

interface ImageControlsProps {
  zoom: number
  rotation: number
  onZoomIn: () => void
  onZoomOut: () => void
  onRotate: () => void
  onReset: () => void
}

const ImageControls: React.FC<ImageControlsProps> = ({
  zoom,
  rotation,
  onZoomIn,
  onZoomOut,
  onRotate,
  onReset
}) => (
  <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
    <div className="flex items-center justify-center gap-2">
      <button 
        onClick={onZoomOut}
        className="p-2 rounded-full hover:bg-white/10 transition-colors"
        disabled={zoom <= 0.5}
      >
        <ZoomOut className="w-4 h-4 text-white" />
      </button>
      
      <span className="text-white text-sm font-medium px-3">
        {Math.round(zoom * 100)}%
      </span>
      
      <button 
        onClick={onZoomIn}
        className="p-2 rounded-full hover:bg-white/10 transition-colors"
        disabled={zoom >= 3}
      >
        <ZoomIn className="w-4 h-4 text-white" />
      </button>
      
      <div className="w-px h-6 bg-white/20 mx-2" />
      
      <button 
        onClick={onRotate}
        className="p-2 rounded-full hover:bg-white/10 transition-colors"
      >
        <RotateCw className="w-4 h-4 text-white" />
      </button>
      
      <button 
        onClick={onReset}
        className="px-3 py-1 rounded-md text-xs text-white hover:bg-white/10 transition-colors"
      >
        Reset
      </button>
    </div>
  </div>
)

const GalleryInfo: React.FC<{ gallery: Gallery }> = ({ gallery }) => (
  <div className="absolute bottom-4 left-4 max-w-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
    <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4 text-white">
      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{gallery.title}</h3>
      {gallery.description && (
        <p className="text-sm text-gray-300 mb-3 line-clamp-3">{gallery.description}</p>
      )}
      
      <div className="flex flex-wrap gap-2 mb-3">
        {gallery.tags?.slice(0, 3).map((tag, index) => (
          <span 
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary-foreground rounded-full text-xs"
          >
            <Tag className="w-3 h-3" />
            {tag}
          </span>
        ))}
        {gallery.tags?.length > 3 && (
          <span className="px-2 py-1 bg-white/10 text-white rounded-full text-xs">
            +{gallery.tags.length - 3} more
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <User className="w-3 h-3" />
          <span>User {gallery.user_id.slice(0, 8)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{new Date(gallery.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  </div>
)

const renderMediaContent = (fileData: FileData, gallery: Gallery, className?: string) => {
  if (fileData.type.startsWith('image')) {
    return (
      <>
                <NonHls 
                    message={{
                    file_object: {
                        url: fileData.url,
                        type: 'image/png',
                        totalChunks: fileData.url?.length || 1
                    },
                    chat_id: `${gallery.id}`,
                    user_id: `${gallery.user_id}`,
                    }} 
                    isPreview
                    endpoint='/api/open/'
                    className={cn(
                    "absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out",
                    className
                )}
            />
      </>
    )
  }

  const thumbnailUrl = fileData.thumbnail?.[0]?.[0]?.split('_').splice(0, 2).join('_') || ''
  return (
    <img 
      src={`/api/open/?url=${encodeURIComponent(thumbnailUrl)}&id=${gallery.user_id}&length=${fileData.thumbnail?.[0]?.length}&type=image/png`}
      alt={`${gallery.title} thumbnail`}
      className={cn(
        "absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out",
        className
      )}
    />
  )
}

const ViewVideo: React.FC<{ gallery: Gallery }> = ({ gallery }) => {
  const [showVideo, setShowVideo] = useState(false)
  const thumbnailUrl = gallery?.fileData?.thumbnail?.[0]?.[0]?.split('_').splice(0, 2).join('_') || ''
  let imageUrl = `/api/open/?url=${encodeURIComponent(thumbnailUrl)}&id=${gallery.user_id}&length=${gallery?.fileData?.thumbnail?.[0]?.length}&type=image/png`

  try {
    if(showVideo) {
        return (
            <>
            <div className='relative w-full h-full'>
                <HlsPlayer
                        message={{
                            file_object: {
                            url: gallery?.fileData?.url,
                            type: 'video/mp4',
                            totalChunks: gallery?.fileData?.totalChunks || 1
                            },
                            chat_id: `${gallery?.id}`,
                            user_id: `${gallery?.user_id}`,
                        }}
                        endpoint='/api/open/hls/'
                        poster={imageUrl}
                        className={`relative w-full h-full gallery_view`}
                        autoPlay
                    />
            </div>
            </>
        )
    }
    return (
      <div onClick={e => setShowVideo(!showVideo)} className='relative w-full h-full group overflow-hidden rounded-lg'>
        <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 z-10' />
        
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20'>
          <div className='p-6 bg-primary/90 hover:bg-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-2xl cursor-pointer'>
            <Play className='w-12 h-12 text-primary-foreground ml-1'/>
          </div>
        </div>

        {renderMediaContent(gallery?.fileData, gallery, 'object-contain group-hover:scale-105 transition-transform duration-700')}

        <GalleryInfo gallery={gallery} />
      </div>
    )
  } catch {
    return <ErrorCard title="Failed to Load Video" message="Video content could not be loaded." />
  }
}

const ViewImage: React.FC<{ gallery: Gallery }> = ({ gallery }) => {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5))
  const handleRotate = () => setRotation(prev => (prev + 90) % 360)
  const handleReset = () => {
    setZoom(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      e.preventDefault()
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragStart && zoom > 1) {
      e.preventDefault()
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => setDragStart(null)

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    if (e.deltaY < 0) {
      handleZoomIn()
    } else {
      handleZoomOut()
    }
  }

  try {
    return (
    <TransformWrapper>
    <TransformComponent contentClass='relative w-full h-full' wrapperStyle={{width: `100%`, height: `100%`}} contentStyle={{width: `100%`, height: `100%`}}>
      <div className='relative w-full h-full group overflow-hidden rounded-lg'>
        <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 z-10' />
        
          <div
            className="w-full h-full relative"
          >
            {renderMediaContent(gallery?.fileData, gallery, 'object-contain group-hover:scale-105 transition-transform duration-700')}
          </div>

        {/* <ImageControls
          zoom={zoom}
          rotation={rotation}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onRotate={handleRotate}
          onReset={handleReset}
          /> */}

        <GalleryInfo gallery={gallery} />
      </div>
        </TransformComponent>
    </TransformWrapper>
    )
  } catch {
    return <ErrorCard title="Failed to Load Image" message="Image content could not be loaded." />
  }
}

const GalleryPreviewItem: React.FC<{ gallery: Gallery }> = ({ gallery }) => {
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className='w-full relative min-h-[80vh] bg-gradient-to-br from-muted/50 to-muted rounded-lg flex items-center justify-center'>
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className='w-full relative min-h-[80vh] '>
      <div className='w-full h-full absolute inset-0'>
        {gallery?.fileData?.type?.startsWith('video') ? (
          <ViewVideo gallery={gallery} />
        ) : (
          <ViewImage gallery={gallery} />
        )}
      </div>
    </div>
  )
}

export default GalleryPreviewItem