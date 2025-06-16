'use server'

import IsAuth from '@/app/admin/Auth/IsAuth'
import { cleanEmptyObjects } from '@/app/admin/experience/new/components/Action/Cleaner'
import db from '@/lib/Database/Supabase/Base'
const HandleSkills = async (data: any, isEdit?: boolean, id?: string) => {
  try {
    let isAdmin: any = await IsAuth(true)
    if(!isAdmin) return false

    if(!db) return false
    if(!isEdit){
        data.user_id = isAdmin.user_id
        // 
        const {error} = await db.from('skills').insert(data)
        if(error) return false
        return true;
    }
    else{
      const cleanedData = cleanEmptyObjects(data);
      if (!cleanedData) return false;
      
      const {error} = await db.from('skills').update(cleanedData).eq('id', id)
      if(error) return false
      return true;
    }
  }
  catch {
    return false
  }
}
export default HandleSkills

