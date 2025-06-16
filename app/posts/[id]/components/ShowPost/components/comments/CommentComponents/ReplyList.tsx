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
import { MoreVertical, Edit, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Comment } from './types'

export interface ReplyListProps {
  replies: Comment[]
  commentId: string
  clientId: string | null
  onEdit: (commentId: string) => void
  onDelete: (commentId: string) => void
  editingComment: string | null
  editText: string
  setEditText: (text: string) => void
  onSaveEdit: () => void
  loading: boolean
  expandedReplies: Record<string, boolean>
  toggleReplies: (commentId: string) => void
}

export const ReplyList: React.FC<ReplyListProps> = ({
  replies,
  commentId,
  clientId,
  onEdit,
  onDelete,
  editingComment,
  editText,
  setEditText,
  onSaveEdit,
  loading,
  expandedReplies,
  toggleReplies
}) => {
  return (
    <div className="ml-8 space-y-3">
      <Button
        variant="ghost"
        size="sm"
        className="text-xs text-muted-foreground hover:text-foreground"
        onClick={() => toggleReplies(commentId)}
      >
        {expandedReplies[commentId] ? (
          <span>Hide {replies.length} {replies.length === 1 ? 'reply' : 'replies'}</span>
        ) : (
          <span>Show {replies.length} {replies.length === 1 ? 'reply' : 'replies'}</span>
        )}
      </Button>
      
      {expandedReplies[commentId] && (
        <div className="space-y-3">
          {replies.map((reply) => (
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
                        {clientId === reply.user_id && (
                          <>
                            <DropdownMenuItem onClick={() => onEdit(reply.id)}>
                              <Edit className="h-3 w-3 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onDelete(reply.id)}
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
                        onClick={loading ? () => {} : () => onEdit('')}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={loading ? () => {} : onSaveEdit}
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
  )
} 