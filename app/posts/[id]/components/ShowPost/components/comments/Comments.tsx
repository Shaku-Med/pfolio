'use client'

import React, { useContext, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ContextProvider } from '@/components/Context/ContextProvider'
import { useComments } from '@/store/comments-context'
import SocialInteractions, { SocialStats } from '@/components/home/SocialInteractions'
import HandleLiking from '@/app/posts/components/Action/HandleLiking'
import { Post } from '../../../../page'
import GetComments from './Actions/GetComments'
import { addComment, editComment, deleteComment, addReply } from './Actions/CommentActions'
import SetQuickToken from '@/app/Auth/Functions/SetQuickToken'
import { Comment, SocialStats as SocialStatsType } from './CommentComponents/types'
import { CommentHeader } from './CommentComponents/CommentHeader'
import { CommentList } from './CommentComponents/CommentList'
import { CommentForm } from './CommentComponents/CommentForm'
import { Loader2 } from 'lucide-react'

interface ProjectCommentsProps {
  projectId?: string
  token?: string
  post?: Post
}

export function PostComments({ post, projectId, token }: ProjectCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({})
  const { fingerPrint } = useContext(ContextProvider)
  const [clientId, setClientId] = useState<string | null>(null)
  const { toggleDesktop } = useComments()
  const [isLikeDebounced, setIsLikeDebounced] = useState(false)

  const [socialStats, setSocialStats] = useState<SocialStatsType>({
    likes: post?.post_likes?.length || 0,
    comments: post?.comments || 0,
    shares: post?.shares || 0,
    views: post?.views || 0,
    isLiked: false,
  })

  const PAGE_SIZE = 10

  if(!token) return null

  let GetClientID = async () => {
    try {
      if(!fingerPrint) return null
      const fingerprint = await fingerPrint.generateFingerprint();
      if(!fingerprint) return null
      return fingerPrint.generateUniqueId(fingerprint)
    }
    catch (e) {
        return null
    }
  }

  const loadComments = async (lastCommentId?: string) => {
    if (!projectId || loading || !hasMore) return

    setLoading(true)
    try {
      let sp = await SetQuickToken(`post_comments`, token, [], [], false, false, true)
      if(!sp) return

      const newComments = await GetComments(projectId, true, PAGE_SIZE, lastCommentId, token)
      
      if (!newComments || newComments.length === 0) {
        setHasMore(false)
        return
      }

      setComments(prev => {
        const existingIds = new Set(prev.map(c => c.id))
        const uniqueNewComments = newComments.filter(c => !existingIds.has(c.id))
        return [...prev, ...uniqueNewComments]
      })
      
      setHasMore(newComments.length === PAGE_SIZE)
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadComments()
  }, [projectId])

  useEffect(() => {
    const fetchClientId = async () => {
      const id = await GetClientID()
      setClientId(id)

      if(post){
        setSocialStats(prev => ({
          ...prev,
          isLiked: post?.post_likes?.some((like: any) => like.user_id === id) || false
        }))
      }
    }
    fetchClientId()
  }, [post])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !projectId || !clientId) return

    try {
      setSubmitting(true)
      let sp = await SetQuickToken(`post_comments`, token, [], [], false, false, true)
      if(!sp) return

      const result = await addComment(projectId, newComment.trim(), token, clientId)
      
      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.data) {
        setComments(prev => [result.data, ...prev])
      }
      
      setNewComment('')
      toast.success('Comment added successfully')
    } catch (error) {
      console.error('Error submitting comment:', error)
      toast.error('Failed to add comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditComment = async (commentId: string | null) => {
    if (commentId === null) {
      setEditingComment(null)
      return
    }
    const comment = comments.find(c => c.id === commentId)
    if (comment && clientId === comment.user_id) {
      setEditText(comment.message)
      setEditingComment(commentId)
    }
  }

  const handleSaveEdit = async () => {
    if (!editText.trim() || !editingComment || !clientId) return

    try {
      setLoading(true)
      let sp = await SetQuickToken(`post_comments`, token, [], [], false, false, true)
      if(!sp) return

      const result = await editComment(editingComment, editText.trim(), token, clientId)
      
      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.data) {
        setComments(prev => 
          prev.map(comment => 
            comment.id === editingComment ? result.data : comment
          )
        )
      }

      setEditingComment(null)
      setEditText('')
      toast.success('Comment updated successfully')
      setLoading(false)
    } catch (error) {
      console.error('Error editing comment:', error)
      toast.error('Failed to update comment')
      setLoading(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if(window.confirm('Are you sure you want to delete this comment?')) {
      const comment = comments.find(c => c.id === commentId)
      if (!comment || clientId !== comment.user_id || !clientId) return
      try {
        let sp = await SetQuickToken(`post_comments`, token, [], [], false, false, true)
        if(!sp) return
    
        const result = await deleteComment(commentId, token, clientId)
        
        if (result.error) {
          toast.error(result.error)
          return
        }
    
        setComments(prev => prev.filter(comment => comment.id !== commentId))
        toast.success('Comment deleted successfully')
      } catch (error) {
        console.error('Error deleting comment:', error)
        toast.error('Failed to delete comment')
      }
    }
  }

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim() || !projectId || !replyingTo || !clientId) return

    try {
      let sp = await SetQuickToken(`post_comments`, token, [], [], false, false, true)
      if(!sp) return

      const result = await addReply(projectId, replyText.trim(), replyingTo, token, clientId)
      
      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.data) {
        setComments(prev => [result.data, ...prev])
      }
      
      setReplyText('')
      setReplyingTo(null)
      toast.success('Reply added successfully')
    } catch (error) {
      console.error('Error submitting reply:', error)
      toast.error('Failed to add reply')
    }
  }

  const handleStartReply = (commentId: string | null) => {
    setReplyingTo(commentId)
    setReplyText('')
  }

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }))
  }

  const handleLike = async (isLiked: boolean): Promise<void> => {
    if (isLikeDebounced || !clientId) return;
    
    setIsLikeDebounced(true);
    setSocialStats(prev => ({
      ...prev,
      likes: isLiked ? prev.likes + 1 : prev.likes - 1,
      isLiked
    }))

    setTimeout(async () => {
      setIsLikeDebounced(false);

      let addlikes = await HandleLiking(post?.id?.toString(), clientId)
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

  if(!clientId) {
    return (
      <div className='w-full flex flex-col justify-center items-center h-full'>
        <Loader2 className='w-10 h-10 animate-spin'/>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col justify-between min-w-full space-y-4 h-full">
      {clientId && (
        <div className='px-6 py-2 border-b'>
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
            showComment={false}
            postId={post?.id?.toString()}
          />
        </div>
      )}

      <CommentHeader 
        totalComments={comments.length}
        toggleDesktop={toggleDesktop}
        post={post}
      />
      
      <div className="space-y-4 h-full min-w-full overflow-auto p-6">
        <CommentList
          comments={comments}
          clientId={clientId}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={loadComments}
          onEdit={handleEditComment}
          onDelete={handleDeleteComment}
          onReply={handleStartReply}
          editingComment={editingComment}
          editText={editText}
          setEditText={setEditText}
          onSaveEdit={handleSaveEdit}
          expandedReplies={expandedReplies}
          toggleReplies={toggleReplies}
          replyingTo={replyingTo}
          replyText={replyText}
          setReplyText={setReplyText}
          onSubmitReply={handleSubmitReply}
        />
      </div>

      <CommentForm
        onSubmit={handleSubmitComment}
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        submitting={submitting}
      />
    </div>
  )
}