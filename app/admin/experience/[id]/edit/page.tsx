import React from 'react'
import { ExperienceForm } from '../../new/components/ExperienceForm'
import { getExperience } from '@/app/about/page';
import Link from 'next/link';
import DeleteButton from './components/DeleteButton';

const page = async ({params}: {params: {id: string}}) => {
  try {
    let id = [`${await params?.id}`]
    let experience = await getExperience(1, ['id', 'title', 'sub_title', 'company', 'position', 'start', 'end', 'is_present', 'description', 'location', 'type', 'task_completed'], {}, id);

    if(!experience || experience.length === 0) {
      return (
        <div className="container mx-auto py-10 px-2">
          <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <div className="text-4xl font-bold text-muted-foreground">404</div>
            <div className="text-xl font-semibold">Experience not found</div>
            <Link href="/admin/experience/new" className="text-primary hover:text-primary/80 underline border px-10 py-2 rounded-lg">
              Create New Experience
            </Link>
          </div>
        </div>
      )
    }
    
    return (
      <div className="container flex flex-col items-center justify-center gap-4 mx-auto py-10 px-2">
        <h1 className="text-3xl font-bold mb-8 text-center">Edit Experience</h1>
        <DeleteButton id={experience[0].id || ''}/>
        <ExperienceForm data={experience[0]} />
      </div>
    )
  }
  catch (error) {
    return (
      <div className="container mx-auto py-10 px-2">
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <div className="text-4xl font-bold text-destructive">Error</div>
          <div className="text-xl font-semibold">Something went wrong</div>
          <Link href="/admin/experience" className="text-primary hover:text-primary/80 underline border px-10 py-2 rounded-lg">
            Back to Experiences
          </Link>
        </div>
      </div>
    )
  }
}

export default page
