'use client'
import React, { useState } from 'react'
import { Heart, MessageCircle, Share, ThumbsUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import LikeAnimation from './LikeAnimation'
import Link from 'next/link'
import {RWebShare} from 'react-web-share'

export interface SocialStats {
  likes: number
  comments: number
  shares: number
  views?: number
  isLiked: boolean
}

export interface SocialInteractionsProps {
  initialStats?: Partial<SocialStats>
  onLike?: (isLiked: boolean) => void
  onComment?: () => void
  onShare?: () => void
  showViews?: boolean
  className?: string
  buttonSize?: 'sm' | 'md' | 'lg'
  showStats?: boolean
  showComment?: boolean
  postId?: string
}

const SocialInteractions: React.FC<SocialInteractionsProps> = ({
  initialStats = {},
  onLike,
  onComment,
  onShare,
  showViews = false,
  className = '',
  buttonSize = 'md',
  showStats = true,
  showComment = true,
  postId
}) => {
  const [socialStats, setSocialStats] = useState<SocialStats>({
    likes: initialStats.likes || 0,
    comments: initialStats.comments || 0,
    shares: initialStats.shares || 0,
    views: initialStats.views || 0,
    isLiked: initialStats.isLiked || false
  })
  
  const [showLikeAnimation, setShowLikeAnimation] = useState(false)
  const [isLikeDebounced, setIsLikeDebounced] = useState(false)

  const handleLike = () => {
    if (isLikeDebounced) return;
    
    setIsLikeDebounced(true);
    const newIsLiked = !socialStats.isLiked
    setSocialStats(prev => ({
      ...prev,
      likes: newIsLiked ? prev.likes + 1 : prev.likes - 1,
      isLiked: newIsLiked
    }))
    
    if (!socialStats.isLiked) {
      setShowLikeAnimation(true)
    }

    onLike?.(newIsLiked)

    // Reset debounce after 1 second
    setTimeout(() => {
      setIsLikeDebounced(false);
    }, 1000);
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

  const getButtonSize = () => {
    switch (buttonSize) {
      case 'sm':
        return 'w-7 h-7'
      case 'lg':
        return 'w-11 h-11'
      default:
        return 'w-9 h-9'
    }
  }

  const getIconSize = () => {
    switch (buttonSize) {
      case 'sm':
        return 'w-4 h-4'
      case 'lg':
        return 'w-6 h-6'
      default:
        return 'w-5 h-5'
    }
  }

  let handleShare = () => {

  }

  try {
    if (!postId) return "No post ID provided."
      return (
        <div className={`space-y-3 ${className}`}>
          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className={`${getButtonSize()} ${socialStats.isLiked ? 'text-red-500 hover:text-red-600' : 'hover:text-red-500'} transition-all duration-300 hover:scale-110`}
                onClick={handleLike}
              >
                <Heart className={`${getIconSize()} ${socialStats.isLiked ? 'fill-current' : ''} transition-all duration-300`} />
              </Button>
              {showComment && (
                <Link href={`/posts/${postId}`}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`${getButtonSize()} hover:text-blue-500 hover:scale-110 transition-all duration-300`}
                    onClick={onComment}
                  >
                    <MessageCircle className={getIconSize()} />
                  </Button>
                </Link>
              )}
              <RWebShare
                data={{
                  text: `Thanks for sharing my post!`,
                  url: `${window.location.origin}/posts/${postId}?share=true`,
                  title: `Check out this post!`
                }}
                onClick={handleShare}
              >
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`${getButtonSize()} hover:text-green-500 hover:scale-110 transition-all duration-300`}
                  onClick={handleShare}
              >
                <Share className={getIconSize()} />
              </Button>
              </RWebShare>
            </div>
          </div>
    
          {/* Engagement Stats */}
          {showStats && (
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-3.5 h-3.5 text-primary" />
                <span className="font-semibold text-foreground">
                  {formatNumber(socialStats.likes)}
                </span>
              </div>
              <span className="text-muted-foreground">
                {formatNumber(socialStats.comments)} comments
              </span>
              <span className="text-muted-foreground">
                {formatNumber(socialStats.shares)} shares
              </span>
              {showViews && socialStats.views !== undefined && (
                <span className="text-muted-foreground">
                  {formatNumber(socialStats.views)} views
                </span>
              )}
            </div>
          )}
    
          {/* Like Animation */}
          <LikeAnimation 
            isVisible={showLikeAnimation}
            onAnimationComplete={() => setShowLikeAnimation(false)}
            size={buttonSize}
          />
        </div>
      )
  }
  catch {
    return "Something went wrong."
  }
}

export default SocialInteractions 