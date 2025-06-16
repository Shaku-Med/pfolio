import React from 'react'
import { EditSkillForm } from './components/EditSkillForm'
import { getSkills } from '@/app/about/page'

export default async function EditSkillPage({ params }: { params: { id: string } }) {
  const skills = await getSkills(1, ['*'], {}, [params.id])
  const skill = skills?.[0]

  if (!skill) {
    return (
        <div className='container mx-auto py-10 px-2'>
            <h1 className='text-3xl font-bold mb-8 text-center'>Skill not found</h1>
        </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-2">
      <h1 className="text-3xl font-bold mb-8 text-center">Edit Skill</h1>
      <EditSkillForm skill={skill} />
    </div>
  )
} 