'use server'

import db from '@/lib/Database/Supabase/Base'
import { revalidatePath } from 'next/cache'
import { VerifyCommentToken } from './VerifyCommentToken'
import { headers } from 'next/headers'
import { getClientIP } from '@/app/Auth/Functions/GetIp'

export async function addComment(postId: string, message: string, token: string, clientId: string) {
  try {
    let h = await headers()
    let ip = await getClientIP(h)

    if (!db || !ip) return { error: 'Error connection not available' }

    let verify = await VerifyCommentToken(token || '')
    if(!verify) return { error: 'Invalid token' }

    const { data, error } = await db
      .from('project_comments')
      .insert([
        {
          project_id: postId,
          message,
          edited: false,
          ip: ip,
          user_id: clientId
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error adding comment:', error)
      return { error: 'Failed to add comment' }
    }

    // Get current comment count
    const { data: postData } = await db
      .from('posts')
      .select('comments')
      .eq('id', postId)
      .single()

    // Update the post's comment count
    const { error: updateError } = await db
      .from('posts')
      .update({ comments: (postData?.comments || 0) + 1 })
      .eq('id', postId)

    if (updateError) {
      console.error('Error updating post comment count:', updateError)
    }

    revalidatePath(`/admin/posts/${postId}`)
    return { data }
  } catch (error) {
    console.error('Error in addComment:', error)
    return { error: 'Failed to add comment' }
  }
}

export async function editComment(commentId: string, message: string, token: string, clientId: string) {
  try {
    let h = await headers()
    let ip = await getClientIP(h)

    if (!db || !ip) return { error: 'Database connection not available' }

    let verify = await VerifyCommentToken(token || '')
    if(!verify) return { error: 'Invalid token' }

    // First check if the user owns the comment
    const { data: comment } = await db
      .from('project_comments')
      .select('user_id')
      .eq('id', commentId)
      .single()

    if (!comment || comment.user_id !== clientId) {
      return { error: 'Unauthorized to edit this comment' }
    }

    const { data, error } = await db
      .from('project_comments')
      .update({
        message,
        edited: true
      })
      .eq('id', commentId)
      .select()
      .single()

    if (error) {
      console.error('Error editing comment:', error)
      return { error: error.message }
    }

    // Revalidate the post page to show updated comment
    revalidatePath(`/admin/posts/${data.project_id}`)
    return { data }
  } catch (error) {
    console.error('Error in editComment:', error)
    return { error: 'Failed to edit comment' }
  }
}

export async function deleteComment(commentId: string, token: string, clientId: string) {
  try {
    let h = await headers()
    let ip = await getClientIP(h)

    if (!db || !ip) return { error: 'Error connection not available' }

    let verify = await VerifyCommentToken(token || '')
    if(!verify) return { error: 'Invalid token' }

    // First check if the user owns the comment
    const { data: comment } = await db
      .from('project_comments')
      .select('project_id, user_id')
      .eq('id', commentId)
      .single()

    if (!comment) {
      return { error: 'Comment not found' }
    }

    if (comment.user_id !== clientId) {
      return { error: 'Unauthorized to delete this comment' }
    }

    const { error } = await db
      .from('project_comments')
      .delete()
      .eq('id', commentId)

    if (error) {
      console.error('Error deleting comment:', error)
      return { error: 'Failed to delete comment' }
    }

    // Get current comment count
    const { data: postData } = await db
      .from('posts')
      .select('comments')
      .eq('id', comment.project_id)
      .single()

    // Update the post's comment count
    const { error: updateError } = await db
      .from('posts')
      .update({ comments: Math.max((postData?.comments || 0) - 1, 0) })
      .eq('id', comment.project_id)

    if (updateError) {
      console.error('Error updating post comment count:', updateError)
    }

    // Revalidate the post page to remove the deleted comment
    revalidatePath(`/admin/posts/${comment.project_id}`)
    return { success: true }
  } catch (error) {
    console.error('Error in deleteComment:', error)
    return { error: 'Failed to delete comment' }
  }
}

export async function addReply(postId: string, message: string, replyId: string, token: string, clientId: string) {
  try {
    let h = await headers()
    let ip = await getClientIP(h)

    if (!db || !ip) return { error: 'Database connection not available' }

    let verify = await VerifyCommentToken(token || '')
    if(!verify) return { error: 'Invalid token' }

    const { data, error } = await db
      .from('project_comments')
      .insert([
        {
          project_id: postId,
          message,
          edited: false,
          reply_id: replyId,
          ip: ip,
          user_id: clientId
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error adding reply:', error)
      return { error: error.message }
    }

    revalidatePath(`/admin/posts/${postId}`)
    return { data }
  } catch (error) {
    console.error('Error in addReply:', error)
    return { error: 'Failed to add reply' }
  }
} 