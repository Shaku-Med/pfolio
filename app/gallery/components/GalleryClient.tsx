'use client'

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Play, ImageIcon, X, Sparkles, Grid3X3, Heart, MessageCircle, Share, Bookmark, Loader2 } from 'lucide-react'
import { Gallery } from '@/app/admin/projects/page'
import NonHls from '@/app/contact/[id]/Body/components/FileHandler/NoNHls/NonHls'
import { cn } from '@/lib/utils'
import { ErrorCard } from '@/app/posts/[id]/ErrorCard'
import Link from 'next/link'
import LoadMoreImage from '@/app/admin/gallery/components/Action/LoadMoreImage'

type FileData = {
  type: string
  url: string
  thumbnail?: string[][]
}

type MediaType = 'all' | 'image' | 'video'

const renderMediaContent = (fileData: FileData, className?: string, gallery?: Gallery) => {
  if (fileData.type.startsWith('image')) {
    return (
      <NonHls 
        message={{
          file_object: {
            url: fileData.url,
            type: 'image/png',
            totalChunks: fileData.url?.length || 1
          },
          chat_id: `${gallery?.id}`,
          user_id: `${gallery?.user_id}`,
        }} 
        isPreview
        endpoint='/api/open/'
        className={cn("w-full h-full object-cover transition-all duration-700 ease-out", className)}
      />
    )
  }

  const thumbnailUrl = fileData.thumbnail?.[0]?.[0]?.split('_').splice(0, 2).join('_') || ''

  return (
    <img 
      src={`/api/open/?url=${encodeURIComponent(thumbnailUrl)}&id=${gallery?.user_id}&length=${fileData.thumbnail?.[0]?.length}&type=image/png`}
      alt={`${gallery?.title} thumbnail`}
      className={cn("w-full h-full object-cover transition-all duration-700 ease-out", className)}
      onError={e => {
        (e.target as HTMLImageElement).src = `/icons/web/icon-512.png`
      }}
    />
  )
}

interface MasonryGalleryProps {
  items?: Gallery[]
}

const MasonryGallery: React.FC<MasonryGalleryProps> = ({ items }) => {
  const [gallery, setGallery] = useState<Gallery[]>([])
  const [filter, setFilter] = useState<MediaType>('all')
  const [hoveredItem, setHoveredItem] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observerTarget = useRef<HTMLDivElement>(null)
  const itemsPerPage = 12

  if (!items || items.length < 1) {
    return <ErrorCard title="Error" message="No gallery items found" />
  }

  useLayoutEffect(() => {
    setGallery(items)
  }, [])

  const getItemHeight = (key: number): number => {
    const heights = [280, 320, 240, 380, 200, 360, 300, 260, 340, 220]
    return heights[key % heights.length]
  }

  const filteredItems = gallery?.filter(item => {
    if (filter === 'all') return true
    return item.fileData.type.startsWith(filter)
  })

  const imageCount = gallery?.filter(item => item.fileData.type.startsWith('image')).length || 0
  const videoCount = gallery?.filter(item => item.fileData.type.startsWith('video')).length || 0

  const loadMore = async (page: number) => {
    const from = (page - 1) * itemsPerPage
    const to = from + itemsPerPage - 1
    return await LoadMoreImage(itemsPerPage, from, to) || []
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          setLoading(true)
          const nextPage = page + 1
          const newItems = await loadMore(nextPage)
          
          if (newItems.length === 0) {
            setHasMore(false)
          } else {
            setGallery(prev => [...prev, ...newItems])
            setPage(nextPage)
          }
          setLoading(false)
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [page, loading, hasMore])

  try {
    return (
      <div className="min-h-full">
        <div className="relative container mx-auto px-4 py-8">
          <div className="text-center mb-12 space-y-6 border-b pb-12">
            <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
              My Gallery
            </h1>
            
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted">
                <ImageIcon className="w-4 h-4" />
                <span>{imageCount}</span>
              </div>
              <div className="w-1 h-1 bg-muted-foreground rounded-full" />
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted">
                <Play className="w-4 h-4" />
                <span>{videoCount}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('all')}
                className="rounded-full px-4"
              >
                <Grid3X3 className="w-4 h-4 mr-2" />
                All
              </Button>
              <Button
                variant={filter === 'image' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('image')}
                className="rounded-full px-4"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Images
              </Button>
              <Button
                variant={filter === 'video' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('video')}
                className="rounded-full px-4"
              >
                <Play className="w-4 h-4 mr-2" />
                Videos
              </Button>
            </div>
          </div>

          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-1 space-y-1">
            {filteredItems?.map((item, key) => (
              <Link href={`/gallery/${item.id}`} key={key} className="block">
                <div
                  className="break-inside-avoid cursor-pointer border rounded-lg sm:rounded-none shadow-lg group relative overflow-hidden bg-card/10 hover:bg-card hover:shadow-2xl hover:scale-105 hover:z-[100001] transition-all duration-300"
                  onMouseEnter={() => setHoveredItem(key)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div 
                    className="relative overflow-hidden"
                    style={{ height: `${getItemHeight(key)}px` }}
                  >
                    {renderMediaContent(item?.fileData, 'object-contain', item)}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {item?.fileData?.type?.startsWith('video') && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-background/20 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300">
                          <Play className="w-5 h-5 text-foreground ml-0.5" fill="currentColor" />
                        </div>
                      </div>
                    )}

                    <div className={cn(
                      "absolute top-3 left-3 transition-all duration-300",
                      hoveredItem === key || 'ontouchstart' in window ? 'opacity-100' : 'opacity-0 md:opacity-0'
                    )}>
                      <Badge className="bg-background/60 text-foreground border-0 backdrop-blur-md text-xs">
                        {item?.fileData?.type?.startsWith('video') ? (
                          <Play className="w-3 h-3 mr-1" />
                        ) : (
                          <ImageIcon className="w-3 h-3 mr-1" />
                        )}
                        {item?.fileData?.type?.split('/')[0]}
                      </Badge>
                    </div>

                    <div className={cn(
                      "absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/80 to-transparent transition-all duration-300",
                      hoveredItem === key || 'ontouchstart' in window ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 md:opacity-0 md:translate-y-4'
                    )}>
                      <h3 className="font-bold text-foreground text-base leading-tight mb-1">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed mb-2">
                          {item.description.slice(0, 100)}...
                        </p>
                      )}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 3).map((tag, tagIndex) => (
                            <Badge 
                              key={tagIndex}
                              className="text-xs px-2 py-0.5 bg-background/20 text-muted-foreground border-0 backdrop-blur-sm"
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div ref={observerTarget} className="h-10 flex items-center justify-center mt-8">
          {loading && <Loader2 className='w-8 h-8 animate-spin'/>}
          {!loading && !hasMore && (
            <p className="text-muted-foreground text-sm">No more pictures to load</p>
          )}
        </div>
      </div>
    )
  } catch {
    return <ErrorCard title="Error" message="Error loading gallery" />
  }
}

export default MasonryGallery