'use client'
import React, { useState, useRef, useEffect, useLayoutEffect, useContext } from 'react'
import { 
  User, 
  MoreHorizontal, 
  Heart, 
  MessageCircle, 
  Share, 
  Bookmark,
  MapPin,
  Clock,
  Eye,
  ThumbsUp,
  Zap,
  Flag,
  UserX,
  Download,
  Copy,
  ExternalLink,
  Files,
  Play,
  Image as ImageIcon,
  Video,
  ChevronLeft,
  ChevronRight,
  Music
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Post } from '@/app/admin/posts/[id]/page'
import { Admin } from '@/app/contact/[id]/context/types'
import NonHls from '@/app/contact/[id]/Body/components/FileHandler/NoNHls/NonHls'
import HlsPlayer from '@/app/contact/[id]/Body/components/FileHandler/HlsPlayer'
import { format } from 'date-fns'
import { DeviceFingerprintGenerator } from '@/app/contact/components/NoLibrary/FingerPrint'
import { ContextProvider } from '../Context/ContextProvider'
import Link from 'next/link'
import SocialInteractions from '@/components/home/SocialInteractions'
import HandleLiking from '@/app/posts/components/Action/HandleLiking'
import { toast } from 'sonner'
import HandleViews from '@/app/posts/components/Action/HandleViews'

interface SocialStats {
  likes: number
  comments: number
  shares: number
  views: number
  isLiked: boolean
  isBookmarked: boolean
}

interface ImageCardProps {
  type?: 'canvas' | 'image'
  onDrawCanvas?: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void
  post?: Post
  admin?: Admin
  routeURL?: string
}

