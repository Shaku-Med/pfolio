import { getThreadMessages } from './queries'

export async function processMessages(messages: any[]) {
  const processedMessages = await Promise.all(messages.map(async (msg) => {
    try {
      const thread = msg.message_thread
      if (!thread) return { ...msg, message_thread: [] }

      // Parse thread IDs
      const threadIds = typeof thread === 'string' ? JSON.parse(thread) : thread
      if (!Array.isArray(threadIds)) return { ...msg, message_thread: [] }

      // Fetch thread messages
      const { data: threadMessages, error: threadError } = await getThreadMessages(threadIds)

      if (threadError) {
        console.error('Error fetching thread messages:', threadError)
        return { ...msg, message_thread: [] }
      }

      return {
        ...msg,
        message_thread: threadMessages || []
      }
    } catch (e) {
      console.error('Error processing message thread:', e)
      return { ...msg, message_thread: [] }
    }
  }))

  // Filter out messages that are part of a thread
  const allThreadIds = new Set()
  processedMessages.forEach(msg => {
    const thread = msg.message_thread
    if (Array.isArray(thread)) {
      thread.forEach(threadMsg => allThreadIds.add(threadMsg.chat_id))
    }
  })

  const filteredMessages = processedMessages.filter(msg => !allThreadIds.has(msg.chat_id))

  // Sort all messages by created_at
  return filteredMessages.sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
} 