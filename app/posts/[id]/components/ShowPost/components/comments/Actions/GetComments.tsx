'use server'
import db from '@/lib/Database/Supabase/Base'
import { VerifyCommentToken } from './VerifyCommentToken'


const GetComments = async (
  id?: string, 
  loadReplies?: boolean,
  pageSize: number = 10,
  lastCommentId?: string,
  token?: string
) => {
  try {
    if(!db) return null
    let verify = await VerifyCommentToken(token || '')
    if(!verify) return null
    // Base query to get comments
    let query = db
      .from('post_comments')
      .select(`
        *,
        replies:post_comments!reply_id(*)
      `)
      .eq('post_id', id)
      .is('reply_id', null) // Only get top-level comments
      .order('created_at', { ascending: false })
      .limit(pageSize)

    // If we have a lastCommentId, get comments after that ID
    if (lastCommentId) {
      const lastComment = await db
        .from('post_comments')
        .select('created_at')
        .eq('id', lastCommentId)
        .single()

      if (lastComment.data) {
        query = query.lt('created_at', lastComment.data.created_at)
      }
    }

    const { data: comments, error } = await query

    console.log(error)

    if (error) {
      console.error('Error fetching comments:', error)
      return null
    }

    // Flatten the comments and their replies into a single array
    const flattenedComments = comments?.flatMap(comment => [
      comment,
      ...(comment.replies || [])
    ]) || []

    return flattenedComments
  }
  catch (error) {
    console.error('Error in GetComments:', error)
    return null
  }
}

export default GetComments
