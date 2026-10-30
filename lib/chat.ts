import { supabase } from './supabase'

export interface ChatMessage {
  id: string
  sender_id: string
  sender_name: string
  sender_role: 'admin' | 'staff'
  receiver_id: string
  receiver_role: 'admin' | 'staff'
  message: string
  created_at: string
  read: boolean
}

export interface ChatRoom {
  id: string
  participant1_id: string
  participant1_role: 'admin' | 'staff'
  participant2_id: string
  participant2_role: 'admin' | 'staff'
  last_message?: string
  last_message_time?: string
  unread_count?: number
}

// Send a message
export const sendMessage = async (
  senderId: string,
  senderName: string,
  senderRole: 'admin' | 'staff',
  receiverId: string,
  receiverRole: 'admin' | 'staff',
  message: string
) => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        sender_id: senderId,
        sender_name: senderName,
        sender_role: senderRole,
        receiver_id: receiverId,
        receiver_role: receiverRole,
        message: message.trim(),
        read: false
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Send message error:', error)
    return { data: null, error }
  }
}

// Get messages between two users
export const getMessages = async (userId1: string, userId2: string) => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .or(`(sender_id.eq.${userId1},receiver_id.eq.${userId2}),(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
      .order('created_at', { ascending: true })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Get messages error:', error)
    return { data: [], error }
  }
}

// Mark messages as read
export const markMessagesAsRead = async (senderId: string, receiverId: string) => {
  try {
    const { error } = await supabase
      .from('chat_messages')
      .update({ read: true })
      .eq('sender_id', senderId)
      .eq('receiver_id', receiverId)
      .eq('read', false)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Mark messages as read error:', error)
    return { error }
  }
}

// Get unread message count
export const getUnreadCount = async (userId: string, userRole: 'admin' | 'staff') => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('id')
      .eq('receiver_id', userId)
      .eq('receiver_role', userRole)
      .eq('read', false)

    if (error) throw error
    return { data: data?.length || 0, error: null }
  } catch (error) {
    console.error('Get unread count error:', error)
    return { data: 0, error }
  }
}

// Subscribe to new messages
export const subscribeToMessages = (userId: string, callback: (message: ChatMessage) => void) => {
  const channel = supabase
    .channel('chat_messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `receiver_id=eq.${userId}`
      },
      (payload) => {
        callback(payload.new as ChatMessage)
      }
    )
    .subscribe()

  return channel
}

// Get all chat rooms for a user
export const getChatRooms = async (userId: string, userRole: 'admin' | 'staff') => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Group messages by conversation partner
    const rooms: Map<string, ChatRoom> = new Map()
    
    data?.forEach((message: ChatMessage) => {
      const otherUserId = message.sender_id === userId ? message.receiver_id : message.sender_id
      const otherUserRole = message.sender_id === userId ? message.receiver_role : message.sender_role
      const otherUserName = message.sender_id === userId ? message.receiver_id : message.sender_name

      if (!rooms.has(otherUserId)) {
        rooms.set(otherUserId, {
          id: otherUserId,
          participant1_id: userId,
          participant1_role: userRole,
          participant2_id: otherUserId,
          participant2_role: otherUserRole,
          last_message: message.message,
          last_message_time: message.created_at,
          unread_count: message.receiver_id === userId && !message.read ? 1 : 0
        })
      } else {
        const room = rooms.get(otherUserId)!
        room.last_message = message.message
        room.last_message_time = message.created_at
        if (message.receiver_id === userId && !message.read) {
          room.unread_count = (room.unread_count || 0) + 1
        }
      }
    })

    return { data: Array.from(rooms.values()), error: null }
  } catch (error) {
    console.error('Get chat rooms error:', error)
    return { data: [], error }
  }
}
