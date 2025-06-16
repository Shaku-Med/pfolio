'use server'
import React from 'react'
import db from '@/lib/Database/Supabase/Base'

interface GetNewMessagesProps {
  userId: string
  lastMessageDate: string
  page?: number
  pageSize?: number
}

const GetNewMessages = async ({ 
  userId, 
  lastMessageDate, 
  page = 1, 
  pageSize = 20 
}: GetNewMessagesProps) => {
  try {
    if (!db) return { data: null, error: new Error('Database not initialized') }

    // Calculate the offset based on page number and page size
    const offset = (page - 1) * pageSize

    const { data: messages, error, count } = await db
      .from('chat_messages')
      .select('*', { count: 'exact' })
      .or(`user_id.eq.${userId},to_id.eq.${userId}`)
    //   .lt('created_at', lastMessageDate)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)


      if (error) {
      // If error is due to range not satisfiable, return empty data instead of error
      if (error.code === 'PGRST103') {
        return {
          data: [],
          error: null,
          pagination: {
            total: count || 0,
            page,
            pageSize,
            totalPages: count ? Math.ceil(count / pageSize) : 0,
            hasMore: false
          }
        }
      }

      return { data: null, error }
    }

    // Process messages to include thread messages
    const processedMessages = await Promise.all((messages || []).map(async (msg) => {
      try {
        const thread = msg.message_thread;
        if (!thread) return { ...msg, message_thread: [] };

        // Parse thread IDs
        const threadIds = typeof thread === 'string' ? JSON.parse(thread) : thread;
        if (!Array.isArray(threadIds)) return { ...msg, message_thread: [] };

        // Fetch thread messages
        if (!db) {
          console.error('Database not initialized when fetching thread messages');
          return { ...msg, message_thread: [] };
        }

        const { data: threadMessages, error: threadError } = await db
          .from('chat_messages')
          .select('*')
          .in('chat_id', threadIds)
          .order('created_at', { ascending: true });

        if (threadError) {
          console.error('Error fetching thread messages:', threadError);
          return { ...msg, message_thread: [] };
        }

        return {
          ...msg,
          message_thread: threadMessages || []
        };
      } catch (e) {
        console.error('Error processing message thread:', e);
        return { ...msg, message_thread: [] };
      }
    }));

    // Filter out messages that are part of a thread
    const allThreadIds = new Set();
    processedMessages.forEach(msg => {
      const thread = msg.message_thread;
      if (Array.isArray(thread)) {
        thread.forEach(threadMsg => allThreadIds.add(threadMsg.chat_id));
      }
    });

    const filteredMessages = processedMessages.filter(msg => !allThreadIds.has(msg.chat_id));

    // Sort all messages by created_at
    const sortedMessages = filteredMessages.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    return { 
      data: sortedMessages, 
      error: null,
      pagination: {
        total: count || 0,
        page,
        pageSize,
        totalPages: count ? Math.ceil(count / pageSize) : 0,
        hasMore: count ? page < Math.ceil(count / pageSize) : false
      }
    }
  }
  catch (error) {
    console.log(error)
    return { data: null, error }
  }
}

export default GetNewMessages
