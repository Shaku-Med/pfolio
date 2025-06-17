import React from 'react'
import db from '@/lib/Database/Supabase/Base'
import { Experience, Gallery, Project, Skill } from '@/app/admin/projects/page'
import About from '@/app/about/components/About'

export const getFeaturedProjects = async (limit: number = 4, select: string[] = ['*'], pagination: any = {}, ids?: string[]) => {
  try {
    if(!db) return [];
    let query = db
      .from('projects')
      .select(select.join(','))
      .eq('featured', true)
      .order('view', { ascending: false })
      .order('comments', { ascending: false });

    if (ids && ids.length > 0) {
      query = query.in('id', ids);
    }

    if (Object.keys(pagination).length > 0) {
      query = query.range(pagination.from, pagination.to);
    } else {
      query = query.limit(limit);
    }
    
    const {data, error} = await query;
    if(error || !data) return [];
    return (data as unknown) as Project[];
  }
  catch (e) {
    return []
  }
}

export const getExperience = async (limit: number = 4, select: string[] = ['*'], pagination: any = {}, ids?: string[]) => {
  try {
    if(!db) return [];
    let query = db
      .from('experience')
      .select(select.join(','))
      .order('is_present', { ascending: false })
      .order('start', { ascending: false })
      .order('end', { ascending: false });

    if (ids && ids.length > 0) {
      query = query.in('id', ids);
    }

    if (Object.keys(pagination).length > 0) {
      query = query.range(pagination.from, pagination.to);
    } else {
      query = query.limit(limit);
    }
    
    const {data, error} = await query;
    if(error || !data) return [];
    return (data as unknown) as Experience[];
  }
  catch (e) {
    return []
  }
}

export const getSkills = async (limit: number = 4, select: string[] = ['*'], pagination: any = {}, ids?: string[]) => {
  try {
    if(!db) return [];
    let query = db
      .from('skills')
      .select(select.join(','))
      .order('created_at', { ascending: false });

    if (ids && ids.length > 0) {
      query = query.in('id', ids);
    }

    if (Object.keys(pagination).length > 0) {
      query = query.range(pagination.from, pagination.to);
    } else {
      query = query.limit(limit);
    }
    
    const {data, error} = await query;
    if(error || !data) return [];
    return (data as unknown) as Skill[];
  }
  catch (e) {
    return []
  }
}


export const getGallery = async (limit: number = 4, select: string[] = ['*'], pagination: any = {}, ids?: string[]) => {
  try {
    if(!db) return [];
    let query = db
      .from('gallery')
      .select(select.join(','))
      .order('created_at', { ascending: false });

    if (ids && ids.length > 0) {
      query = query.in('id', ids);
    }

    if (Object.keys(pagination).length > 0) {
      query = query.range(pagination.from, pagination.to);
    } else {
      query = query.limit(limit);
    }
    
    const {data, error} = await query;
    if(error || !data) return [];
    return (data as unknown) as Gallery[];
  }
  catch (e) {
    return []
  }
}

export const getPost = async (limit: number = 4, select: string[] = ['*'], pagination: any = {}, ids?: string[]) => {
  try {
    if(!db) return [];
    let query = db
      .from('posts')
      .select(`
        ${select.join(',')},
        post_likes (
          user_id
        )
      `)
      .order('id', { ascending: false });

    if (ids && ids.length > 0) {
      query = query.in('id', ids);
    }

    const {data, error} = await query;
    if(error || !data) return [];
    
    const shuffled = [...data];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    if (Object.keys(pagination).length > 0) {
      return shuffled.slice(pagination.from, pagination.to + 1);
    } else {
      // console.log(shuffled)
      return shuffled.slice(0, limit);
    }
  }
  catch (e) {
    return []
  }
}

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
