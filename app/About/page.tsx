import React from 'react'
import About from '@/app/about/components/About';
import { getExperience, getFeaturedProjects, getSkills } from './components/GetInfos';


const page = async () => {
  let featuredProjects = await getFeaturedProjects(4, ['id', 'title', 'description', 'technologies', 'previewLinks', 'sourceCodeLinks', 'programmingLanguages', 'status', 'featured', 'view', 'comments', 'date', 'thumbnail', 'user_id']);
  let experience = await getExperience(4, ['id', 'title', 'sub_title', 'company', 'position', 'start', 'end', 'is_present', 'description']);
  let skills = await getSkills(4, ['id', 'name', 'color', 'level']);

  return (
    <>
      <About experience={experience} projects={featuredProjects} skills={skills}/>
    </>
  )
}

export default page
