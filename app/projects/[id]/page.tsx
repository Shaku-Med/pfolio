import { getProject } from '@/app/admin/projects/[id]/page'
import React from 'react'
import { ProjectHeader } from './components/ProjectHeader'
import { ProjectInfo } from './components/ProjectInfo'
import { ProjectMetrics } from './components/ProjectMetrics'
import { ProjectTechnologies } from './components/ProjectTechnologies'
import { ProjectTimeline } from './components/ProjectTimeline'
import ProjectGallery from './components/ProjectGallery'
import { ProjectComments } from './components/ProjectComments'
import { GenerateToken } from '@/app/posts/[id]/components/GenerateToken'
import { ErrorCard } from '@/app/posts/[id]/ErrorCard'
import db from '@/lib/Database/Supabase/Base'

export default async function page({ params }: { params: Promise<{ id: string }> }) {
  let {id} = await params
  if(!db){
    return <ErrorCard title="Error" message={`Access Configuration Error.`}/>
  }
  // update the project view count
  try {
    const { data: projectData, error: fetchError } = await db.from('projects').select('view').eq('id', id).single()
    
    if (fetchError) {
      console.error('Error fetching project view count:', fetchError)
      return <ErrorCard title="Error" message="Failed to fetch project data."/>
    }

    const currentViews = projectData?.view || 0
    const { error: updateError } = await db.from('projects')
      .update({ view: currentViews + 1 })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating view count:', updateError)
      // Continue execution even if view count update fails
    }
  } catch (err) {
    console.error('Unexpected error:', err)
    // Continue execution even if view count update fails
  }

  const project = await getProject(id)

  let token = await GenerateToken()
  if(!token) {
    return (
      <ErrorCard
        title="Error"
        message={`Looks like we were unable to get the most important data to load this post. Refresh the page or try again later.`}
      />
    )
  }
  return (
    <div className="min-h-screen">
      <div className=" mx-auto py-8 flex items-center justify-center flex-col w-full">
        <ProjectHeader project={project} />
        <div className="grid container w-full lg:px-10 md:px-0 px-4 grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-8">
            <ProjectComments project={project} projectId={id} token={token} />
            <ProjectInfo project={project} />
            <ProjectTechnologies project={project} />
            <ProjectTimeline project={project} />
          </div>
          <div className="space-y-8">
            <ProjectMetrics project={project} />
          </div>
        </div>
      </div>
    </div>
  )
}