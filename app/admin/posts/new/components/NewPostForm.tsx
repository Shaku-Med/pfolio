'use client'

import { useState } from 'react'
import { FileUpload } from '@/app/@footer/components/Chat/Component/FileUpload'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  Camera, 
  Video, 
  Music, 
  MapPin, 
  Hash, 
  Type, 
  FileText, 
  Plus,
  X,
  Send,
  Eye,
  Users,
  Clock,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import MDEditor from '@uiw/react-md-editor'
import HandlePosts from './Action/HandlePosts'

export function NewPostForm({data}: {data?: any}) {

  const router = useRouter()
  const [text, setText] = useState(data?.text || '')
  const [location, setLocation] = useState(data?.location || '')
  const [description, setDescription] = useState(data?.description || '')
  const [longDescription, setLongDescription] = useState(data?.long_description || '')
  const [tags, setTags] = useState(data?.tags || '')
  const [tagArray, setTagArray] = useState<string[]>(data?.tags || [])
  const [files, setFiles] = useState<any[]>(data?.post_file || [])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const maxCharacters = 2000
  const textProgress = (text.length / maxCharacters) * 100

  const handleTagInput = (value: string) => {
    setTags(value)
    const newTags = value.split(',').map(tag => tag.trim()).filter(Boolean)
    setTagArray(newTags)
  }

  const removeTag = (indexToRemove: number) => {
    const newTags = tagArray.filter((_, index) => index !== indexToRemove)
    setTagArray(newTags)
    setTags(newTags.join(', '))
  }

  const addQuickTag = (tag: string) => {
    if (!tagArray.includes(tag)) {
      const newTags = [...tagArray, tag]
      setTagArray(newTags)
      setTags(newTags.join(', '))
    }
  }

  const quickTags = ['trending', 'viral', 'funny', 'inspiration', 'lifestyle', 'technology', 'art', 'music']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
        const postData = {
            text,
            location,
            description,
            long_description: longDescription,
            tags: tagArray,
            post_file: files.flatMap((v: any) => {
               let thumbnail = !v?.responseData?.fileType?.startsWith('image') ? v?.responseData?.thumbnail?.url?.[0] : null
                return {
                    totalChunks: v.totalChunks,
                    progress: v.progress,
                    status: v.status,
                    customName: v.customName,
                    url: v.url,
                    fileType: v.fileType,
                    thumbnail: thumbnail
                }
            }),
        }

        
        let res = await HandlePosts(postData, !!data?.id, data?.id)
        if(!res) {
            toast.error('❌ Failed to ' + (data?.id ? 'update' : 'create') + ' post')
            return
        }

      setText('')
      setLocation('')
      setDescription('')
      setLongDescription('')
      setTags('')
      setTagArray([])
      setFiles([])
      
      toast.success('🎉 Post ' + (data?.id ? 'updated' : 'created') + ' successfully!')

    } catch (error) {
      toast.error('❌ Failed to ' + (data?.id ? 'update' : 'create') + ' post')
      console.error('Error ' + (data?.id ? 'updating' : 'creating') + ' post:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getFileTypeIcon = () => {
    if (files.some(file => file?.file?.type?.startsWith('video/'))) return <Video className="w-5 h-5" />
    if (files.some(file => file?.file?.type?.startsWith('audio/'))) return <Music className="w-5 h-5" />
    if (files.some(file => file?.file?.type?.startsWith('image/'))) return <ImageIcon className="w-5 h-5" />
    return <Camera className="w-5 h-5" />
  }

  const steps = [
    { id: 1, title: 'Content', icon: Type },
    { id: 2, title: 'Media', icon: Camera },
    { id: 3, title: 'Details', icon: FileText }
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8 text-primary" />
          {data?.id ? 'Edit Post' : 'Create New Post'}
        </h1>
        <p className="text-muted-foreground">{data?.id ? 'Update your post' : 'Share your moment with the world'}</p>
      </div>

      {/* Progress Steps */}
      <Card className="border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const StepIcon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              
              return (
                <div key={step.id} className="flex items-center">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isActive 
                        ? 'bg-primary border-primary text-primary-foreground' 
                        : isCompleted 
                        ? 'bg-primary/10 border-primary text-primary' 
                        : 'bg-muted border-muted-foreground/30 text-muted-foreground'
                    }`}
                  >
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <span className={`ml-2 font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`mx-4 h-0.5 w-16 ${isCompleted ? 'bg-primary' : 'bg-muted'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Content */}
        {currentStep === 1 && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="w-5 h-5 text-primary" />
                What's on your mind?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="text" className="text-base font-medium">Post Content</Label>
                  <span className={`text-sm ${textProgress > 90 ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {text.length}/{maxCharacters}
                  </span>
                </div>
                <Textarea
                  id="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Share your thoughts, experiences, or anything that's on your mind..."
                  className="min-h-[120px] text-base resize-none"
                  maxLength={maxCharacters}
                  required
                />
                <Progress value={textProgress} className="h-2" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2 text-base font-medium">
                  <MapPin className="w-4 h-4 text-primary" />
                  Location
                </Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Where are you?"
                  className="text-base"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setCurrentStep(2)} disabled={!text.trim()}>
                  Next: Add Media
                  <Camera className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Media */}
        {currentStep === 2 && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                Add Media
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-medium">Upload Photos, Videos, or Audio</Label>
                <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 hover:border-primary/50 transition-colors">
                  <FileUpload
                    onFilesChange={(uploadedFiles) => setFiles(uploadedFiles)}
                    maxFiles={10}
                    maxSize={1024 * 1024 * 100}
                    accept={{
                      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
                      'video/*': ['.mp4', '.mov', '.avi'],
                      'audio/*': ['.mp3', '.wav', '.ogg']
                    }}
                    outsideAdmin
                    addVideoThumbnail
                  />
                </div>
                
                {files.length > 0 && (
                  <div className="bg-primary/5 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-primary font-medium mb-2">
                      {getFileTypeIcon()}
                      {files.length} file{files.length > 1 ? 's' : ''} selected
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {files.map((file, index) => (
                        <div key={index} className="text-sm text-muted-foreground bg-background rounded p-2">
                          {file.name || `File ${index + 1}`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  <Type className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={() => setCurrentStep(3)}>
                  Next: Add Details
                  <FileText className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Details */}
        {currentStep === 3 && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Post Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-medium">Short Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A brief summary of your post for previews and search..."
                  className="min-h-[80px] resize-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longDescription" className="text-base font-medium">Detailed Description</Label>
                <div data-color-mode="dark">
                  <MDEditor
                    value={longDescription}
                    onChange={(value) => setLongDescription(value || '')}
                    preview="edit"
                    height={200}
                    className="!bg-transparent border-0 border-b border-slate-300 dark:border-slate-600 rounded-none focus:border-blue-500 focus:ring-0 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="flex items-center gap-2 text-base font-medium">
                  <Hash className="w-4 h-4 text-primary" />
                  Tags
                </Label>
                
                <div className="space-y-3">
                  <Input
                    value={tags}
                    onChange={(e) => handleTagInput(e.target.value)}
                    placeholder="Add tags separated by commas..."
                    className="text-base"
                  />
                  
                  {tagArray.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tagArray.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                          #{tag}
                          <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="ml-2 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Quick tags:</span>
                    <div className="flex flex-wrap gap-2">
                      {quickTags.map((tag) => (
                        <Button
                          key={tag}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addQuickTag(tag)}
                          disabled={tagArray.includes(tag)}
                          className="h-8"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          {tag}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  <Camera className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !text.trim() || !description.trim()}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      {data?.id ? 'Updating Post...' : 'Creating Post...'}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {data?.id ? 'Update Post' : 'Publish Post'}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preview Card */}
        {text && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-foreground">{text}</p>
                {location && (
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <MapPin className="w-4 h-4" />
                    {location}
                  </div>
                )}
                {tagArray.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {tagArray.map((tag, index) => (
                      <span key={index} className="text-primary text-sm">#{tag}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-4 text-muted-foreground text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>Public</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Now</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  )
}