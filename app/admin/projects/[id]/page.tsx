import React from 'react'
import db from '@/lib/Database/Supabase/Base'
import ProjectPage from './components/ProjectPage';

// yo, let's get that project data by ID
export async function getProject(id: string) {
  if (!db) return null;
  
  try {
    const { data, error } = await db
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('oops, something went wrong:', error);
    return null;
  }
}

export default async function page({ params }: { params: { id: string } }) {
    const project = await getProject(params.id)

    return (
        <>
            <ProjectPage project={project}/>
        </>
    )
}