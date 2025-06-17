import ModernPortfolio from '@/components/home/Main'
import React from 'react'
import { getExperience, getFeaturedProjects, getPost, getSkills } from '@/app/about/components/GetInfos'


const page = async () => {
  try {
    let skills = await getSkills(20, ['id', 'name'])
    let experience = await getExperience(5, [`id`, `title`, `sub_title`, `description`, `start`, `end`, `is_present`, `location`, `task_completed`, `type`, `company`, `position`])
    let projects = await getFeaturedProjects(4, ['id', 'title', 'description', 'date', 'programmingLanguages', 'thumbnail', 'sourceCodeLinks', 'previewLinks', 'status', 'featured', 'user_id'])
    let posts = await getPost(4, [`id`, `text`, `location`, `post_file`, `description`, `tags`, `likes`, `comments`, `shares`, `views`, `user_id`, `created_at`, `updated_at`])
    // 
    return (
      <>
        <ModernPortfolio skills={skills || []} experience={experience??[]} projects={projects??[]} posts={posts as any}/>
      </>
    )
  }
  catch {
    return (
      <>
        <div className='flex items-center justify-center h-screen'>
          <h1 className='text-4xl font-bold text-center'>
            Something went wrong, Please try refreshing your page.
          </h1>
        </div>
      </>
    )
  }
}

export default page
