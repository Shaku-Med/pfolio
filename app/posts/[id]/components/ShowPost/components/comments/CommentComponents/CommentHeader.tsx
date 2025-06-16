'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Menu } from 'lucide-react'
import { formatNumber } from '../../../../../page'
import { InfoDialog } from '../InfoDialog'
import { CommentHeaderProps } from './types'

export const CommentHeader: React.FC<CommentHeaderProps> = ({
  totalComments,
  toggleDesktop,
  post
}) => {
  return (
    <div className="flex items-center gap-2 mb-4 p-6">
      <Button onClick={toggleDesktop} variant="ghost" size="icon">
        <Menu className='h-5 w-5' />
      </Button>
      <MessageSquare className="h-5 w-5" />
      <span className="font-medium">Comments</span>
      <Badge variant="secondary" className="ml-auto">
        {formatNumber(totalComments)}
      </Badge>
      {post && <InfoDialog post={post} />}
    </div>
  )
} 