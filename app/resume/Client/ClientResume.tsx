'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

import { 
  FileText, 
  Download, 
  Share2, 
  Eye, 
  Calendar,
  User,
  File,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Loader2,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react'
import * as mammoth from 'mammoth'
import { Alert, AlertDescription } from './components/ui/alert'
import { ScrollArea } from './components/ui/scroll-area'
import DOMPurify from 'dompurify'

interface DocumentInfo {
  title: string
  author: string
  createdAt: string
  fileSize: string
  pages: number
  fileType: string
}

const DocumentViewer = () => {
  const [zoomLevel, setZoomLevel] = useState(100)
  const [documentUrl, setDocumentUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [previewContent, setPreviewContent] = useState<string>('')
  const [previewType, setPreviewType] = useState<'html' | 'image' | 'pdf' | 'text'>('text')
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [copySuccess, setCopySuccess] = useState(false)
  const [fileBlob, setFileBlob] = useState<Blob | null>(null)
  const [isClipboardSupported, setIsClipboardSupported] = useState(false)
  const [documentInfo, setDocumentInfo] = useState<DocumentInfo>({
    title: "Sample Document",
    author: "Unknown",
    createdAt: new Date().toISOString().split('T')[0],
    fileSize: "Unknown",
    pages: 1,
    fileType: "PDF"
  })

  // Check clipboard API support on component mount
  useEffect(() => {
    const checkClipboardSupport = async () => {
      try {
        // Check if the clipboard API is available
        if (navigator.clipboard && navigator.clipboard.writeText) {
          // Try a simple write to verify it works
          await navigator.clipboard.writeText('test')
          setIsClipboardSupported(true)
        } else {
          setIsClipboardSupported(false)
        }
      } catch (err) {
        setIsClipboardSupported(false)
      }
    }

    checkClipboardSupport()
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDocumentUrl(`${window.location.origin}/resume.pdf`)
    }
  }, [])

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 200))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getFileTypeFromUrl = (url: string): string => {
    const extension = url.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'pdf': return 'PDF'
      case 'docx': return 'DOCX'
      case 'doc': return 'DOC'
      case 'txt': return 'Text'
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'svg': return 'Image'
      case 'mp4':
      case 'avi':
      case 'mov':
      case 'wmv': return 'Video'
      case 'mp3':
      case 'wav':
      case 'ogg': return 'Audio'
      default: return 'Unknown'
    }
  }

  const handleDownload = () => {
    if (!fileBlob) return
    
    const url = URL.createObjectURL(fileBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mohamed_amara_resume.pdf'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopyToClipboard = async () => {
    if (!fileBlob) return

    try {
      // Check if clipboard API is available
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        throw new Error('Clipboard API not available')
      }

      // Convert blob to base64
      const reader = new FileReader()
      reader.readAsDataURL(fileBlob)
      reader.onloadend = async () => {
        try {
          const base64data = reader.result as string
          await navigator.clipboard.writeText(base64data)
          setCopySuccess(true)
          setTimeout(() => setCopySuccess(false), 2000)
        } catch (err) {
          setError('Failed to copy to clipboard')
        }
      }
    } catch (err) {
      setError('Clipboard functionality not available in this browser')
    }
  }

  const loadDocument = async () => {
    if (!documentUrl.trim()) {
      setError('Please enter a valid URL')
      return
    }

    setIsLoading(true)
    setError('')
    setPreviewContent('')
    setPreviewUrl('')
    setFileBlob(null)

    try {
      let url = `/api/resume?url=${encodeURIComponent(documentUrl)}`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Failed to load document: ${response.status}`)
      }

      const contentType = response.headers.get('content-type') || ''
      const contentLength = response.headers.get('content-length')
      const fileType = getFileTypeFromUrl(url)
      
      setDocumentInfo({
        title: url.split('/').pop()?.split('?')[0] || 'Document',
        author: 'Unknown',
        createdAt: new Date().toISOString().split('T')[0],
        fileSize: contentLength ? `${(parseInt(contentLength) / 1024 / 1024).toFixed(2)} MB` : 'Unknown',
        pages: 1,
        fileType
      })

      const blob = await response.blob()
      setFileBlob(blob)
      const objectUrl = URL.createObjectURL(blob)
      setPreviewUrl(objectUrl)

      if (fileType === 'DOCX') {
        const arrayBuffer = await response.arrayBuffer()
        const result = await mammoth.convertToHtml({ arrayBuffer })
        setPreviewContent(DOMPurify.sanitize(result.value))
        setPreviewType('html')
      } else if (fileType === 'Text') {
        const text = await response.text()
        setPreviewContent(text)
        setPreviewType('text')
      } else if (fileType === 'Image') {
        setPreviewType('image')
      } else if (fileType === 'PDF') {
        setPreviewType('pdf')
      } else {
        setPreviewContent(`Preview not available for ${fileType} files.`)
        setPreviewType('text')
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load document')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (documentUrl) {
      loadDocument()
    }
  }, [documentUrl])

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  return (
    <div className="flex min-h-full bg-background items-center justify-center">
      <div className="w-full px-4 container">
        <div className="w-full">
          <div className="w-full">
            <Card className="h-[calc(100vh-4rem)] bg-transparent border-none rounded-none w-full relative border">
              {isLoading && (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading document...</span>
                </div>
              )}
              
              {error && (
                <Alert className="m-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {!isLoading && !error && (
                <>
                  <div className="absolute top-4 right-4 z-10 flex gap-2 bg-background/80 p-2 rounded-lg shadow-lg">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      className="flex items-center gap-2 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                    {isClipboardSupported && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyToClipboard}
                        className="flex items-center gap-2 transition-colors"
                      >
                        {copySuccess ? (
                          <>
                            <Check className="h-4 w-4" />
                            <span className="hidden sm:inline">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            <span className="hidden sm:inline">Copy</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  <div className="pt-16"> {/* Add padding to prevent content from going under the buttons */}
                    {previewType === 'html' && (
                      <ScrollArea className="h-[calc(100vh-8rem)] p-4">
                        <div 
                          className="prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: previewContent }}
                        />
                      </ScrollArea>
                    )}
                    
                    {previewType === 'text' && (
                      <ScrollArea className="h-[calc(100vh-8rem)]">
                        <pre className="p-4 whitespace-pre-wrap font-mono text-sm">
                          {previewContent}
                        </pre>
                      </ScrollArea>
                    )}
                    
                    {previewType === 'image' && previewUrl && (
                      <div className="flex items-center justify-center p-4 h-[calc(100vh-8rem)]">
                        <img 
                          src={previewUrl} 
                          alt="Document preview" 
                          className="max-w-full max-h-full object-contain"
                          style={{ transform: `scale(${zoomLevel / 100})` }}
                        />
                      </div>
                    )}
                    
                    {previewType === 'pdf' && previewUrl && (
                      <div className="h-[calc(100vh-8rem)] w-full">
                        <iframe
                          src={previewUrl}
                          className="w-full h-full border-none"
                          title="PDF Viewer"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocumentViewer