'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Edit, Trash2, Reply } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { CommentItemProps } from './types'
import { ReplyList } from './ReplyList'

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  clientId,
  onEdit,
  onDelete,
  onReply,
  editingComment,
  editText,
  setEditText,
  onSaveEdit,
  loading,
  expandedReplies,
  toggleReplies,
  replyingTo,
  replyText,
  setReplyText,
  onSubmitReply
}) => {
  return (
    <div className="space-y-3">
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
                  <DropdownMenuItem onClick={() => onReply(comment.id)}>
                    <Reply className="h-3 w-3 mr-2" />
                    Reply
                  </DropdownMenuItem>
                  {clientId === comment.user_id && (
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
                  onClick={() => onEdit(null)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={onSaveEdit}
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
        </div>
      </div>

      {replyingTo === comment.id && (
        <div className="ml-8 space-y-2">
          <form onSubmit={onSubmitReply}>
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 min-h-[38px] max-h-[100px] min-w-fit resize-none text-sm"
              rows={3}
              placeholder="Write a reply..."
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => onReply(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                type="submit"
                disabled={!replyText.trim()}
              >
                Reply
              </Button>
            </div>
          </form>
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <ReplyList
          replies={comment.replies}
          commentId={comment.id}
          clientId={clientId}
          onEdit={onEdit}
          onDelete={onDelete}
          editingComment={editingComment}
          editText={editText}
          setEditText={setEditText}
          onSaveEdit={onSaveEdit}
          loading={loading}
          expandedReplies={expandedReplies}
          toggleReplies={toggleReplies}
        />
      )}
    </div>
  )
} 