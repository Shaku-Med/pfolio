'use client'

import React, { useState } from 'react'
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Building, User, FileText, Clock, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import AddExperience from './Action/AddExperience'
import MDEditor from '@uiw/react-md-editor'

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  sub_title: z.string().min(2, "Sub title must be at least 2 characters"),
  user_id: z.string().optional(),
  start: z.string().min(1, "Start date is required"),
  end: z.string().optional(),
  is_present: z.boolean(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  long_description: z.string().optional(),
  location: z.string().min(2, "Location must be at least 2 characters"),
  task_completed: z.array(z.string()),
  type: z.string().min(1, "Please select a type"),
  company: z.string().min(2, "Company must be at least 2 characters"),
  position: z.string().min(2, "Position must be at least 2 characters"),
})

type FormValues = z.infer<typeof formSchema>

const experienceTypes = [
  { value: "full-time", label: "Full Time" },
  { value: "part-time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "freelance", label: "Freelance" },
  { value: "volunteer", label: "Volunteer" },
  { value: "school", label: "School" },
]

export function ExperienceForm({data}: {data?: any}) {
  const [tasks, setTasks] = useState<string[]>(data?.task_completed || [])
  const [currentTask, setCurrentTask] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: data?.title || "",
      sub_title: data?.sub_title || "",
      user_id: data?.user_id || "",
      start: data?.start || "",
      end: data?.end || "",
      is_present: data?.is_present || false,
      description: data?.description || "",
      long_description: data?.long_description || "",
      location: data?.location || "",
      task_completed: data?.task_completed || [],
      type: data?.type || "",
      company: data?.company || "",
      position: data?.position || "",
    },
  })

  const isPresent = form.watch("is_present")

  const addTask = () => {
    if (currentTask.trim()) {
      const newTasks = [...tasks, currentTask.trim()]
      setTasks(newTasks)
      form.setValue("task_completed", newTasks, { shouldValidate: true })
      setCurrentTask("")
    }
  }

  const removeTask = (taskToRemove: string) => {
    const newTasks = tasks.filter(task => task !== taskToRemove)
    setTasks(newTasks)
    form.setValue("task_completed", newTasks, { shouldValidate: true })
  }

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      let addExperience = await AddExperience(values, !!data, data?.id);
      if(!addExperience) {
        toast.error(`Something went wrong! We were unable to complete your request`)
        return
      }
      form.reset()
      setTasks([])
      toast.success(data ? "Experience updated successfully!" : "Experience added successfully!")
    } catch (error) {
      console.error("Error creating experience:", error)
      toast.error(data ? "Failed to update experience. Please try again." : "Failed to add experience. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          {data ? "Edit Work Experience" : "Add Work Experience"}
        </CardTitle>
        <CardDescription>
          {data ? "Update your professional experience and achievements" : "Share your professional experience and achievements"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Title
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Senior Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sub_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sub Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Frontend Development Team" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Company
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Google Inc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Position
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Start Date
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      End Date
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={isPresent} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_present"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Current Position
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="San Francisco, CA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select employment type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {experienceTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your role, responsibilities, and achievements..."
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="long_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detailed Description</FormLabel>
                  <FormControl>
                    <div data-color-mode="dark">
                      <MDEditor
                        value={field.value}
                        onChange={field.onChange}
                        preview="edit"
                        height={200}
                        className="!bg-transparent border-0 border-b border-slate-300 dark:border-slate-600 rounded-none focus:border-blue-500 focus:ring-0 transition-all duration-300"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <Label>Key Achievements & Tasks</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a key achievement or task..."
                  value={currentTask}
                  onChange={(e) => setCurrentTask(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTask()
                    }
                  }}
                />
                <Button 
                  type="button" 
                  onClick={addTask} 
                  size="icon" 
                  variant="outline"
                  disabled={!currentTask.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {tasks.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tasks.map((task, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1 pr-1">
                      {task}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeTask(task)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  form.reset()
                  setTasks([])
                }}
                disabled={isSubmitting}
              >
                Reset
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (data ? "Updating..." : "Adding...") : (data ? "Update Experience" : "Add Experience")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}