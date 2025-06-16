'use server'

import db from "@/lib/Database/Supabase/Base"

const HandleLiking = async (postId?: string, userId?: string): Promise<boolean> => {
  try {
    if(!db || !postId || !userId) return false
    
    const { data: existingLike } = await db
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single()

    if (existingLike) {
      await db
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId)
      return true
    }

    await db
      .from('post_likes')
      .insert({ post_id: postId, user_id: userId })
    
    return true
  }
  catch {
    return false
  }
}

export default HandleLiking
