import React from 'react'
import Link from 'next/link'
import { ArrowRight, Github, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import ProjectCard from './components/ProjectCard'
import AnimatedHeader from './components/AnimatedHeader'
import SearchForm from './components/SearchForm'
import Pagination from './components/Pagination'
import { getProjects } from '../admin/projects/page'

const ProjectPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) => {
  try {
    const params = await searchParams;
    const { projects, totalPages } = await getProjects(params);
    const currentPage = Number(params.page) || 1;
    const search = params.search as string || '';

    if(projects.length < 1) {
      return (
        <div className='flex items-center justify-center h-screen'>
          <p className='text-2xl font-bold'>No projects found</p>
        </div>
      )
    }

    return (
      <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
        <div className=" container lg:px-10 mx-auto">
          <div className="flex flex-col md:flex- mb-8 items-center justify-between gap-4 w-full">
            <AnimatedHeader />
            <SearchForm initialSearch={search} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <ProjectCard project={project} index={index} key={index}/>
            ))}
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} search={search} />
        </div>
      </div>
    )
  }
  catch {
    return (
      <div className='flex items-center justify-center h-screen'>
        <p className='text-2xl font-bold'>No projects found</p>
      </div>
    )
  }
}

export default ProjectPage
