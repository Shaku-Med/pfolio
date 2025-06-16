import { Project } from '@/app/admin/projects/page'
import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import ProjectMediaViewer from './components/ProjectMediaViewer'

const ProjectGallery = ({ project, setIsGalleryOpen, isGalleryOpen }: { project?: Project, setIsGalleryOpen: (isGalleryOpen: number | null) => void, isGalleryOpen: number | null }) => {
  try {
    let handleClose = () => {
      setIsGalleryOpen(null)
    }
    return (
      <>
        <Dialog open={isGalleryOpen !== null} onOpenChange={handleClose}>
          <DialogContent className={`min-w-full overflow-hidden flex flex-col justify-between items-center h-full z-[100000001] rounded-none border-none`}>
           <div className='w-full h-full fixed top-0 left-0'>
             <ProjectMediaViewer defaultIndex={isGalleryOpen || 0} files={project?.project_files || []} projectId={project?.id || ''} userId={project?.user_id || ''}/>
           </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }
  catch {
    setIsGalleryOpen(null)
    return
  }
}

export default ProjectGallery