const ImageCard: React.FC<ImageCardProps> = ({
  onDrawCanvas,
  post,
  type,
  admin,
  routeURL
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [showInteractionRipple, setShowInteractionRipple] = useState(false)
  const [removePoster, setRemovePoster] = useState(false)
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { fingerPrint } = useContext(ContextProvider);
  const [isLikeDebounced, setIsLikeDebounced] = useState(false)
  const [clientID, setClientID] = useState<string | null>(null)
  const [isViewed, setIsViewed] = useState(false)
  
  const [socialStats, setSocialStats] = useState<SocialStats>({
    likes: post?.post_likes?.length || 0,
    comments: post?.comments || 0,
    shares: post?.shares || 0,
    views: post?.views || 0,
    isLiked: false,
    isBookmarked: false
  })

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

  useEffect(() => {
    if (type === 'canvas' && onDrawCanvas && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        onDrawCanvas(ctx, canvasRef.current)
      }
    }
  }, [type, onDrawCanvas])

  useLayoutEffect(() => {
    if(post){
      let getFP = async () => {
        try {
          if(!fingerPrint) return;
          const fingerprint = await fingerPrint.generateFingerprint();
          if(fingerprint){
            let id = fingerPrint.generateUniqueId(fingerprint);
            setClientID(id)

            setSocialStats(prev => ({
              ...prev,
              isLiked: post?.post_likes?.some((like: any) => like.user_id === id) || false
            }))
          }
        }
        catch {
          return
        }
      }
      getFP()
    }
  }, [post])

  useEffect(() => {
    if(isViewed) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !isViewed) {
          try {
            setIsViewed(true);
            const view = await HandleViews(post?.id);
            if(view){
              setSocialStats(prev => ({
                ...prev,
                views: prev.views + 1
              }));
            }
            // Stop observing after view is recorded
            if (cardRef.current) {
              observer.unobserve(cardRef.current);
            }
          } catch (error) {
            console.error('Error recording view:', error);
          }
        }
      },
      {
        threshold: 0.5 // Trigger when 50% of the element is visible
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [post?.id, isViewed]);

  const handleLike = async (isLiked: boolean): Promise<void> => {
    if (isLikeDebounced || !clientID) return;
    
    setIsLikeDebounced(true);
    setSocialStats(prev => ({
      ...prev,
      likes: isLiked ? prev.likes + 1 : prev.likes - 1,
      isLiked
    }))
 
    setTimeout(async () => {
      setIsLikeDebounced(false);

      let addlikes = await HandleLiking(post?.id, clientID)
      if(!addlikes){
        toast.error('Failed to like post')
        setSocialStats(prev => ({
          ...prev,
          likes: isLiked ? prev.likes - 1 : prev.likes + 1,
          isLiked: !isLiked
        }))
        return
      }
    }, 1000);
  }

  const handleComment = (): void => {
    // Implement comment functionality
  }

  const handleShare = (): void => {
    // Implement share functionality
  }

  const handleBookmark = (): void => {
    setSocialStats(prev => ({
      ...prev,
      isBookmarked: !prev.isBookmarked
    }))
  }

  const handlePlayVideo = (): void => {
    setRemovePoster(true)
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Unknown date'
    try {
      return format(new Date(dateString), 'MMM dd, yyyy')
    } catch {
      return 'Unknown date'
    }
  }

  const getMediaTypeIcon = (fileType: string) => {
    if (fileType?.startsWith('image')) return <ImageIcon className="w-4 h-4" />
    if (fileType?.startsWith('video')) return <Video className="w-4 h-4" />
    if (fileType?.startsWith('audio')) return <Music className="w-4 h-4" />
    return <Files className="w-4 h-4" />
  }

  const renderMediaContent = () => {
    if (type === 'canvas') {
      return (
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover transition-all duration-500 ease-out"
        />
      )
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
      <div className="relative w-full h-full ">
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
            {removePoster ? (
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
            ) : (
              <div className="relative w-full">
                {currentFile?.thumbnail && Array.isArray(currentFile?.thumbnail) ? (
                  <div 
                    className="relative cursor-pointer group w-full"
                    onClick={handlePlayVideo}
                  >
                    <img 
                      src={`/api/open/?url=${encodeURIComponent(currentFile.thumbnail[0]?.split('_').splice(0,2).join('_') || '')}&id=${post?.user_id}&length=${currentFile?.thumbnail?.length}&type=image/png`}
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
                  <div className="w-full h-64 bg-muted/50 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <Video className="w-12 h-12 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">Video file</p>
                    </div>
                  </div>
                )}
              </div>
            )}
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

        {!isImage && !isVideo && !isAudio && (
          <div className="w-full h-64 bg-muted/50 flex items-center justify-center">
            <div className="text-center space-y-2">
              <Files className="w-12 h-12 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Unsupported file type</p>
            </div>
          </div>
        )}

        {/* Media Counter */}
        {post.post_file.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="text-white text-xs font-medium">
              {currentMediaIndex + 1}/{post.post_file.length}
            </span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div ref={cardRef} className="bg-card rounded-2xl shadow-xl border border-border/50 overflow-hidden max-w-lg w-full backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              {admin?.avatar?.url ? (
                <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary/20">
                  <NonHls 
                    message={{
                      file_object: {
                        url: admin.avatar.url,
                        type: 'image/png',
                        totalChunks: admin.avatar.totalChunks || 1
                      },
                      user_id: admin.user_id,
                      chat_id: `${post?.id}`,
                    }} 
                    isPreview
                    endpoint={'/api/open/'}
                  />
                </div>
              ) : (
                <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link href={`${routeURL || '/posts'}/${post?.id}`} className="hover:underline">
                  <h4 className="font-semibold line-clamp-1 text-foreground text-sm truncate">
                    {post?.text?.slice(0, post?.text?.length / 1.1) || `Mohamed Amara`}
                  </h4>
                </Link>
                <Badge variant="secondary" className="h-4 px-1.5 bg-blue-500/10 text-blue-600 border-blue-500/20 flex-shrink-0">
                  <Zap className="w-2.5 h-2.5" />
                </Badge>
              </div>
              
              {post?.location && (
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  <p className="text-xs text-muted-foreground truncate">
                    {post.location}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-muted/50 flex-shrink-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="cursor-pointer">
                <Share className="w-4 h-4 mr-2" />
                Share Post
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Download className="w-4 h-4 mr-2" />
                Download Media
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href={`${routeURL || '/posts'}/${post?.id}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in New Tab
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-orange-600 focus:text-orange-600">
                <Flag className="w-4 h-4 mr-2" />
                Report Post
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                <UserX className="w-4 h-4 mr-2" />
                Block User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Media Content */}
      <div className="relative aspect-square overflow-hidden bg-muted/20">
        {renderMediaContent()}

        {/* Like Animation Ripple */}
        {showInteractionRipple && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <div className="relative">
              <Heart className="w-16 h-16 text-red-500 fill-red-500 animate-bounce" />
              <div className="absolute inset-0 w-16 h-16 rounded-full bg-red-500/20 animate-ping" />
            </div>
          </div>
        )}

        {/* Views Counter Overlay */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md rounded-full px-2.5 py-1 flex items-center gap-1">
          <Eye className="w-3 h-3 text-white" />
          <span className="text-white text-xs font-medium">
            {formatNumber(socialStats.views)}
          </span>
        </div>
      </div>

      {/* Actions & Content */}
      {
        clientID && (
          <div className="  p-4 space-y-3 bg-card/80 backdrop-blur-sm">
            <SocialInteractions
              initialStats={{
                likes: socialStats.likes,
                comments: socialStats.comments,
                shares: socialStats.shares,
                views: socialStats.views,
                isLiked: socialStats.isLiked
              }}
              onLike={(isLiked) => handleLike(isLiked)}
              onComment={handleComment}
              onShare={handleShare}
              showViews={true}
              showComment={true}
              postId={post?.id}
            />

            {/* Content */}
            {post?.description && (
              <div className="space-y-2">
                <p className="text-sm text-foreground line-clamp-2 leading-relaxed">
                  <span className="font-semibold text-primary">
                    {post?.text}
                  </span>{' '}
                  {post.description?.slice(0, post?.description?.length / 1.2)}...
                </p>
                
                {post?.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {post?.tags?.splice(0, 6).map((tag, index) => {
                      return (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="text-xs bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer transition-colors"
                      >
                        #{tag}
                        </Badge>
                      )
                    })}
                    {
                      post?.tags?.length > 6 && (
                        <Badge 
                          variant="secondary" 
                          className="text-xs bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer transition-colors"
                        >
                          +{post?.tags?.length - 6} more
                        </Badge>
                      )
                    }
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/30">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatDate(post?.created_at)}</span>
              </div>
              
              {post?.post_file && post.post_file.length > 0 && (
                <div className="flex items-center gap-1">
                  {getMediaTypeIcon(post.post_file[0]?.fileType)}
                  <span>
                    {post.post_file.length} media file{post.post_file.length > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        )
      }
    </div>
  )
}

export default ImageCard