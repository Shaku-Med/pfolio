'use client'
import React, { useState } from 'react'
import { FileUpload } from '@/app/@footer/components/Chat/Component/FileUpload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, ExternalLink, Github } from 'lucide-react'
import MDEditor from '@uiw/react-md-editor'
import Cookies from 'js-cookie'
import NewProjectAction from './Action/NewProjectAction'

interface TimelineEvent {
  title?: string;
  date: string;
  status: 'completed' | 'inprogress' | 'cancelled';
  description?: string;
}

interface ProjectFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error' | 'pending-thumbnail';
  error?: string;
  customName?: string;
  url?: string;
  thumbnail?: {
    url: string;
    file?: File;
    isCustom: boolean;
  };
  totalChunks?: number;
  fileType?: string;
}

interface LinkItem {
  id: string;
  url: string;
  label: string;
}

const NewProjectPage = ({isEdit = false, project}: {isEdit?: boolean, project?: any}) => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>(project?.project_files || [])
  const [thumbnailFile, setThumbnailFile] = useState<ProjectFile | null>(project?.thumbnail || null)
  const [previewLinks, setPreviewLinks] = useState<LinkItem[]>(
    project?.previewLinks?.length ? project.previewLinks : [{ id: '1', url: '', label: '' }]
  )
  const [sourceCodeLinks, setSourceCodeLinks] = useState<LinkItem[]>(
    project?.sourceCodeLinks?.length ? project.sourceCodeLinks : [{ id: '1', url: '', label: '' }]
  )
  
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    longDescription: project?.longDescription || '',
    category: project?.category || '',
    tags: project?.tags || [],
    date: project?.date || new Date().toISOString().split('T')[0],
    featured: project?.featured || false,
    status: project?.status || 'in-progress',
    programmingLanguages: project?.programmingLanguages || [],
    frameworks: project?.frameworks || [],
    technologies: project?.technologies || [],
    platforms: project?.platforms || [],
    duration: project?.duration || '',
    teamSize: project?.teamSize || '',
    challenges: project?.challenges || '',
    learnings: project?.learnings || '',
    achievements: project?.achievements || '',
    futureImprovements: project?.futureImprovements || '',
    clientName: project?.clientName || '',
    budget: project?.budget || '',
    priority: project?.priority || 'medium',
    timeline_events: project?.timeline_events || []
  })

  const handleFilesChange = (files: ProjectFile[]) => {
    setProjectFiles(files)
  }

  const handleThumbnailChange = (files: ProjectFile[]) => {
    setThumbnailFile(files.length > 0 ? files[0] : null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    // Handle array fields
    if (['tags', 'programmingLanguages', 'frameworks', 'technologies', 'platforms'].includes(name)) {
      setFormData(prev => ({ ...prev, [name]: value }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const addPreviewLink = () => {
    setPreviewLinks(prev => [...prev, { id: Date.now().toString(), url: '', label: '' }])
  }

  const removePreviewLink = (id: string) => {
    setPreviewLinks(prev => prev.filter(link => link.id !== id))
  }

  const updatePreviewLink = (id: string, field: 'url' | 'label', value: string) => {
    setPreviewLinks(prev => prev.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ))
  }

  const addSourceCodeLink = () => {
    setSourceCodeLinks(prev => [...prev, { id: Date.now().toString(), url: '', label: '' }])
  }

  const removeSourceCodeLink = (id: string) => {
    setSourceCodeLinks(prev => prev.filter(link => link.id !== id))
  }

  const updateSourceCodeLink = (id: string, field: 'url' | 'label', value: string) => {
    setSourceCodeLinks(prev => prev.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ))
  }

  const addTimelineEvent = () => {
    setFormData(prev => ({
      ...prev,
      timeline_events: [...prev.timeline_events, {
        title: '',
        date: new Date().toISOString().split('T')[0],
        status: 'inprogress',
        description: ''
      }]
    }))
  }

  const removeTimelineEvent = (index: number) => {
    setFormData(prev => ({
      ...prev,
      timeline_events: prev.timeline_events.filter((_: TimelineEvent, i: number) => i !== index)
    }))
  }

  const updateTimelineEvent = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      timeline_events: prev.timeline_events.map((event: TimelineEvent, i: number) => 
        i === index ? { ...event, [field]: value } : event
      )
    }))
  }

  const validateForm = () => {
    const errors: string[] = [];

    // Required fields validation
    if (!formData.title.trim()) {
      errors.push('Project title is required');
    }
    if (!formData.description.trim()) {
      errors.push('Short description is required');
    }
    if (!formData.category) {
      errors.push('Category is required');
    }
    if (!formData.status) {
      errors.push('Status is required');
    }
    if (!thumbnailFile) {
      errors.push('Project thumbnail is required');
    }

    // URL validation for preview and source code links
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    
    previewLinks.forEach((link, index) => {
      if (link.url.trim() && !urlRegex.test(link.url)) {
        errors.push(`Preview link ${index + 1} has an invalid URL format`);
      }
    });

    sourceCodeLinks.forEach((link, index) => {
      if (link.url.trim() && !urlRegex.test(link.url)) {
        errors.push(`Source code link ${index + 1} has an invalid URL format`);
      }
    });

    // Date validation
    const selectedDate = new Date(formData.date);
    const currentDate = new Date();
    if (selectedDate > currentDate) {
      errors.push('Project date cannot be in the future');
    }

    return errors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => {
        toast.error(error);
      });
      return;
    }

    setIsSubmitting(true);

    if (!Cookies.get('id')) {
      toast.error('Please login to create a project');
      setIsSubmitting(false);
      return;
    }

    try {
      // Process array fields before submission
      const processedFormData = {
        ...formData,
        tags: typeof formData.tags === 'string' ? formData.tags.split(',').map((item: string) => item.trim()).filter(Boolean) : formData.tags,
        programmingLanguages: typeof formData.programmingLanguages === 'string' ? formData.programmingLanguages.split(',').map((item: string) => item.trim()).filter(Boolean) : formData.programmingLanguages,
        frameworks: typeof formData.frameworks === 'string' ? formData.frameworks.split(',').map((item: string) => item.trim()).filter(Boolean) : formData.frameworks,
        technologies: typeof formData.technologies === 'string' ? formData.technologies.split(',').map((item: string) => item.trim()).filter(Boolean) : formData.technologies,
        platforms: typeof formData.platforms === 'string' ? formData.platforms.split(',').map((item: string) => item.trim()).filter(Boolean) : formData.platforms,
      };

      const projectData = {
        ...processedFormData,
        thumbnail: thumbnailFile ? {
            url: thumbnailFile.url,
            totalChunks: thumbnailFile.totalChunks,
            customName: thumbnailFile.customName,
            status: thumbnailFile.status,
            progress: thumbnailFile.progress,
            fileType: thumbnailFile.fileType
        } : null,
        project_files: projectFiles.map(file => ({
            totalChunks: file.totalChunks,
            progress: file.progress,
            status: file.status,
            customName: file.customName,
            url: file.url,
            fileType: file.fileType
        })),
        previewLinks: previewLinks.filter(link => link.url.trim()),
        sourceCodeLinks: sourceCodeLinks.filter(link => link.url.trim()),
        user_id: Cookies.get('id')
      };

      let res = await NewProjectAction(projectData, isEdit, project?.id)
      if(!res){
        toast.error(`Failed to ${isEdit ? 'update' : 'create'} project`);
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      toast.success(`Project ${isEdit ? 'updated' : 'created'} successfully!`);
      router.push('/admin/projects')
    } catch (error) {
      console.log(error)
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} project`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className=" flex flex-col items-center justify-center w-full">
      <div className="space-y-16 container lg:px-10 py-10">
        <div className="space-y-16">
          
          {/* Basic Info */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-700">
              <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
              <h2 className="text-3xl font-light ">Basic Information</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-8">
              <div className="lg:col-span-2">
                <Label htmlFor="title" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">Project Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter project title"
                  className="mt-4 h-14 text-xl border-0 border-b border-slate-300 dark:border-slate-600 rounded-none bg-transparent focus:border-blue-500 focus:ring-0 transition-all duration-300"
                  required
                />
              </div>

              <div>
                <Label htmlFor="date" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">Project Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="mt-4 h-14 border-0 border-b border-slate-300 dark:border-slate-600 rounded-none bg-transparent focus:border-blue-500 focus:ring-0 transition-all duration-300"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="mt-4 h-14 w-full border-0 border-b border-slate-300 dark:border-slate-600 rounded-none bg-transparent focus:border-blue-500 focus:ring-0">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web-development">Web Development</SelectItem>
                    <SelectItem value="mobile-app">Mobile App</SelectItem>
                    <SelectItem value="desktop-app">Desktop App</SelectItem>
                    <SelectItem value="ai-ml">AI/ML</SelectItem>
                    <SelectItem value="game-development">Game Development</SelectItem>
                    <SelectItem value="ui-ux-design">UI/UX Design</SelectItem>
                    <SelectItem value="data-science">Data Science</SelectItem>
                    <SelectItem value="blockchain">Blockchain</SelectItem>
                    <SelectItem value="iot">IoT</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="mt-4 h-14 w-full border-0 border-b border-slate-300 dark:border-slate-600 rounded-none bg-transparent focus:border-blue-500 focus:ring-0">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger className="mt-4 h-14 w-full border-0 border-b border-slate-300 dark:border-slate-600 rounded-none bg-transparent focus:border-blue-500 focus:ring-0">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="lg:col-span-3">
                <Label htmlFor="description" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">Short Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief overview of your project"
                  className="mt-4 min-h-[120px] border-0 border-b border-slate-300 dark:border-slate-600 rounded-none bg-transparent focus:border-blue-500 focus:ring-0 transition-all duration-300 resize-none"
                  required
                />
              </div>

              <div className="lg:col-span-3">
                <Label htmlFor="longDescription" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">Detailed Description</Label>
                <div className="mt-4" data-color-mode="dark">
                  <MDEditor
                    value={formData.longDescription}
                    onChange={(value) => setFormData(prev => ({ ...prev, longDescription: value || '' }))}
                    preview={`edit`}
                    height={200}
                    className="!bg-transparent border-0 border-b border-slate-300 dark:border-slate-600 rounded-none focus:border-blue-500 focus:ring-0 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="lg:col-span-3">
                <Label htmlFor="tags" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">Tags</Label>
                <Input
                  id="tags"
                  name="tags"
                  value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags}
                  onChange={handleInputChange}
                  placeholder="react, typescript, tailwind, nextjs"
                  className="mt-4 h-14 border-0 border-b border-slate-300 dark:border-slate-600 rounded-none bg-transparent focus:border-blue-500 focus:ring-0 transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* Technical Stack */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-700">
              <div className="w-1 h-8 bg-purple-500 rounded-full"></div>
              <h2 className="text-3xl font-light ">Technical Stack</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div>
                <Label htmlFor="programmingLanguages" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">Programming Languages</Label>
                <Input
                  id="programmingLanguages"
                  name="programmingLanguages"
                  value={Array.isArray(formData.programmingLanguages) ? formData.programmingLanguages.join(', ') : formData.programmingLanguages}
                  onChange={handleInputChange}
                  placeholder="JavaScript, Python, TypeScript"
                  className="mt-4 h-14 border-0 border-b border-slate-300 dark:border-slate-600 rounded-none bg-transparent focus:border-blue-500 focus:ring-0 transition-all duration-300"
                />
              </div>

              <div>
                <Label htmlFor="frameworks" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">Frameworks</Label>
                <Input
                  id="frameworks"
                  name="frameworks"
                  value={Array.isArray(formData.frameworks) ? formData.frameworks.join(', ') : formData.frameworks}
                  onChange={handleInputChange}
                  placeholder="React, Next.js, Express"
                  className="mt-4 h-14 border-0 border-b border-slate-300 dark:border-slate-600 rounded-none bg-transparent focus:border-blue-500 focus:ring-0 transition-all duration-300"
                />
              </div>

              <div>
                <Label htmlFor="technologies" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">Technologies & Tools</Label>
                <Input
                  id="technologies"
                  name="technologies"
                  value={Array.isArray(formData.technologies) ? formData.technologies.join(', ') : formData.technologies}
                  onChange={handleInputChange}
                  placeholder="Docker, AWS, MongoDB"
                  className="mt-4 h-14 border-0 border-b border-slate-300 dark:border-slate-600 rounded-none bg-transparent focus:border-blue-500 focus:ring-0 transition-all duration-300"
                />
              </div>

              <div>
                <Label htmlFor="platforms" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">Platforms</Label>
                <Input
                  id="platforms"
                  name="platforms"
                  value={Array.isArray(formData.platforms) ? formData.platforms.join(', ') : formData.platforms}
                  onChange={handleInputChange}
                  placeholder="Web, iOS, Android"
                  className="mt-4 h-14 border-0 border-b border-slate-300 dark:border-slate-600 rounded-none bg-transparent focus:border-blue-500 focus:ring-0 transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-700">
              <div className="w-1 h-8 bg-green-500 rounded-full"></div>
              <h2 className="text-3xl font-light ">Project Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-8">
              <div>
                <Label htmlFor="duration" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">Duration</Label>
                <Input
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="3 months, 2 weeks"
                  className="mt-4 h-14 border-0 border-b border-slate-300 dark:border-slate-600 rounded-none bg-transparent focus:border-blue-500 focus:ring-0 transition-all duration-300"
                />
              </div>

              <div>
                <Label htmlFor="teamSize" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">Team Size</Label>
                <Input
                  id="teamSize"
                  name="teamSize"
                  value={formData.teamSize}
                  onChange={handleInputChange}
                  placeholder="Solo, 3 people, 5-person team"
                  className="mt-4 h-14 border-0 border-b border-slate-300 dark:border-slate-600 rounded-none bg-transparent focus:border-blue-500 focus:ring-0 transition-all duration-300"
                />
              </div>

              <div>
                <Label htmlFor="clientName" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">Client/Company</Label>
                <Input
                  id="clientName"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  placeholder="Personal, Company Name"
                  className="mt-4 h-14 border-0 border-b border-slate-300 dark:border-slate-600 rounded-none bg-transparent focus:border-blue-500 focus:ring-0 transition-all duration-300"
                />
              </div>

              <div>
                <Label htmlFor="budget" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">Budget Range</Label>
                <Input
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  placeholder="$5k-10k, Personal project"
                  className="mt-4 h-14 border-0 border-b border-slate-300 dark:border-slate-600 rounded-none bg-transparent focus:border-blue-500 focus:ring-0 transition-all duration-300"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-4">
                <Label htmlFor="challenges" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">Challenges Faced</Label>
                <Textarea
                  id="challenges"
                  name="challenges"
                  value={formData.challenges}
                  onChange={handleInputChange}
                  placeholder="What obstacles did you overcome?"
                  className="mt-4 min-h-[100px] border-0 border-b border-slate-300 dark:border-slate-600 rounded-none bg-transparent focus:border-blue-500 focus:ring-0 transition-all duration-300 resize-none"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-4">
                <Label htmlFor="learnings" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">Key Learnings</Label>
                <Textarea
                  id="learnings"
                  name="learnings"
                  value={formData.learnings}
                  onChange={handleInputChange}
                  placeholder="What did you learn from this project?"
                  className="mt-4 min-h-[100px] border-0 border-b border-slate-300 dark:border-slate-600 rounded-none bg-transparent focus:border-blue-500 focus:ring-0 transition-all duration-300 resize-none"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-4">
                <Label htmlFor="achievements" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">Achievements & Results</Label>
                <Textarea
                  id="achievements"
                  name="achievements"
                  value={formData.achievements}
                  onChange={handleInputChange}
                  placeholder="What were the outcomes and impact?"
                  className="mt-4 min-h-[100px] border-0 border-b border-slate-300 dark:border-slate-600 rounded-none bg-transparent focus:border-blue-500 focus:ring-0 transition-all duration-300 resize-none"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-4">
                <Label htmlFor="futureImprovements" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">Future Improvements</Label>
                <Textarea
                  id="futureImprovements"
                  name="futureImprovements"
                  value={formData.futureImprovements}
                  onChange={handleInputChange}
                  placeholder="What would you do differently or add next?"
                  className="mt-4 min-h-[100px] border-0 border-b border-slate-300 dark:border-slate-600 rounded-none bg-transparent focus:border-blue-500 focus:ring-0 transition-all duration-300 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-700">
              <div className="w-1 h-8 bg-orange-500 rounded-full"></div>
              <h2 className="text-3xl font-light ">Links</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-12">
              {/* Preview Links */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ExternalLink className="w-5 h-5 text-slate-400" />
                    <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">Preview Links</Label>
                  </div>
                  <Button type="button" onClick={addPreviewLink} size="sm" variant="ghost" className="h-8 px-3 text-xs">
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
                <div className="space-y-4">
                  {previewLinks.map((link) => (
                    <div key={link.id} className="space-y-3">
                      <Input
                        placeholder="Label (e.g., Live Demo)"
                        value={link.label}
                        onChange={(e) => updatePreviewLink(link.id, 'label', e.target.value)}
                        className="h-12 border-0 border-b border-slate-300 dark:border-slate-600 rounded-none bg-transparent focus:border-blue-500 focus:ring-0 transition-all duration-300"
                      />
                      <div className="flex gap-3">
                        <Input
                          placeholder="https://your-project.com"
                          value={link.url}
                          onChange={(e) => updatePreviewLink(link.id, 'url', e.target.value)}
                          className="h-12 border-0 border-b border-slate-300 dark:border-slate-600 rounded-none bg-transparent focus:border-blue-500 focus:ring-0 transition-all duration-300"
                        />
                        {previewLinks.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removePreviewLink(link.id)}
                            size="sm"
                            variant="ghost"
                            className="h-12 w-12 p-0 text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Source Code Links */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Github className="w-5 h-5 text-slate-400" />
                    <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">Source Code Links</Label>
                  </div>
                  <Button type="button" onClick={addSourceCodeLink} size="sm" variant="ghost" className="h-8 px-3 text-xs">
                    <Plus className="w-4 h-4 mr-1" />
                    Add
                  </Button>
                </div>
                <div className="space-y-4">
                  {sourceCodeLinks.map((link) => (
                    <div key={link.id} className="space-y-3">
                      <Input
                        placeholder="Label (e.g., Frontend)"
                        value={link.label}
                        onChange={(e) => updateSourceCodeLink(link.id, 'label', e.target.value)}
                        className="h-12 border-0 border-b border-slate-300 dark:border-slate-600 rounded-none bg-transparent focus:border-blue-500 focus:ring-0 transition-all duration-300"
                      />
                      <div className="flex gap-3">
                        <Input
                          placeholder="https://github.com/username/repo"
                          value={link.url}
                          onChange={(e) => updateSourceCodeLink(link.id, 'url', e.target.value)}
                          className="h-12 border-0 border-b border-slate-300 dark:border-slate-600 rounded-none bg-transparent focus:border-blue-500 focus:ring-0 transition-all duration-300"
                        />
                        {sourceCodeLinks.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeSourceCodeLink(link.id)}
                            size="sm"
                            variant="ghost"
                            className="h-12 w-12 p-0 text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Events */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-700">
              <div className="w-1 h-8 bg-yellow-500 rounded-full"></div>
              <h2 className="text-3xl font-light">Timeline Events</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-end">
                <Button type="button" onClick={addTimelineEvent} size="sm" variant="ghost" className="h-8 px-3 text-xs">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Event
                </Button>
              </div>
              
              <div className="space-y-6">
                {formData.timeline_events.map((event: TimelineEvent, index: number) => (
                  <div key={index} className="p-6 border border-slate-200 dark:border-slate-700 rounded-lg space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-4">
                        <div>
                          <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">Event Title</Label>
                          <Input
                            value={event.title}
                            onChange={(e) => updateTimelineEvent(index, 'title', e.target.value)}
                            placeholder="Enter event title"
                            className="mt-2 h-12 border-0 border-b border-slate-300 dark:border-slate-600 rounded-none bg-transparent focus:border-blue-500 focus:ring-0"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">Date</Label>
                            <Input
                              type="date"
                              value={event.date}
                              onChange={(e) => updateTimelineEvent(index, 'date', e.target.value)}
                              className="mt-2 h-12 border-0 border-b border-slate-300 dark:border-slate-600 rounded-none bg-transparent focus:border-blue-500 focus:ring-0"
                            />
                          </div>
                          
                          <div>
                            <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">Status</Label>
                            <Select
                              value={event.status}
                              onValueChange={(value) => updateTimelineEvent(index, 'status', value)}
                            >
                              <SelectTrigger className="mt-2 h-12 border-0 border-b border-slate-300 dark:border-slate-600 rounded-none bg-transparent focus:border-blue-500 focus:ring-0">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="inprogress">In Progress</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">Description</Label>
                          <Textarea
                            value={event.description}
                            onChange={(e) => updateTimelineEvent(index, 'description', e.target.value)}
                            placeholder="Enter event description"
                            className="mt-2 min-h-[100px] border-0 border-b border-slate-300 dark:border-slate-600 rounded-none bg-transparent focus:border-blue-500 focus:ring-0 resize-none"
                          />
                        </div>
                      </div>
                      
                      <Button
                        type="button"
                        onClick={() => removeTimelineEvent(index)}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-700">
              <div className="w-1 h-8 bg-pink-500 rounded-full"></div>
              <h2 className="text-3xl font-light ">Media</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-12">
              <div className="space-y-4">
                <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">Project Thumbnail</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">Upload a main image for your project</p>
                <FileUpload
                  onFilesChange={handleThumbnailChange}
                  maxFiles={1}
                  maxSize={1024 * 1024 * 5}
                  autoUpload={true}
                  accept={{
                    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
                  }}
                  outsideAdmin={true}
                />
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em]">Project Gallery</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">Upload images, videos, or other media files</p>
                <FileUpload
                  onFilesChange={handleFilesChange}
                  maxFiles={10}
                  maxSize={1024 * 1024 * 150}
                  autoUpload={true}
                  accept={{
                    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
                    'video/*': ['.mp4', '.mov', '.avi', '.webm'],
                    'audio/*': ['.mp3', '.wav', '.m4a']
                  }}
                  outsideAdmin={true}
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-700">
              <div className="w-1 h-8 bg-indigo-500 rounded-full"></div>
              <h2 className="text-3xl font-light ">Settings</h2>
            </div>
            
            <div className="flex items-center gap-4">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                className="data-[state=checked]:bg-blue-500"
              />
              <div>
                <Label htmlFor="featured" className="text-base font-medium ">Featured Project</Label>
                <p className="text-sm text-slate-500 dark:text-slate-400">Show this project prominently on your portfolio</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-6 pt-12">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              disabled={isSubmitting}
              size="lg"
              className="px-12 h-14 text-base font-medium border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.title || (!thumbnailFile && !isEdit)}
              size="lg"
              onClick={handleSubmit}
              className="px-12 h-14 text-base font-medium bg-chart-2/80 hover:bg-chart-2 text-white disabled:opacity-50"
            >
              {isSubmitting ? `${isEdit ? 'Updating' : 'Creating'} Project...` : `${isEdit ? 'Update' : 'Create'} Project`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewProjectPage