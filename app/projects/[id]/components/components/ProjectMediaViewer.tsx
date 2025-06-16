'use client'
import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Play, Video, Image as ImageIcon, Files, Music } from 'lucide-react'
import NonHls from '@/app/contact/[id]/Body/components/FileHandler/NoNHls/NonHls'
import HlsPlayer from '@/app/contact/[id]/Body/components/FileHandler/HlsPlayer'
import {v4 as uuid} from 'uuid'
interface ProjectMediaViewerProps {
  files: Array<{
    url: string
    fileType: string
    totalChunks?: number
    thumbnail?: string[]
    customName?: string
  }>
  projectId: string
  userId: string
  defaultIndex?: number
}

const ProjectMediaViewer: React.FC<ProjectMediaViewerProps> = ({
  files,
  projectId,
  userId,
  defaultIndex = 0
}) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(defaultIndex)
  const [removePoster, setRemovePoster] = useState(false)

  const handleNextMedia = () => {
    if (files) {
      setCurrentMediaIndex((prev) => (prev + 1) % files.length)
    }
  }

  const handlePrevMedia = () => {
    if (files) {
      setCurrentMediaIndex((prev) => (prev - 1 + files.length) % files.length)
    }
  }

  const handlePlayVideo = () => {
    setRemovePoster(true)
  }

  const getMediaTypeIcon = (fileType: string) => {
    if (fileType?.startsWith('image')) return <ImageIcon className="w-4 h-4" />
    if (fileType?.startsWith('video')) return <Video className="w-4 h-4" />
    if (fileType?.startsWith('audio')) return <Music className="w-4 h-4" />
    return <Files className="w-4 h-4" />
  }

  const renderMediaContent = () => {
    if (!files || files.length === 0) {
      return (
        <div className="w-full h-64 bg-muted/50 flex items-center justify-center">
          <div className="text-center space-y-2">
            <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">No media attached</p>
          </div>
        </div>
      )
    }

    const currentFile = files[currentMediaIndex]

    // Improved file type detection
    const fileType = currentFile?.fileType?.toLowerCase() || ''
    const isImage = fileType.startsWith('image')
    const isVideo = fileType.startsWith('video') || fileType.includes('mp4') || fileType.includes('webm')
    const isAudio = fileType.startsWith('audio')

    return (
      <div className="relative w-full h-full">
        {/* Navigation Buttons */}
        {files.length > 1 && (
          <>
            <button
              onClick={handlePrevMedia}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-300 hover:scale-110"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNextMedia}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-300 hover:scale-110"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Media Indicators */}
        {files.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {files.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentMediaIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentMediaIndex ? 'bg-white scale-125' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Current Media */}
        {isImage && (
          <div className="w-full h-full absolute top-0 left-0">
            <NonHls 
              message={{
                file_object: {
                  url: currentFile?.url,
                  type: 'image/png',
                  totalChunks: currentFile?.totalChunks || 1
                },
                chat_id: `${files[currentMediaIndex]?.customName}`,
                user_id: userId,
              }} 
              isPreview
              endpoint={'/api/open/'}
              className={` `}
            />
          </div>
        )}

        {isVideo && (
          <div className="w-full h-full bg-black flex items-center justify-center">
            {removePoster ? (
              <HlsPlayer
                message={{
                  file_object: {
                    url: currentFile?.url,
                    type: fileType || 'video/mp4',
                    totalChunks: currentFile?.totalChunks || 1
                  },
                  chat_id: projectId,
                  user_id: userId,
                }}
                endpoint='/api/open/hls/'
                poster={currentFile?.thumbnail && Array.isArray(currentFile?.thumbnail) 
                  ? `/api/open/?url=${encodeURIComponent(currentFile.thumbnail[0]?.split('_').splice(0,2).join('_') || '')}&id=${userId}&length=${currentFile?.thumbnail?.length}&type=image/png`
                  : ''}
                className="relative w-full h-full"
              />
            ) : (
              <div className="relative w-full">
                {currentFile?.thumbnail && Array.isArray(currentFile?.thumbnail) ? (
                  <div 
                    className="relative cursor-pointer group w-full"
                    onClick={handlePlayVideo}
                  >
                    <img 
                      src={`/api/open/?url=${encodeURIComponent(currentFile.thumbnail[0]?.split('_').splice(0,2).join('_') || '')}&id=${userId}&length=${currentFile?.thumbnail?.length}&type=image/png`}
                      alt="Video thumbnail" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="w-16 h-16 bg-black/60 rounded-full flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-all duration-300">
                        <Play className="w-8 h-8 text-white ml-1" fill="white" />
                      </div>
                    </div>
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                      <Video className="w-3 h-3 text-white" />
                      <span className="text-white text-xs font-medium">Video</span>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="w-full h-64 bg-muted/50 flex items-center justify-center cursor-pointer"
                    onClick={handlePlayVideo}
                  >
                    <div className="text-center space-y-2">
                      <div className="w-16 h-16 bg-black/60 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-all duration-300">
                        <Play className="w-8 h-8 text-white ml-1" fill="white" />
                      </div>
                      <p className="text-sm text-muted-foreground">Click to play video</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {isAudio && (
          <div className="w-full h-64 bg-muted/50 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-black/60 rounded-full flex items-center justify-center mx-auto">
                <Music className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">{currentFile?.customName || 'Audio file'}</p>
                <audio 
                  controls 
                  className="w-full max-w-md"
                  src={currentFile?.url}
                >
                  Your browser does not support the audio element.
                </audio>
              </div>
            </div>
          </div>
        )}

        {!isImage && !isVideo && !isAudio && (
          <div className="w-full h-64 bg-muted/50 flex items-center justify-center">
            <div className="text-center space-y-2">
              <Files className="w-12 h-12 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Unsupported file type</p>
            </div>
          </div>
        )}

        {/* Media Counter */}
        {files.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="text-white text-xs font-medium">
              {currentMediaIndex + 1}/{files.length}
            </span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full h-full min-h-screen relative">
      {renderMediaContent()}
    </div>
  )
}

export default ProjectMediaViewer 