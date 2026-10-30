// Chat Local Storage Manager - WhatsApp-like functionality
// Handles local storage, synchronization, and message management

export interface LocalChatMessage {
  id: string
  sender_id: string
  sender_name: string
  sender_role: string
  receiver_id: string
  receiver_role: string
  message: string
  read: boolean
  read_at?: string
  delivered: boolean
  delivered_at?: string
  created_at: string
  expires_at?: string
  chat_type?: 'individual' | 'group'
  deleted_for?: string[] // Array of user IDs who deleted this message
  edited?: boolean
  edited_at?: string
  original_message?: string
  local_only?: boolean // For messages not yet synced
}

export interface LocalChatUser {
  user_id: string
  user_name: string
  user_role: string
  is_online: boolean
  last_seen: string
  unread_count: number
  last_message?: string
  last_message_time?: string
  staff_communication?: {
    with: string
    message: string
    time: string
  } | null
}

export interface ChatConversation {
  user_id: string
  user_name: string
  messages: LocalChatMessage[]
  last_updated: string
}

class ChatLocalStorage {
  private readonly STORAGE_KEY = 'gonstead_chat_data'
  private readonly SYNC_QUEUE_KEY = 'gonstead_chat_sync_queue'
  private readonly DELETED_MESSAGES_KEY = 'gonstead_deleted_messages'
  
  // Get all chat data from localStorage
  getChatData(): {
    conversations: Map<string, ChatConversation>
    users: Map<string, LocalChatUser>
    syncQueue: LocalChatMessage[]
    deletedMessages: Set<string>
  } {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) {
        return {
          conversations: new Map(),
          users: new Map(),
          syncQueue: [],
          deletedMessages: new Set()
        }
      }

