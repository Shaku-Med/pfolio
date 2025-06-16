'use server'

import IsAuth from "@/app/admin/Auth/IsAuth";
import { cleanEmptyObjects } from "@/app/admin/experience/new/components/Action/Cleaner";
import db from "@/lib/Database/Supabase/Base"

const HandlePosts = async (data: any, isEdit: boolean = false, postID?: string) => {
 try {
    let isAdmin: any = await IsAuth(true)
    if(!isAdmin) return false;
    if(!db) return false;
    // 
    if(!isEdit) {
        data.user_id = isAdmin.user_id
        let {error} = await db.from('posts').insert(data)
        console.log(error)
        if(error) return false;
        return true;
    }

    const cleanedData = cleanEmptyObjects(data);
    if (!cleanedData) return false;
    let {error} = await db.from('posts').update(cleanedData).eq('user_id', isAdmin.user_id).eq('id', postID)
    if(error) return false;
    return true;
 }
 catch {
    return false
 }
}

export default HandlePosts
