'use client'

import React, { useState, useEffect, useContext } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MessageSquare, Send, User, MoreVertical, Edit, Trash2, Flag, Loader2, X } from 'lucide-react'
import { Project } from '@/app/admin/projects/page'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { ContextProvider } from '@/components/Context/ContextProvider'
import { addComment, editComment, deleteComment, addReply } from './comments/Actions/CommentActions'
import GetComments from './comments/Actions/GetComments'
import SetQuickToken from '@/app/Auth/Functions/SetQuickToken'

interface Comment {
  id: string
  message: string
  created_at: string
  edited: boolean
  reply_id: string | null
  user_id: string
  replies?: Comment[]
  hasMoreReplies?: boolean
  lastReplyId?: string
}

interface ProjectCommentsProps {
  projectId: string
  project: Project
  token?: string
}

const CommentItem = ({ 
  comment, 
  level = 0, 
  onReply, 
  onEdit, 
  onDelete, 
  isCurrentUser,
  editingComment,
  editText,
  onSaveEdit,
  onCancelEdit,
  onEditTextChange,
  replyingTo,
  replyText,
  onReplyTextChange,
  onSubmitReply,
  onCancelReply,
  loading,
  onLoadMoreReplies
}: {
  comment: Comment
  level?: number
  onReply: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  isCurrentUser: (userId: string) => boolean
  editingComment: string | null
  editText: string
  onSaveEdit: () => void
  onCancelEdit: () => void
  onEditTextChange: (text: string) => void
  replyingTo: string | null
  replyText: string
  onReplyTextChange: (text: string) => void
  onSubmitReply: (e: React.FormEvent) => void
  onCancelReply: () => void
  loading: boolean
  onLoadMoreReplies: (commentId: string, lastReplyId: string) => void
}) => {
  return (
    <div className="space-y-3">
      <div className="flex">
        <div className="w-full">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="p-1 rounded-full bg-muted">
                <User className="h-3 w-3" />
              </div>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
              {comment.edited && <span>(edited)</span>}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 hover:bg-muted rounded-full">
                    <MoreVertical className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32 z-[1000000000000001]">
                  {isCurrentUser(comment.user_id) ? (
                    <>
                      <DropdownMenuItem onClick={() => onEdit(comment.id)}>
                        <Edit className="h-3 w-3 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(comment.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-3 w-3 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem>
                      <Flag className="h-3 w-3 mr-2" />
                      Report
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {editingComment === comment.id ? (
            <div className="space-y-2">
              <Textarea
                value={editText}
                onChange={(e) => onEditTextChange(e.target.value)}
                className="text-sm min-h-[60px] resize-none"
                rows={2}
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={onSaveEdit} className="h-7 px-3 text-xs">
                  Save
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onCancelEdit}
                  className="h-7 px-3 text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl text-sm bg-muted">
              {comment.message}
            </div>
          )}
          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => onReply(comment.id)}
              className={`text-xs text-muted-foreground hover:text-foreground ${
                editingComment === comment.id ? 'hidden' : ''
              }`}
            >
              Reply
            </button>
          </div>
        </div>
      </div>

      {replyingTo === comment.id && (
        <div className="ml-8">
          <form onSubmit={onSubmitReply} className="flex gap-2 items-end">
            <Textarea
              placeholder="Write a reply..."
              value={replyText}
              onChange={(e) => onReplyTextChange(e.target.value)}
              className="flex-1 min-h-[80px] resize-none text-sm"
              rows={3}
              autoFocus
            />
            <div className="flex flex-col gap-2">
              <Button type="submit" size="sm" className="h-9 w-9 p-0 mb-0" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={onCancelReply}
                className="h-9 w-9 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-8 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              level={level + 1}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              isCurrentUser={isCurrentUser}
              editingComment={editingComment}
              editText={editText}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
              onEditTextChange={onEditTextChange}
              replyingTo={replyingTo}
              replyText={replyText}
              onReplyTextChange={onReplyTextChange}
              onSubmitReply={onSubmitReply}
              onCancelReply={onCancelReply}
              loading={loading}
              onLoadMoreReplies={onLoadMoreReplies}
            />
          ))}
          {comment.hasMoreReplies && (
            <button
              onClick={() => onLoadMoreReplies(comment.id, comment.lastReplyId!)}
              className="text-sm text-muted-foreground hover:text-foreground"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
              ) : null}
              Load more replies
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function ProjectComments({ projectId, project, token }: ProjectCommentsProps) {
  const [newComment, setNewComment] = useState('')
  const [replyText, setReplyText] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [initialLoad, setInitialLoad] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const PAGE_SIZE = 10
  const { fingerPrint } = useContext(ContextProvider)
  const [clientId, setClientId] = useState<string | null>(null)
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const [loadingReplies, setLoadingReplies] = useState<{ [key: string]: boolean }>({})
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const loadMoreComments = async (lastCommentId: string) => {
    if (isLoadingMore || !hasMore || !token) {
      console.log('LoadMoreComments conditions not met:', {
        isLoadingMore,
        hasMore,
        hasToken: !!token
      })
      return
    }
    setIsLoadingMore(true)
    try {
      let sp = await SetQuickToken(`post_comments`, token, [], [], false, false, true)
      if(!sp) {
        console.log('Failed to set quick token')
        setIsLoadingMore(false)
        return
      }

      const newComments = await GetComments(projectId, true, PAGE_SIZE, lastCommentId, token)
      console.log('GetComments response:', {
        newCommentsCount: newComments?.length,
        hasNewComments: !!newComments
      })
      
      if (!newComments || newComments.length === 0) {
        console.log('No more comments to load')
        setHasMore(false)
        setIsLoadingMore(false)
        return
      }

      setComments(prev => {
        const existingIds = new Set(prev.map(c => c.id))
        const uniqueNewComments = newComments.filter(c => !existingIds.has(c.id))
        console.log('Updating comments state:', {
          previousCount: prev.length,
          newCommentsCount: uniqueNewComments.length,
          totalAfterUpdate: prev.length + uniqueNewComments.length
        })
        return [...prev, ...uniqueNewComments]
      })
      
      setHasMore(newComments.length === PAGE_SIZE)
    } catch (error) {
      console.error('Error loading more comments:', error)
      toast.error('Failed to load more comments')
    } finally {
      setIsLoadingMore(false)
    }
  }

  const handleScroll = React.useCallback(() => {
    if (!scrollContainerRef.current || loading || isLoadingMore || !hasMore) {
      return
    }

    const container = scrollContainerRef.current
    const { scrollTop, scrollHeight, clientHeight } = container
    
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight
    const threshold = 200

    if (distanceFromBottom <= threshold) {
      const lastComment = comments[comments.length - 1]
      if (lastComment) {
        loadMoreComments(lastComment.id)
      }
    }
  }, [loading, isLoadingMore, hasMore, comments, loadMoreComments])

  useEffect(() => {
    let scrollContainer: HTMLDivElement | null = null;
    
    const setupScrollListener = () => {
      scrollContainer = scrollContainerRef.current;
      if (scrollContainer) {
        scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
      }
    };

    if (isDialogOpen) {
      // Small delay to ensure the dialog content is rendered
      const timeoutId = setTimeout(setupScrollListener, 100);
      return () => {
        clearTimeout(timeoutId);
        if (scrollContainer) {
          scrollContainer.removeEventListener('scroll', handleScroll);
        }
      };
    }
  }, [isDialogOpen, handleScroll]);

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

  useEffect(() => {
    const fetchClientId = async () => {
      const id = await GetClientID()
      setClientId(id)
    }
    fetchClientId()
  }, [])

  useEffect(() => {
    if (token && !initialLoad) {
      loadComments()
      setInitialLoad(true)
    }
  }, [token, projectId, initialLoad])

  const loadComments = async (lastCommentId?: string) => {
    if (loading || !hasMore || !token) return
    setLoading(true)
    try {
      let sp = await SetQuickToken(`post_comments`, token, [], [], false, false, true)
      if(!sp) {
        setLoading(false)
        return
      }

      const newComments = await GetComments(projectId, true, PAGE_SIZE, lastCommentId, token)
      
      if (!newComments || newComments.length === 0) {
        setHasMore(false)
        setLoading(false)
        return
      }

      setComments(prev => {
        const existingIds = new Set(prev.map(c => c.id))
        const uniqueNewComments = newComments.filter(c => !existingIds.has(c.id))
        return [...prev, ...uniqueNewComments]
      })
      
      setHasMore(newComments.length === PAGE_SIZE)
    } catch (error) {
      toast.error('Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment?.trim() || !projectId || !clientId || !token) return

    try {
      setLoading(true)
      let sp = await SetQuickToken(`post_comments`, token, [], [], false, false, true)
      if(!sp) return

      const result = await addComment(projectId, newComment?.trim(), token, clientId)
      
      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.data) {
        setComments(prev => [result.data, ...prev])
        setNewComment('')
        toast.success('Comment added successfully')
      }
    } catch (error) {
      toast.error('Failed to add comment')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim() || !projectId || !replyingTo || !clientId || !token) return

    try {
      setLoading(true)
      let sp = await SetQuickToken(`post_comments`, token, [], [], false, false, true)
      if(!sp) return

      const result = await addReply(projectId, replyText.trim(), replyingTo, token, clientId)
      
      if (result.error) {
        toast.error(result.error)
        return
      }

      if (result.data) {
        setComments(prev => {
          const updateCommentWithReply = (comments: Comment[]): Comment[] => {
            return comments.map(comment => {
              if (comment.id === replyingTo) {
                return {
                  ...comment,
                  replies: [...(comment.replies || []), result.data]
                }
              }
              if (comment.replies) {
                return {
                  ...comment,
                  replies: updateCommentWithReply(comment.replies)
                }
              }
              return comment
            })
          }
          return updateCommentWithReply(prev)
        })
        setReplyText('')
        setReplyingTo(null)
        toast.success('Reply added successfully')
      }
    } catch (error) {
      toast.error('Failed to add reply')
    } finally {
      setLoading(false)
    }
  }

  const handleEditComment = async (commentId: string) => {
    const findComment = (comments: Comment[]): Comment | undefined => {
      for (const comment of comments) {
        if (comment.id === commentId) return comment
        if (comment.replies) {
          const found = findComment(comment.replies)
          if (found) return found
        }
      }
    }

    const comment = findComment(comments)
    if (comment && clientId === comment.user_id) {
      setEditText(comment.message)
      setEditingComment(commentId)
    }
  }

  const handleSaveEdit = async () => {
    if (!editText.trim() || !editingComment || !clientId || !token) return

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
        setComments(prev => {
          const updateComment = (comments: Comment[]): Comment[] => {
            return comments.map(comment => {
              if (comment.id === editingComment) {
                return result.data
              }
              if (comment.replies) {
                return {
                  ...comment,
                  replies: updateComment(comment.replies)
                }
              }
              return comment
            })
          }
          return updateComment(prev)
        })
        setEditingComment(null)
        setEditText('')
        toast.success('Comment updated successfully')
      }
    } catch (error) {
      toast.error('Failed to update')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      if (!clientId || !token) return
      try {
        setLoading(true)
        let sp = await SetQuickToken(`post_comments`, token, [], [], false, false, true)
        if(!sp) return

        const result = await deleteComment(commentId, token, clientId)
        
        if (result.error) {
          toast.error(result.error)
          return
        }

        setComments(prev => {
          const removeComment = (comments: Comment[]): Comment[] => {
            return comments.filter(comment => {
              if (comment.id === commentId) return false
              if (comment.replies) {
                comment.replies = removeComment(comment.replies)
              }
              return true
            })
          }
          return removeComment(prev)
        })
        toast.success('Comment deleted successfully')
      } catch (error) {
        toast.error('Failed to delete comment')
      } finally {
        setLoading(false)
      }
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

  const totalComments = comments.reduce((total, comment) => {
    const countReplies = (replies: Comment[]): number => {
      return replies.reduce((sum, reply) => {
        return sum + 1 + (reply.replies ? countReplies(reply.replies) : 0)
      }, 0)
    }
    return total + 1 + (comment.replies ? countReplies(comment.replies) : 0)
  }, 0)

  const isCurrentUser = (userId: string) => userId === clientId

  const handleLoadMoreReplies = async (commentId: string, lastReplyId: string) => {
    if (!token || loadingReplies[commentId]) return

    setLoadingReplies(prev => ({ ...prev, [commentId]: true }))
    try {
      let sp = await SetQuickToken(`post_comments`, token, [], [], false, false, true)
      if(!sp) return

      const newReplies = await GetComments(projectId, true, 5, lastReplyId, token, 5)
      
      if (newReplies && newReplies.length > 0) {
        setComments(prev => {
          const updateCommentWithReplies = (comments: Comment[]): Comment[] => {
            return comments.map(comment => {
              if (comment.id === commentId) {
                const lastReply = newReplies[newReplies.length - 1]
                return {
                  ...comment,
                  replies: [...(comment.replies || []), ...newReplies],
                  hasMoreReplies: newReplies.length === 5,
                  lastReplyId: lastReply.id
                }
              }
              if (comment.replies) {
                return {
                  ...comment,
                  replies: updateCommentWithReplies(comment.replies)
                }
              }
              return comment
            })
          }
          return updateCommentWithReplies(prev)
        })
      }
    } catch (error) {
      toast.error('Failed to load more replies')
    } finally {
      setLoadingReplies(prev => ({ ...prev, [commentId]: false }))
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <span>Comments</span>
          <Badge variant="secondary" className="ml-auto">
            {totalComments}
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl sm:rounded-3xl rounded-none sm:max-h-[85vh] max-h-[85vh] z-[1000000000000001] flex flex-col p-0 backdrop-blur-sm bg-background/80">
        <DialogHeader className="p-6 pb-3 border-b">
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments ({totalComments})
          </DialogTitle>
        </DialogHeader>
        
        <div 
          className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0" 
          ref={scrollContainerRef}
        >
          {loading && comments.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <>
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onReply={handleStartReply}
                  onEdit={handleEditComment}
                  onDelete={handleDeleteComment}
                  isCurrentUser={isCurrentUser}
                  editingComment={editingComment}
                  editText={editText}
                  onSaveEdit={handleSaveEdit}
                  onCancelEdit={() => {
                    setEditingComment(null)
                    setEditText('')
                  }}
                  onEditTextChange={setEditText}
                  replyingTo={replyingTo}
                  replyText={replyText}
                  onReplyTextChange={setReplyText}
                  onSubmitReply={handleSubmitReply}
                  onCancelReply={handleCancelReply}
                  loading={loading}
                  onLoadMoreReplies={handleLoadMoreReplies}
                />
              ))}
              {isLoadingMore && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
              {!hasMore && comments.length > 0 && (
                <div className="text-center text-sm text-muted-foreground py-4">
                  No more comments to load
                </div>
              )}
            </>
          )}
        </div>

        <div className="border-t p-4">
          <form onSubmit={handleSubmitComment} className="flex gap-2 items-end">
            <Textarea
              placeholder="Type a message..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 min-h-[30px] resize-none max-h-[200px]"
              rows={3}
              disabled={loading}
            />
            <Button type="submit" size="icon" disabled={!newComment?.trim() || loading} className="mb-0">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}