'use server'
import db from '@/lib/Database/Supabase/Base'
import { VerifyCommentToken } from './VerifyCommentToken'

interface Comment {
  id: string
  message: string
  created_at: string
  edited: boolean
  reply_id: string | null
  user_id: string
  project_id: string
  replies?: Comment[]
}

const GetComments = async (
  id?: string, 
  loadReplies?: boolean,
  pageSize: number = 10,
  lastCommentId?: string,
  token?: string,
  replyPageSize: number = 5
) => {
  try {
    console.log('GetComments called with:', {
      id,
      loadReplies,
      pageSize,
      lastCommentId,
      hasToken: !!token
    })

    if(!db) {
      console.log('Database connection not available')
      return null
    }
    let verify = await VerifyCommentToken(token || '')
    if(!verify) {
      console.log('Token verification failed')
      return null
    }

    const fetchReplies = async (commentId: string, lastReplyId?: string): Promise<Comment[]> => {
      let replyQuery = db!
        .from('project_comments')
        .select('*')
        .eq('reply_id', commentId)
        .order('created_at', { ascending: true })
        .limit(replyPageSize)

      if (lastReplyId) {
        const lastReply = await db!
          .from('project_comments')
          .select('created_at')
          .eq('id', lastReplyId)
          .single()

        if (lastReply.data) {
          replyQuery = replyQuery.gt('created_at', lastReply.data.created_at)
        }
      }

      const { data: replies, error } = await replyQuery

      if (error || !replies) return []

      // Only fetch nested replies if loadReplies is true
      const repliesWithNestedReplies = await Promise.all(
        replies.map(async (reply) => ({
          ...reply,
          replies: loadReplies ? await fetchReplies(reply.id) : []
        }))
      )

      return repliesWithNestedReplies
    }

    let query = db
      .from('project_comments')
      .select('*')
      .eq('project_id', id)
      .is('reply_id', null)
      .order('created_at', { ascending: false })
      .limit(pageSize)

    if (lastCommentId) {
      console.log('Fetching last comment timestamp for pagination:', { lastCommentId })
      const lastComment = await db
        .from('project_comments')
        .select('created_at')
        .eq('id', lastCommentId)
        .single()

      if (lastComment.data) {
        console.log('Applying pagination with timestamp:', { created_at: lastComment.data.created_at })
        query = query.lt('created_at', lastComment.data.created_at)
      }
    }

    console.log('Executing main comments query')
    const { data: comments, error } = await query

    if (error) {
      console.error('Error fetching comments:', error)
      return null
    }

    console.log('Main comments query result:', {
      commentsCount: comments?.length,
      hasComments: !!comments
    })

    if (!comments) return []

    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await fetchReplies(comment.id)
        console.log('Fetched replies for comment:', {
          commentId: comment.id,
          repliesCount: replies.length
        })
        return {
          ...comment,
          replies
        }
      })
    )

    console.log('Final comments with replies:', {
      totalComments: commentsWithReplies.length,
      hasReplies: commentsWithReplies.some(c => c.replies?.length > 0)
    })

    return commentsWithReplies
  }
  catch (error) {
    console.error('Error in GetComments:', error)
    return null
  }
}

export default GetComments
