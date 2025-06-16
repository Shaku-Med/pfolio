'use client'
import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Info, 
  Heart, 
  Eye, 
  MessageSquare, 
  Calendar,
  MapPin,
  Clock,
  Hash,
  TrendingUp,
  Users,
  Activity
} from 'lucide-react'
import { Post } from '../../../../page'
import MDEditor from '@uiw/react-md-editor'
import DOMPurify from 'dompurify'
import { formatNumber } from '../../../../page'

interface InfoDialogProps {
  post: Post
}

export function InfoDialog({ post }: InfoDialogProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEngagementRate = () => {
    if (!post.views || post.views === 0) return 0
    return ((post.likes + post.comments) / post.views * 100).toFixed(1)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="group p-2 hover:bg-white/10 rounded-full transition-all duration-300 hover:scale-110">
          <Info className="h-4 w-4 text-white/70 group-hover:text-white transition-colors" />
        </button>
      </DialogTrigger>
      <DialogContent className=" w-full h-full overflow-y-auto z-[1000001] rounded-none md:min-w-[800px] min-w-full bg-background/90 backdrop-blur-xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-background rounded-full">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold ">
                Post Analytics
              </DialogTitle>
              <p className="text-sm text-muted-foreground">Detailed information and metrics</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Engagement Metrics */}
          <div className=" flex gap-2 flex-wrap">
            {/* <div className="group p-4 bg-muted/50 rounded-xl transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-muted rounded-lg group-hover:bg-muted/80 transition-colors">
                  <Heart className="h-5 w-5" />
                </div>
                <div className='flex items-center gap-1'>
                  <p className="text-lg font-bold">{formatNumber(post.likes)}</p>
                  <p className="text-xs text-muted-foreground">Likes</p>
                </div>
              </div>
            </div> */}

            <div className="group p-4 bg-muted/50 rounded-xl transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-muted rounded-lg group-hover:bg-muted/80 transition-colors">
                  <Eye className="h-5 w-5" />
                </div>
                <div className='flex items-center gap-1'>
                  <p className="text-lg font-bold">{formatNumber(post.views)}</p>
                  <p className="text-xs text-muted-foreground">Views</p>
                </div>
              </div>
            </div>

            <div className="group p-4 bg-muted/50 rounded-xl transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-muted rounded-lg group-hover:bg-muted/80 transition-colors">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className='flex items-center gap-1'>
                  <p className="text-lg font-bold">{formatNumber(post.comments)}</p>
                  <p className="text-xs text-muted-foreground">Comments</p>
                </div>
              </div>
            </div>

            <div className="group p-4 bg-muted/50 rounded-xl transition-all duration-300">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-muted rounded-lg group-hover:bg-muted/80 transition-colors">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div className='flex items-center gap-1'>
                  <p className="text-lg font-bold">{getEngagementRate()}%</p>
                  <p className="text-xs text-muted-foreground">Engagement</p>
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-slate-700/50" />

          {/* Content Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <h4 className="text-lg font-semibold">Content</h4>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-xl">
              <p className="text-sm text-muted-foreground leading-relaxed">{post.text}</p>
            </div>

            {post.description && (
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
                  <Hash className="h-4 w-4" />
                  <span>Description</span>
                </h5>
                <div className="p-4 bg-muted/50 rounded-xl">
                  <p className="text-sm text-muted-foreground leading-relaxed">{post.description}</p>
                </div>
              </div>
            )}

            {post.long_description && (
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-muted-foreground">Detailed Description</h5>
                <div className="p-4 bg-muted/50 rounded-xl" data-color-mode="dark">
                  <div className="markdown_preview prose prose-invert prose-sm max-w-none">
                    <MDEditor.Markdown 
                      source={DOMPurify.sanitize(post.long_description)} 
                      className="!bg-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator className="bg-slate-700/50" />

          {/* Metadata Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <h4 className="text-lg font-semibold">Metadata</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Created</span>
                </div>
                <p className="text-sm text-muted-foreground">{formatDate(post.created_at)}</p>
              </div>

              {post.updated_at && (
                <div className="p-4 bg-muted/50 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">Last Updated</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatDate(post.updated_at)}</p>
                </div>
              )}

              {post.location && (
                <div className="p-4 bg-muted/50 rounded-xl md:col-span-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium">Location</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{post.location}</p>
                </div>
              )}
            </div>
          </div>

          {/* Tags Section */}
          {post.tags && post.tags.length > 0 && (
            <>
              <Separator className="bg-slate-700/50" />
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Hash className="h-5 w-5" />
                  <h4 className="text-lg font-semibold">Tags</h4>
                  <Badge variant="secondary" className="text-xs bg-muted">
                    {post.tags.length}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="text-xs bg-muted/50 hover:bg-muted transition-all duration-300 cursor-pointer"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(51, 65, 85, 0.3);
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #2563eb, #7c3aed);
          }
        `}</style>
      </DialogContent>
    </Dialog>
  )
}