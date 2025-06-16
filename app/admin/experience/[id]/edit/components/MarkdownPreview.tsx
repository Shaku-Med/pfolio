'use client'

import React, { useEffect, useLayoutEffect, useState } from 'react'
import MDEditor from '@uiw/react-md-editor'
import DOMPurify from 'dompurify'
import { FileText } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface MarkdownPreviewProps {
  content: string
  title?: string
}

export function MarkdownPreview({ content, title = "Detailed Information" }: MarkdownPreviewProps) {
  const [contentState, setContentState] = useState('')
  if (!content) return null

  useLayoutEffect(() => {
    setContentState(content)
  }, [content])

  return (
    <>
      <Separator />
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {title}
        </h3>
        <div data-color-mode="dark">
          {
            contentState && (
                <MDEditor.Markdown 
                    source={DOMPurify.sanitize(contentState)} 
                    className="!bg-transparent"
                />
            )
          }
          {
            !contentState && (
                <p className="text-sm text-gray-500">
                    Loading...
                </p>
            )
          }
        </div>
      </div>
    </>
  )
} 