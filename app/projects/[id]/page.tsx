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
import { Metadata } from 'next'

type Props = {
  params: Promise<{ id: string }>
 }
 
 export async function generateMetadata({params}: Props): Promise<Metadata> {
  try {
    const {id} = await params
    if(!id) return {}
    if(!db) return {}
    const project = await getProject(id)
    if(!project) return {}
 
    const cleanDescription = project.description?.replace(/\n+/g, ' ').trim().slice(0, 160) || 'Discover this innovative project by Mohamed Amara showcasing modern development practices and cutting-edge technology solutions.';
    const projectTechnologies = [...(project.frameworks || []), ...(project.programmingLanguages || []), ...(project.technologies || [])].join(', ');
    const categoryLabel = project.category?.replace('-', ' ') || 'software project';
    

    const baseUrl = project?.thumbnail?.url[0][project?.thumbnail?.url[0]?.length - 1]
    const ImageUrl = `/api/open/?url=${encodeURIComponent(baseUrl?.split('_')[0] || '')}&id=${project?.user_id}&length=${project?.thumbnail?.totalChunks}&type=${project?.thumbnail?.fileType}`

    return {
      title: {
        absolute: `${project.title} - Mohamed Amara | Medzy Amara`
      },
      description: cleanDescription,
      keywords: [
        `${project.title}`,
        'Mohamed Amara project',
        'Medzy Amara',
        categoryLabel,
        ...(project.tags || []),
        ...(project.frameworks || []),
        ...(project.programmingLanguages || []),
        ...(project.technologies || []),
        project.status === 'completed' ? 'completed project' : 'ongoing project',
        project.teamSize === 'solo' ? 'solo project' : 'team project',
        ...(project.platforms || []).map((platform: string) => `${platform} application`)
      ].filter(Boolean),
      authors: [{ name: 'Mohamed Amara' }],
      creator: 'Mohamed Amara',
      publisher: 'Mohamed Amara',
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      openGraph: {
        title: `${project.title} | Mohamed Amara Portfolio`,
        description: cleanDescription,
        url: `/projects/${id}`,
        siteName: 'Mohamed Amara - Developer Portfolio',
        images: project.thumbnail?.url ? [
          {
            url: ImageUrl,
            width: 1200,
            height: 630,
            alt: `${project.title} - Mohamed Amara Project Screenshot`,
          },
        ] : [
          {
            url: `/Icons/web/OgImages/og-project-default.png`,
            width: 1200,
            height: 630,
            alt: `${project.title} - Mohamed Amara Project`,
          },
        ],
        locale: 'en_US',
        type: 'article',
        authors: ['Mohamed Amara'],
        publishedTime: project.date,
        modifiedTime: project.updated_at || project.created_at,
        section: 'Projects',
        tags: project.tags || [],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${project.title} | Built by Mohamed Amara`,
        description: cleanDescription,
        images: project.thumbnail?.url ? [
          ImageUrl
        ] : ['/Icons/web/OgImages/og-project-default.png'],
        creator: '@medzyamara',
        site: '@medzyamara',
      },
      alternates: {
        canonical: `/projects/${id}`,
      },
      category: `${categoryLabel.charAt(0).toUpperCase() + categoryLabel.slice(1)} Project`,
      classification: 'Project',
      other: {
        'profile:first_name': 'Mohamed',
        'profile:last_name': 'Amara',
        'profile:username': 'medzyamara',
        'article:author': 'Mohamed Amara',
        'article:section': 'Projects',
        'project:status': project.status,
        'project:category': project.category,
        'project:duration': project.duration,
        'project:technologies': projectTechnologies,
        'project:client': project.clientName,
        'project:budget': project.budget,
        'project:team_size': project.teamSize,
        ...(project.view && { 'project:views': project.view.toString() }),
        ...(project.featured && { 'project:featured': 'true' }),
      }
    }
  }
  catch {
    return {
      title: {
        absolute: `Project - Mohamed Amara`
      },
      description: 'Explore innovative projects by Mohamed Amara featuring AI development, cybersecurity solutions, and full-stack applications built with modern technologies.',
      keywords: ['Mohamed Amara project', 'software development', 'AI projects', 'cybersecurity', 'full stack development'],
      openGraph: {
        title: 'Project - Mohamed Amara | Developer Portfolio',
        description: 'Discover cutting-edge projects showcasing modern development practices and innovative solutions.',
        url: '/projects',
        siteName: 'Mohamed Amara Portfolio',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Project - Mohamed Amara | Innovation in Code',
        description: 'Explore projects that blend creativity with technical excellence.',
        creator: '@medzyamara',
      },
      alternates: {
        canonical: '/projects',
      }
    }
  }
 }

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