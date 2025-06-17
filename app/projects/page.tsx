import React from 'react'
import Link from 'next/link'
import { ArrowRight, Github, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import ProjectCard from './components/ProjectCard'
import AnimatedHeader from './components/AnimatedHeader'
import SearchForm from './components/SearchForm'
import Pagination from './components/Pagination'
import { getProjects } from '../admin/projects/page'
import { Metadata } from 'next'

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({searchParams}: Props): Promise<Metadata> {
  try {
    const params = await searchParams;
    const currentPage = Number(params.page) || 1;
    const search = params.search as string || '';
 
    const baseTitle = 'Projects - Mohamed Amara';
    const searchSuffix = search ? ` - ${search}` : '';
    const pageSuffix = currentPage > 1 ? ` - Page ${currentPage}` : '';
    const fullTitle = `${baseTitle}${searchSuffix}${pageSuffix}`;
 
    const baseDescription = "Explore Mohamed Amara's portfolio of projects spanning AI development, cybersecurity solutions, full-stack web applications, mobile apps, and desktop software. From machine learning models to secure web platforms, discover how I turn ideas into reality with clean code and innovative solutions.";
    const searchDescription = search ? `Projects filtered by "${search}" - ${baseDescription}` : baseDescription;
    const pageDescription = currentPage > 1 ? `Page ${currentPage} of Mohamed Amara's projects. ${searchDescription}` : searchDescription;
 
    return {
      title: {
        absolute: fullTitle
      },
      description: pageDescription,
      keywords: [
        'Mohamed Amara projects',
        'AI projects',
        'machine learning applications',
        'cybersecurity solutions',
        'full stack web apps',
        'mobile applications',
        'desktop software',
        'React projects',
        'Next.js applications',
        'Python AI models',
        'TypeScript projects',
        'open source projects',
        'student developer portfolio',
        'software engineering projects',
        'web development portfolio',
        search ? `${search} projects` : null,
        currentPage > 1 ? `page ${currentPage}` : null
      ].filter((keyword): keyword is string => keyword !== null),
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
        title: fullTitle,
        description: pageDescription,
        url: `https://medzyamara.dev/projects${search ? `?search=${encodeURIComponent(search)}` : ''}${currentPage > 1 ? `${search ? '&' : '?'}page=${currentPage}` : ''}`,
        siteName: 'Mohamed Amara - Developer Portfolio',
        images: [
          {
            url: `/Icons/web/OgImages/og-projects.png`,
            width: 1200,
            height: 630,
            alt: search ? `Mohamed Amara ${search} Projects` : 'Mohamed Amara Projects Portfolio',
          },
        ],
        locale: 'en_US',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: fullTitle,
        description: pageDescription,
        images: ['/Icons/web/OgImages/og-projects.png'],
        creator: '@medzyamara',
        site: '@medzyamara',
      },
      alternates: {
        canonical: `https://medzyamara.dev/projects${search ? `?search=${encodeURIComponent(search)}` : ''}${currentPage > 1 ? `${search ? '&' : '?'}page=${currentPage}` : ''}`,
      },
      category: 'Projects Portfolio',
      classification: 'Portfolio',
      other: {
        'profile:first_name': 'Mohamed',
        'profile:last_name': 'Amara',
        'profile:username': 'medzyamara',
        ...(search && { 'article:tag': search }),
        ...(currentPage > 1 && { 'article:section': `Page ${currentPage}` }),
      }
    }
  }
  catch {
    return {
      title: {
        absolute: `Projects - Mohamed Amara`
      },
      description: "Explore Mohamed Amara's diverse portfolio of AI, cybersecurity, web, mobile, and desktop applications. Discover innovative projects built with modern technologies and clean code practices.",
      keywords: ['Mohamed Amara projects', 'developer portfolio', 'AI projects', 'cybersecurity solutions', 'full stack applications'],
      openGraph: {
        title: 'Projects - Mohamed Amara | Developer Portfolio',
        description: "Check out Mohamed's collection of AI-powered applications, security tools, and full-stack projects that showcase modern development practices.",
        url: 'https://medzyamara.dev/projects',
        siteName: 'Mohamed Amara Portfolio',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Projects - Mohamed Amara | Innovation Meets Code',
        description: 'Discover projects that blend AI, security, and user experience into practical solutions.',
        creator: '@medzyamara',
      },
      alternates: {
        canonical: 'https://medzyamara.dev/projects',
      }
    }
  }
 }

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
