'use client'

import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MessageSquare, Send, MoreVertical, Edit, Trash2, Flag, Reply, Menu, Loader2 } from 'lucide-react'
import { formatNumber, Post } from '../../../../page'
import GetComments from './Actions/GetComments'
import { addComment, editComment, deleteComment, addReply } from './Actions/CommentActions'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import SetQuickToken from '@/app/Auth/Functions/SetQuickToken'
import { ContextProvider } from '@/components/Context/ContextProvider'
import { InfoDialog } from './InfoDialog'
import { useComments } from '@/store/comments-context'

interface Comment {
  id: string
  message: string
  created_at: string
  edited: boolean
  reply_id: string | null
  user_id: string
}

interface ProjectCommentsProps {
  projectId?: string
  token?: string
  post?: Post
}

export function PostComments({ post, projectId, token }: ProjectCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
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

  const PAGE_SIZE = 10

  if(!token) return null

  const groupedComments = comments.reduce((acc, comment) => {
    if (!comment.reply_id) {
      acc[comment.id] = {
        ...comment,
        replies: []
      }
    } else {
      if (!acc[comment.reply_id]) {
        const parentComment = comments.find(c => c.id === comment.reply_id)
        if (parentComment) {
          acc[comment.reply_id] = {
            ...parentComment,
            replies: []
          }
        }
      }
      if (acc[comment.reply_id]) {
        acc[comment.reply_id].replies.push(comment)
      }
    }
    return acc
  }, {} as Record<string, Comment & { replies: Comment[] }>)

  const parentComments = Object.values(groupedComments).filter(comment => !comment.reply_id)

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }))
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
    }
  }

  useEffect(() => {
    loadComments()
  }, [projectId])

  useEffect(() => {
    const fetchClientId = async () => {
      const id = await GetClientID()
      setClientId(id)
    }
    fetchClientId()
  }, [])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !projectId || !clientId) return

    try {
      setLoading(true)
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
      setLoading(false)
    } catch (error) {
      console.error('Error submitting comment:', error)
      toast.error('Failed to add comment')
    }
  }

  const handleEditComment = async (commentId: string) => {
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

  const handleStartReply = (commentId: string) => {
    setReplyingTo(commentId)
    setReplyText('')
  }

  const handleCancelReply = () => {
    setReplyingTo(null)
    setReplyText('')
  }

  const totalComments = comments.length

  const scrollWatch = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          const lastComment = comments[comments.length - 1]
          if (lastComment) {
            loadComments(lastComment.id)
          }
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )

    const currentRef = scrollWatch.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
      observer.disconnect()
    }
  }, [comments, loading, hasMore, projectId])

//   useLayoutEffect(() => {
//     console.log(clientId)
//     console.log(comments)
//   }, [clientId, comments])

  return (
    <div className="w-full flex flex-col justify-between min-w-full space-y-4 h-full">
      <div className="flex items-center gap-2 mb-4 p-6">
        <Button onClick={() => toggleDesktop()} variant="ghost" size="icon">
          <Menu className='h-5 w-5' />
        </Button>
        <MessageSquare className="h-5 w-5" />
        <span className="font-medium">Comments</span>
        <Badge variant="secondary" className="ml-auto">
          {formatNumber(totalComments)}
        </Badge>
        {post && <InfoDialog post={post} />}
      </div>
      
      <div className="space-y-4 h-full min-w-full overflow-auto p-6">
        {comments.length === 0 && !loading ? (
          <div className="text-center text-muted-foreground py-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <>
            {parentComments.map((comment) => (
              <div key={comment.id} className="space-y-3">
                <div className="flex justify-start">
                  <div className="max-w-[80%]">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                        {comment.edited && <span>(edited)</span>}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 hover:bg-muted rounded-full">
                              <MoreVertical className="h-3 w-3" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-32">
                            <DropdownMenuItem onClick={() => handleStartReply(comment.id)}>
                              <Reply className="h-3 w-3 mr-2" />
                              Reply
                            </DropdownMenuItem>
                            {clientId === comment.user_id && (
                              <>
                                <DropdownMenuItem onClick={() => handleEditComment(comment.id)}>
                                  <Edit className="h-3 w-3 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-3 w-3 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    {editingComment === comment.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="flex-1 min-h-[38px] max-h-[100px] min-w-fit resize-none text-sm"
                          rows={3}
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingComment(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-muted p-3 rounded-lg">
                        {comment.message}
                      </div>
                    )}
                    {replyingTo === comment.id && (
                      <form onSubmit={loading ? () => {} : handleSubmitReply} className="mt-2 flex items-end gap-2">
                        <Textarea
                          placeholder="Write a reply..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="flex-1 min-h-[38px] max-h-[100px] min-w-fit resize-none text-sm"
                          rows={3}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCancelReply}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            size="sm"
                            disabled={!replyText.trim() || loading}
                          >
                            {loading ? 'Replying...' : 'Reply'}
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>

                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-8 space-y-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => toggleReplies(comment.id)}
                    >
                      {expandedReplies[comment.id] ? (
                        <>
                          <span>Hide {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}</span>
                        </>
                      ) : (
                        <>
                          <span>Show {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}</span>
                        </>
                      )}
                    </Button>
                    
                    {expandedReplies[comment.id] && (
                      <div className="space-y-3">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex justify-start">
                            <div className="max-w-[80%]">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}</span>
                                  {reply.edited && <span>(edited)</span>}
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button className="p-1 hover:bg-muted rounded-full">
                                        <MoreVertical className="h-3 w-3" />
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-32">
                                      <DropdownMenuItem onClick={() => handleEditComment(reply.id)}>
                                        <Edit className="h-3 w-3 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      {clientId === reply.user_id && (
                                        <>
                                          <DropdownMenuItem 
                                            onClick={() => handleDeleteComment(reply.id)}
                                            className="text-destructive"
                                          >
                                            <Trash2 className="h-3 w-3 mr-2" />
                                            Delete
                                          </DropdownMenuItem>
                                        </>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                              {editingComment === reply.id ? (
                                <div className="space-y-2">
                                  <Textarea
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="flex-1 min-h-[38px] max-h-[100px] min-w-fit resize-none text-sm"
                                    rows={3}
                                    autoFocus
                                  />
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={loading ? () => {} : () => setEditingComment(null)}
                                      disabled={loading}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={loading ? () => {} : handleSaveEdit}
                                      disabled={loading}
                                    >
                                      {loading ? 'Saving...' : 'Save'}
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-muted/50 p-3 rounded-lg">
                                  {reply.message}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={scrollWatch} className="h-4" />
            {loading && (
              <div className="text-center text-muted-foreground py-4">
                Loading more comments...
              </div>
            )}
          </>
        )}
      </div>

      <form onSubmit={loading ? () => {} : handleSubmitComment} className="p-6 border-t flex items-end gap-2 w-full min-w-full">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 min-h-[38px] max-h-[100px] min-w-fit resize-none text-sm"
          rows={3}
          autoFocus
        />
        <Button disabled={loading || !newComment.trim()} type="submit" size="sm" className="h-9 w-9 p-0 mb-0 border-none bg-transparent text-muted-foreground">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 rotate-45" />}
        </Button>
      </form>
    </div>
  )
}