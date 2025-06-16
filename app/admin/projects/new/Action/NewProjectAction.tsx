'use server'

import IsAuth from "@/app/admin/Auth/IsAuth";
import db from "@/lib/Database/Supabase/Base";

const NewProjectAction = async (data: any, isEdit: boolean = false, projectId?: string) => {
  try {
    if(!data) return null;
    let isAdmin: any = await IsAuth(true)
    if(!isAdmin) return null;
    if(!db) return null;
    
    data.user_id = isAdmin.user_id
    
    let result;
    if (isEdit && projectId) {
      // Update existing project
      const { data: project, error } = await db
        .from('projects')
        .update(Object.fromEntries(
          Object.entries(data).filter(([_, value]) => value !== undefined && value !== null)
        ))
        .eq('id', projectId)
        .select()
      
      if (error) {
        console.error('Error updating project:', error)
        return null
      }
      result = project
    } else {
      // Create new project
      const { data: project, error } = await db
        .from('projects')
        .insert(data)
        .select()
      
      if (error) {
        console.error('Error creating project:', error)
        return null
      }
      result = project
    }
    
    return result
  }
  catch (error) {
    console.error('Error in NewProjectAction:', error)
    return null
  }
}

export default NewProjectAction