      const data = JSON.parse(stored)
      return {
        conversations: new Map(data.conversations || []),
        users: new Map(data.users || []),
        syncQueue: data.syncQueue || [],
        deletedMessages: new Set(data.deletedMessages || [])
      }
    } catch (error) {
      console.error('Error loading chat data from localStorage:', error)
      return {
        conversations: new Map(),
        users: new Map(),
        syncQueue: [],
        deletedMessages: new Set()
      }
    }
  }

  // Save all chat data to localStorage
  saveChatData(data: {
    conversations?: Map<string, ChatConversation>
    users?: Map<string, LocalChatUser>
    syncQueue?: LocalChatMessage[]
    deletedMessages?: Set<string>
  }): void {
    try {
      const currentData = this.getChatData()
      
      const updatedData = {
        conversations: Array.from(data.conversations || currentData.conversations),
        users: Array.from(data.users || currentData.users),
        syncQueue: data.syncQueue || currentData.syncQueue,
        deletedMessages: Array.from(data.deletedMessages || currentData.deletedMessages)
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedData))
    } catch (error) {
      console.error('Error saving chat data to localStorage:', error)
    }
  }

  // Add or update a conversation
  saveConversation(userId: string, conversation: ChatConversation): void {
    const data = this.getChatData()
    data.conversations.set(userId, conversation)
    this.saveChatData({ conversations: data.conversations })
  }

  // Get a specific conversation
  getConversation(userId: string): ChatConversation | null {
    const data = this.getChatData()
    return data.conversations.get(userId) || null
  }

  // Add message to conversation
  addMessage(userId: string, message: LocalChatMessage): void {
    const data = this.getChatData()
    let conversation = data.conversations.get(userId)
    
    if (!conversation) {
      conversation = {
        user_id: userId,
        user_name: message.sender_name,
        messages: [],
        last_updated: new Date().toISOString()
      }
      data.conversations.set(userId, conversation)
    }

    conversation.messages.push(message)
    conversation.last_updated = new Date().toISOString()
    
    // Sort messages by created_at
    conversation.messages.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

    this.saveChatData({ conversations: data.conversations })
  }

  // Update a message (for editing)
  updateMessage(messageId: string, updates: Partial<LocalChatMessage>): void {
    const data = this.getChatData()
    
    for (const [userId, conversation] of data.conversations) {
      const messageIndex = conversation.messages.findIndex(msg => msg.id === messageId)
      if (messageIndex !== -1) {
        const message = conversation.messages[messageIndex]
        conversation.messages[messageIndex] = { ...message, ...updates }
        conversation.last_updated = new Date().toISOString()
        this.saveChatData({ conversations: data.conversations })
        return true
      }
    }
    
    return false
  }

  // Delete message for specific user
  deleteMessageForUser(messageId: string, userId: string): void {
    const data = this.getChatData()
    
    for (const [conversationId, conversation] of data.conversations) {
      const messageIndex = conversation.messages.findIndex(msg => msg.id === messageId)
      if (messageIndex !== -1) {
        const message = conversation.messages[messageIndex]
        if (!message.deleted_for) {
          message.deleted_for = []
        }
        message.deleted_for.push(userId)
        conversation.last_updated = new Date().toISOString()
        this.saveChatData({ conversations: data.conversations })
        return true
      }
    }
    
    return false
  }

  // Delete message for everyone
  deleteMessageForEveryone(messageId: string): void {
    const data = this.getChatData()
    
    for (const [conversationId, conversation] of data.conversations) {
      const messageIndex = conversation.messages.findIndex(msg => msg.id === messageId)
      if (messageIndex !== -1) {
        conversation.messages.splice(messageIndex, 1)
        conversation.last_updated = new Date().toISOString()
        
        // Add to deleted messages set for sync with server
        data.deletedMessages.add(messageId)
        this.saveChatData({ 
          conversations: data.conversations,
          deletedMessages: data.deletedMessages 
        })
        return true
      }
    }
    
    return false
  }

  // Clear entire conversation for user
  clearConversation(userId: string): void {
    const data = this.getChatData()
    data.conversations.delete(userId)
    this.saveChatData({ conversations: data.conversations })
  }

  // Add message to sync queue (for messages sent while offline)
  addToSyncQueue(message: LocalChatMessage): void {
    const data = this.getChatData()
    data.syncQueue.push(message)
    this.saveChatData({ syncQueue: data.syncQueue })
  }

  // Get and clear sync queue
  getSyncQueue(): LocalChatMessage[] {
    const data = this.getChatData()
    const queue = [...data.syncQueue]
    data.syncQueue = []
    this.saveChatData({ syncQueue: data.syncQueue })
    return queue
  }

  // Get deleted messages for sync
  getDeletedMessages(): Set<string> {
    const data = this.getChatData()
    return new Set(data.deletedMessages)
  }

  // Clear deleted messages after sync
  clearDeletedMessages(messageIds: string[]): void {
    const data = this.getChatData()
    messageIds.forEach(id => data.deletedMessages.delete(id))
    this.saveChatData({ deletedMessages: data.deletedMessages })
  }

  // Clean up expired messages (older than 24 hours)
  cleanupExpiredMessages(): void {
    const data = this.getChatData()
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    for (const [userId, conversation] of data.conversations) {
      const originalLength = conversation.messages.length
      conversation.messages = conversation.messages.filter(msg => 
        new Date(msg.created_at) > twentyFourHoursAgo
      )
      
      if (conversation.messages.length === 0) {
        data.conversations.delete(userId)
      } else if (conversation.messages.length < originalLength) {
        conversation.last_updated = new Date().toISOString()
      }
    }
    
    this.saveChatData({ conversations: data.conversations })
  }

  // Get storage usage
  getStorageUsage(): { used: number, available: number, percentage: number } {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY)
      const used = data ? new Blob([data]).size : 0
      const available = 5 * 1024 * 1024 // 5MB approximate localStorage limit
      return {
        used,
        available,
        percentage: (used / available) * 100
      }
    } catch (error) {
      return { used: 0, available: 0, percentage: 0 }
    }
  }

  // Export chat data for backup
  exportChatData(): string {
    const data = this.getChatData()
    return JSON.stringify({
      conversations: Array.from(data.conversations),
      users: Array.from(data.users),
      exportDate: new Date().toISOString()
    }, null, 2)
  }

  // Import chat data from backup
  importChatData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData)
      if (data.conversations && Array.isArray(data.conversations)) {
        this.saveChatData({
          conversations: new Map(data.conversations)
        })
        return true
      }
      return false
    } catch (error) {
      console.error('Error importing chat data:', error)
      return false
    }
  }
}

// Export singleton instance
export const chatLocalStorage = new ChatLocalStorage()

// Auto-cleanup expired messages every hour
if (typeof window !== 'undefined') {
  setInterval(() => {
    chatLocalStorage.cleanupExpiredMessages()
  }, 60 * 60 * 1000) // 1 hour
}
