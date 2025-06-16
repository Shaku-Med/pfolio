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
  AlertCircle
} from 'lucide-react'
import * as mammoth from 'mammoth'
import { Alert, AlertDescription } from './components/ui/alert'
import { ScrollArea } from './components/ui/scroll-area'
import DOMPurify from 'dompurify'

// React PDF Viewer imports
import { Viewer, Worker } from '@react-pdf-viewer/core'
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout'

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'

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
  const [currentPage, setCurrentPage] = useState(1)
  const [documentUrl] = useState(`${window.location.origin}/resume.pdf`)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [previewContent, setPreviewContent] = useState<string>('')
  const [previewType, setPreviewType] = useState<'html' | 'image' | 'pdf' | 'text'>('text')
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [pdfFileUrl, setPdfFileUrl] = useState<string>('')
  const [documentInfo, setDocumentInfo] = useState<DocumentInfo>({
    title: "Sample Document",
    author: "Unknown",
    createdAt: new Date().toISOString().split('T')[0],
    fileSize: "Unknown",
    pages: 1,
    fileType: "PDF"
  })

  // Create plugin instance
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => [
      defaultTabs[0], // Thumbnail tab
      defaultTabs[1], // Bookmark tab
    ],
  })

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

  const loadDocument = async () => {
    if (!documentUrl.trim()) {
      setError('Please enter a valid URL')
      return
    }

    setIsLoading(true)
    setError('')
    setPreviewContent('')
    setPreviewUrl('')
    setPdfFileUrl('')

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
        setPdfFileUrl(objectUrl)
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
  }, [])

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      if (pdfFileUrl) {
        URL.revokeObjectURL(pdfFileUrl)
      }
    }
  }, [previewUrl, pdfFileUrl])

  return (
    <div className="flex min-h-screen bg-background">
      <div className="w-full px-4">
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
                  {previewType === 'html' && (
                    <ScrollArea className="h-full p-4">
                      <div 
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: previewContent }}
                      />
                    </ScrollArea>
                  )}
                  
                  {previewType === 'text' && (
                    <ScrollArea className="h-full">
                      <pre className="p-4 whitespace-pre-wrap font-mono text-sm">
                        {previewContent}
                      </pre>
                    </ScrollArea>
                  )}
                  
                  {previewType === 'image' && previewUrl && (
                    <div className="flex items-center justify-center p-4 h-full">
                      <img 
                        src={previewUrl} 
                        alt="Document preview" 
                        className="max-w-full max-h-full object-contain"
                        style={{ transform: `scale(${zoomLevel / 100})` }}
                      />
                    </div>
                  )}
                  
                  {previewType === 'pdf' && pdfFileUrl && (
                    <div className="h-full w-full">
                      <Worker workerUrl="https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js">
                        <Viewer
                        theme={'dark'}
                            
                          fileUrl={pdfFileUrl}
                          plugins={[defaultLayoutPluginInstance]}
                          onDocumentLoad={(e) => {
                            setDocumentInfo(prev => ({
                              ...prev,
                              pages: e.doc.numPages
                            }))
                          }}
                        />
                      </Worker>
                    </div>
                  )}
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