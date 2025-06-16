'use server'

import IsAuth from "@/app/admin/Auth/IsAuth"
import { cleanEmptyObjects } from "@/app/admin/experience/new/components/Action/Cleaner"
import db from "@/lib/Database/Supabase/Base"

const GalleryAction = async (data?: any, isEdit?: boolean, id?: string): Promise<boolean> => {
  try {
    if(!data) return false
    if(!db) return false
    let isAdmin: any = await IsAuth(true)
    if(!isAdmin) return false

    if(!isEdit){
        data.user_id = isAdmin.user_id
        let {error} = await db.from('gallery').insert(data)
        console.log(error)
        if(error) return false
        return true
    }

    let cleanD = await cleanEmptyObjects(data)
    let {error} = await db.from('gallery').update(cleanD).eq('user_id', isAdmin.user_id).eq('id', id)

    if(error) return false
    return true
  }
  catch (error) {
    console.log(error)
    return false
  }
}

export default GalleryAction
