'use client'

import React, { useRef, useEffect } from 'react'
import { MessageSquare } from 'lucide-react'
import { CommentListProps, CommentWithReplies } from './types'
import { CommentItem } from './CommentItem'

export const CommentList: React.FC<CommentListProps> = ({
  comments,
  clientId,
  loading,
  hasMore,
  onLoadMore,
  onEdit,
  onDelete,
  onReply,
  editingComment,
  editText,
  setEditText,
  onSaveEdit,
  expandedReplies,
  toggleReplies,
  replyingTo,
  replyText,
  setReplyText,
  onSubmitReply
}) => {
  const scrollWatch = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          const lastComment = comments[comments.length - 1]
          if (lastComment) {
            onLoadMore(lastComment.id)
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
  }, [comments, loading, hasMore, onLoadMore])

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
  }, {} as Record<string, CommentWithReplies>)

  const parentComments = Object.values(groupedComments).filter(comment => !comment.reply_id)

  if (comments.length === 0 && !loading) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p>No comments yet. Be the first to comment!</p>
      </div>
    )
  }

  return (
    <>
      {parentComments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          clientId={clientId}
          onEdit={onEdit}
          onDelete={onDelete}
          onReply={onReply}
          editingComment={editingComment}
          editText={editText}
          setEditText={setEditText}
          onSaveEdit={onSaveEdit}
          loading={loading}
          expandedReplies={expandedReplies}
          toggleReplies={toggleReplies}
          replyingTo={replyingTo}
          replyText={replyText}
          setReplyText={setReplyText}
          onSubmitReply={onSubmitReply}
        />
      ))}
      <div ref={scrollWatch} className="h-4" />
      {loading && (
        <div className="text-center text-muted-foreground py-4">
          Loading more comments...
        </div>
      )}
    </>
  )
} 