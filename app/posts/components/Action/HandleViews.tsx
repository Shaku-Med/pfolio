'use server'

import db from "@/lib/Database/Supabase/Base"
import { revalidatePath } from 'next/cache'

const HandleViews = async (postId?: string): Promise<boolean> => {
  try {
    if(!db || !postId) return false
    
    // Get current view count
    const { data: postData } = await db
      .from('posts')
      .select('views')
      .eq('id', postId)
      .single()

    if (!postData) return false

    // Update the post's view count
    const { error } = await db
      .from('posts')
      .update({ views: (postData.views || 0) + 1 })
      .eq('id', postId)

    if (error) {
      console.error('Error updating post views:', error)
      return false
    }

    // // Revalidate the post page to show updated view count
    // revalidatePath(`/posts/${postId}`)
    // revalidatePath(`/admin/posts/${postId}`)
    
    return true
  }
  catch {
    return false
  }
}

export default HandleViews 