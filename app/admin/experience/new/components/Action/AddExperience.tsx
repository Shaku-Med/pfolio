'use server'
import IsAuth from '@/app/admin/Auth/IsAuth';
import db from '@/lib/Database/Supabase/Base';
import { cleanEmptyObjects } from './Cleaner';


const AddExperience = async (data: any, isEdit: boolean, id?: string) => {
  try {
    let isAdmin: any = await IsAuth(true);
    if(!isAdmin) return false;
    // 
    if(!db) return false;

    // Clean the data before database operations
    const cleanedData = cleanEmptyObjects(data);
    if (!cleanedData) return false;

    if(!isEdit){
        cleanedData.user_id = isAdmin.user_id;
        let {error} = await db.from('experience').insert(cleanedData).select();

        if(error) return false;
        return true
    }
    let {error} = await db.from('experience').update(cleanedData).eq('id', id).select();
    if(error) return false;
    return true
  }
  catch (error) {
    return false;
  }
}

export default AddExperience
