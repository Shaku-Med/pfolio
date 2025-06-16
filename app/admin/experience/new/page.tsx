import React from 'react'
import { ExperienceForm } from './components/ExperienceForm'

const Page = () => {
  return (
    <div className="container mx-auto py-10 px-2">
      <h1 className="text-3xl font-bold mb-8 text-center">Add New Experience</h1>
      <ExperienceForm />
    </div>
  )
}

export default Page
