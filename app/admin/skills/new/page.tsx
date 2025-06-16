import React from 'react'
import { SkillForm } from './components/SkillForm'

const Page = () => {
  return (
    <div className="container mx-auto py-10 px-2">
      <h1 className="text-3xl font-bold mb-8 text-center">Add New Skill</h1>
      <SkillForm />
    </div>
  )
}

export default Page
