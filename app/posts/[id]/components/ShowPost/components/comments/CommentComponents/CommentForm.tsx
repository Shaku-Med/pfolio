'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2 } from 'lucide-react'
import { CommentFormProps } from './types'

export const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  value,
  onChange,
  submitting,
  placeholder = "Write a comment..."
}) => {
  return (
    <form onSubmit={submitting ? () => {} : onSubmit} className="p-6 border-t flex items-end gap-2 w-full min-w-full">
      <Textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="flex-1 min-h-[38px] max-h-[100px] min-w-fit resize-none text-sm"
        rows={3}
        autoFocus
      />
      <Button 
        disabled={submitting || !value.trim()} 
        type="submit" 
        size="sm" 
        className="h-9 w-9 p-0 mb-0 border-none bg-transparent text-muted-foreground"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 rotate-45" />}
      </Button>
    </form>
  )
} 