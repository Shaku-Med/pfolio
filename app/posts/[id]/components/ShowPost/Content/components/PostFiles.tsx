'use client'
import React, { useState } from 'react'
import { Post } from '../../../../utils'
import { ChevronLeft, ChevronRight, Image as ImageIcon, Video, Music, Files } from 'lucide-react'
import NonHls from '@/app/contact/[id]/Body/components/FileHandler/NoNHls/NonHls'
import HlsPlayer from '@/app/contact/[id]/Body/components/FileHandler/HlsPlayer'

interface PostFilesProps {
  post?: Post
}

const PostFiles: React.FC<PostFilesProps> = ({ post }) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)

  const handleNextMedia = () => {
    if (post?.post_file) {
      setCurrentMediaIndex((prev) => (prev + 1) % post.post_file.length)
    }
  }

  const handlePrevMedia = () => {
    if (post?.post_file) {
      setCurrentMediaIndex((prev) => (prev - 1 + post.post_file.length) % post.post_file.length)
    }
  }

  const getMediaTypeIcon = (fileType: string) => {
    if (fileType?.startsWith('image')) return <ImageIcon className="w-4 h-4" />
    if (fileType?.startsWith('video')) return <Video className="w-4 h-4" />
    if (fileType?.startsWith('audio')) return <Music className="w-4 h-4" />
    return <Files className="w-4 h-4" />
  }

  if (!post?.post_file || post.post_file.length === 0) {
    return (
      <div className="w-full h-64 bg-muted/50 flex items-center justify-center">
        <div className="text-center space-y-2">
          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">No media attached</p>
        </div>
      </div>
    )
  }

  const currentFile = post.post_file[currentMediaIndex]
  const isImage = currentFile?.fileType?.startsWith('image')
  const isVideo = currentFile?.fileType?.startsWith('video')
  const isAudio = currentFile?.fileType?.startsWith('audio')

  return (
    <div className="relative w-full h-full">
      {/* Navigation Buttons */}
      {post.post_file.length > 1 && (
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
      {post.post_file.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {post.post_file.map((_, index) => (
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
        <div className="w-full h-full bg-black flex items-center justify-center">
          <NonHls 
            message={{
              file_object: {
                url: currentFile?.url,
                type: 'image/png',
                totalChunks: currentFile?.totalChunks || 1
              },
              chat_id: `${post?.id}`,
              user_id: `${post?.user_id}`,
            }} 
            isPreview
            endpoint={'/api/open/'}
          />
        </div>
      )}

      {isVideo && (
        <div className="w-full h-full bg-black flex items-center justify-center">
              <HlsPlayer
              message={{
                file_object: {
                  url: currentFile?.url,
                  type: 'video/mp4',
                  totalChunks: currentFile?.totalChunks || 1
                },
                chat_id: `${post?.id}`,
                user_id: `${post?.user_id}`,
              }}
              endpoint='/api/open/hls/'
              poster={currentFile?.thumbnail && Array.isArray(currentFile?.thumbnail) 
                ? `/api/open/?url=${encodeURIComponent(currentFile.thumbnail[0]?.split('_').splice(0,2).join('_') || '')}&id=${post?.user_id}&length=${currentFile?.thumbnail?.length}&type=image/png`
                : ''}
                className={`relative w-full h-full`}
            />
        </div>
      )}

      {isAudio && (
        <div className="w-full h-full bg-black flex items-center justify-center">
            <HlsPlayer
              message={{
                file_object: {
                  url: currentFile?.url,
                  type: currentFile?.fileType || 'audio/mpeg',
                  totalChunks: currentFile?.totalChunks || 1
                },
                chat_id: `${post?.id}`,
                user_id: `${post?.user_id}`,
              }}
              isAudio={true}
              endpoint='/api/open/hls/'
              className="w-full h-full"
              post={post}
            />
        </div>
      )}
    </div>
  )
}

export default PostFiles 