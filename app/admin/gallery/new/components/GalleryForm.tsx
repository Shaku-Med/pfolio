'use client'

import React, { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileUpload } from '@/app/@footer/components/Chat/Component/FileUpload'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import GalleryAction from './Action/GalleryAction'

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  tags: z.array(z.string()),
})

export function GalleryForm({data}: {data?: any}) {
  const [files, setFiles] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tagInput, setTagInput] = useState('')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: data?.title || '',
      description: data?.description || '',
      tags: data?.tags || [],
    },
  })

  // Set initial files if data exists
  React.useEffect(() => {
    if (data?.fileData) {
      setFiles([{
        url: data.fileData.url,
        file: {
          type: data.fileData.type,
          name: data.fileData.name,
          size: data.fileData.size,
          lastModified: data.fileData.lastModified,
        },
        isVideo: data.fileData.isVideo,
        responseData: data.fileData.thumbnail ? {
          thumbnail: {
            url: data.fileData.thumbnail
          }
        } : undefined
      }])
    }
  }, [data])

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const newTag = tagInput.trim()
      if (newTag && !form.getValues('tags').includes(newTag)) {
        const currentTags = form.getValues('tags')
        form.setValue('tags', [...currentTags, newTag])
      }
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags')
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove))
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)
      
      if (files.length === 0) {
        toast.error('Please upload at least one file')
        return
      }

      let file = files[0]
      let fileData: object = {}

      if(file?.isVideo){
          fileData = {
              url: file?.url,
              type: file?.file?.type,
              name: file?.file?.name,
              size: file?.file?.size,
              lastModified: file?.file?.lastModified,
              isVideo: false,
              thumbnail: file?.responseData?.thumbnail?.url
          }

          console.log(fileData)
      }
      else {
        fileData = {
            url: file?.url,
            type: file?.file?.type,
            name: file?.file?.name,
            size: file?.file?.size,
            lastModified: file?.file?.lastModified,
            isVideo: false,
        }
      }

      let fdAta = data ? {} : {fileData}
      let submitData = {...values, ...fdAta}
      let isSuccess = await GalleryAction(submitData, !!data, data?.id)
      if(isSuccess){
        toast.success('Gallery post created successfully')
        form.reset()
        setFiles([])
        setTagInput('')
      }
      else {
        toast.error('Failed to create gallery post')
      }
    } catch (error) {
      toast.error('Failed to create gallery post')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter gallery title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter gallery description" 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Type a tag and press Enter or comma" 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                />
              </FormControl>
              {field.value.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {field.value.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <FormLabel>Media Files</FormLabel>
            <span className="text-sm text-muted-foreground">
              {files.length} {files.length === 1 ? 'file' : 'files'} selected
            </span>
          </div>
          <FileUpload
            onFilesChange={setFiles}
            maxFiles={1}
            maxSize={1024 * 1024 * 200} // 200MB
            accept={{
              'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
              'video/*': ['.mp4', '.mov', '.avi']
            }}
            addVideoThumbnail={true}
            outsideAdmin
          />
        </Card>

        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? `${data ? 'Updating' : 'Creating'}...` : `${data ? 'Update' : 'Create'} Gallery Post`}
        </Button>
      </form>
    </Form>
  )
} 