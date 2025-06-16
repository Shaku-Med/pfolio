import React from 'react'
import NewProjectPage from '../../new/page'
import db from '@/lib/Database/Supabase/Base'

async function getProject(id: string) {
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
    console.error('Error fetching project:', error);
    return null;
  }
}

export default async function page({ params }: { params: { id: string } }) {
  const project = await getProject(params.id)

  return (
    <>
      <NewProjectPage isEdit={true} project={project} />
    </>
  )
}
