export interface Comment {
  id: string
  message: string
  created_at: string
  edited: boolean
  reply_id: string | null
  user_id: string
}

export interface SocialStats {
  likes: number
  comments: number
  shares: number
  views: number
  isLiked: boolean
}

export interface CommentWithReplies extends Comment {
  replies: Comment[]
}

export interface CommentItemProps {
  comment: CommentWithReplies
  clientId: string | null
  onEdit: (commentId: string | null) => void
  onDelete: (commentId: string) => void
  onReply: (commentId: string | null) => void
  editingComment: string | null
  editText: string
  setEditText: (text: string) => void
  onSaveEdit: () => void
  loading: boolean
  expandedReplies: Record<string, boolean>
  toggleReplies: (commentId: string) => void
  replyingTo: string | null
  replyText: string
  setReplyText: (text: string) => void
  onSubmitReply: (e: React.FormEvent) => void
}

export interface CommentFormProps {
  onSubmit: (e: React.FormEvent) => void
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  submitting: boolean
  placeholder?: string
}

export interface CommentHeaderProps {
  totalComments: number
  toggleDesktop: () => void
  post: any
}

export interface CommentListProps {
  comments: Comment[]
  clientId: string | null
  loading: boolean
  hasMore: boolean
  onLoadMore: (lastCommentId?: string) => void
  onEdit: (commentId: string | null) => void
  onDelete: (commentId: string) => void
  onReply: (commentId: string | null) => void
  editingComment: string | null
  editText: string
  setEditText: (text: string) => void
  onSaveEdit: () => void
  expandedReplies: Record<string, boolean>
  toggleReplies: (commentId: string) => void
  replyingTo: string | null
  replyText: string
  setReplyText: (text: string) => void
  onSubmitReply: (e: React.FormEvent) => void
} 