// Chat Synchronization Service
// Handles synchronization between local storage and Supabase database

import { supabase } from './supabase'
import { chatLocalStorage, LocalChatMessage, ChatConversation } from './chat-local-storage'

export interface SyncResult {
  success: number
  failed: number
  conflicts: number
  errors: string[]
}

export interface SyncOptions {
  autoCleanup?: boolean
  conflictResolution?: 'local' | 'remote' | 'merge'
}

class ChatSyncService {
  private static instance: ChatSyncService
  private isSyncing = false
  private syncInterval: NodeJS.Timeout | null = null

  public static getInstance(): ChatSyncService {
    if (!ChatSyncService.instance) {
      ChatSyncService.instance = new ChatSyncService()
    }
    return ChatSyncService.instance
  }

  constructor() {
    // Start auto-sync every 30 seconds
    this.startAutoSync()
  }

  // Start automatic synchronization
  startAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }

    this.syncInterval = setInterval(() => {
      if (navigator.onLine) {
        this.performSync()
      }
    }, 30000) // 30 seconds
  }

  // Stop automatic synchronization
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  // Perform full synchronization
  async performSync(options: SyncOptions = {}): Promise<SyncResult> {
    if (this.isSyncing) {
      return { success: 0, failed: 0, conflicts: 0, errors: ['Sync already in progress'] }
    }

    this.isSyncing = true
    const result: SyncResult = { success: 0, failed: 0, conflicts: 0, errors: [] }

    try {
      // 1. Upload pending messages from sync queue
      await this.uploadPendingMessages(result)

      // 2. Download new messages from server
      await this.downloadNewMessages(result)

      // 3. Sync deleted messages
      await this.syncDeletedMessages(result)

      // 4. Auto-cleanup expired messages if enabled
      if (options.autoCleanup !== false) {
        await this.autoCleanupExpiredMessages()
      }

      // 5. Update online status
      await this.updateOnlineStatus()

    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown sync error')
    } finally {
      this.isSyncing = false
    }

    return result
  }

  // Upload pending messages from sync queue
  private async uploadPendingMessages(result: SyncResult): Promise<void> {
    const syncQueue = chatLocalStorage.getSyncQueue()
    
    for (const message of syncQueue) {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .insert({
            sender_id: message.sender_id,
            sender_name: message.sender_name,
            sender_role: message.sender_role,
            receiver_id: message.receiver_id,
            receiver_role: message.receiver_role,
            message: message.message,
            read: message.read,
            delivered: message.delivered,
            created_at: message.created_at,
            expires_at: message.expires_at,
            chat_type: message.chat_type
          })
          .select()
          .single()

        if (error) throw error

        // Update local message with server ID and remove from local-only status
        await this.updateLocalMessage(message.id, {
          id: data.id,
          local_only: false
        })

        result.success++
      } catch (error) {
        result.failed++
        result.errors.push(`Failed to upload message ${message.id}: ${error}`)
      }
    }
  }

  // Download new messages from server
  private async downloadNewMessages(result: SyncResult): Promise<void> {
    try {
      // Get last sync timestamp
      const lastSync = localStorage.getItem('chat_last_sync') || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

      // Fetch new messages
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .gte('created_at', lastSync)
        .order('created_at', { ascending: true })

      if (error) throw error

      for (const message of messages || []) {
        try {
          await this.saveMessageToLocal(message)
          result.success++
        } catch (error) {
          result.failed++
          result.errors.push(`Failed to save message ${message.id}: ${error}`)
        }
      }

      // Update last sync timestamp
      localStorage.setItem('chat_last_sync', new Date().toISOString())

    } catch (error) {
      result.errors.push(`Failed to download messages: ${error}`)
    }
  }

  // Sync deleted messages
  private async syncDeletedMessages(result: SyncResult): Promise<void> {
    const deletedMessages = chatLocalStorage.getDeletedMessages()
    
    for (const messageId of deletedMessages) {
      try {
        const { error } = await supabase
          .from('chat_messages')
          .delete()
          .eq('id', messageId)

        if (error) throw error

        result.success++
      } catch (error) {
        result.failed++
        result.errors.push(`Failed to delete message ${messageId}: ${error}`)
      }
    }

    // Clear synced deleted messages
    if (deletedMessages.size > 0) {
      chatLocalStorage.clearDeletedMessages(Array.from(deletedMessages))
    }
  }

  // Auto-cleanup expired messages from server
  private async autoCleanupExpiredMessages(): Promise<void> {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .lt('created_at', twentyFourHoursAgo)

      if (error) throw error

      console.log('Auto-cleanup: Deleted expired messages from server')
    } catch (error) {
      console.error('Auto-cleanup failed:', error)
    }
  }

  // Update user online status
  private async updateOnlineStatus(): Promise<void> {
    try {
      const userId = localStorage.getItem('current_user_id')
      const userName = localStorage.getItem('current_user_name')
      const userRole = localStorage.getItem('current_user_role')

      if (userId && userName && userRole) {
        await supabase
          .from('user_status')
          .upsert({
            user_id: userId,
            user_name: userName,
            user_role: userRole,
            is_online: true,
            last_seen: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
      }
    } catch (error) {
      console.error('Failed to update online status:', error)
    }
  }

  // Save message to local storage
  private async saveMessageToLocal(message: any): Promise<void> {
    const localMessage: LocalChatMessage = {
      ...message,
      deleted_for: message.deleted_for || [],
      edited: message.edited || false,
      edited_at: message.edited_at,
      original_message: message.original_message,
      local_only: false
    }

    // Determine conversation ID
    const conversationId = message.chat_type === 'group' ? 'group-chat' : 
      message.sender_id === localStorage.getItem('current_user_id') ? message.receiver_id : message.sender_id

    chatLocalStorage.addMessage(conversationId, localMessage)
  }

  // Update local message
  private async updateLocalMessage(messageId: string, updates: Partial<LocalChatMessage>): Promise<void> {
    chatLocalStorage.updateMessage(messageId, updates)
  }

  // Edit message
  async editMessage(messageId: string, newMessage: string): Promise<boolean> {
    try {
      const now = new Date().toISOString()

      // Update on server
      const { error } = await supabase
        .from('chat_messages')
        .update({
          message: newMessage,
          edited: true,
          edited_at: now,
          original_message: null // Keep original in local storage
        })
        .eq('id', messageId)

      if (error) throw error

      // Update locally
      chatLocalStorage.updateMessage(messageId, {
        message: newMessage,
        edited: true,
        edited_at: now
      })

      return true
    } catch (error) {
      console.error('Failed to edit message:', error)
      return false
    }
  }

  // Delete message for user
  async deleteMessageForUser(messageId: string, userId: string): Promise<boolean> {
    try {
      // Update on server
      const { error } = await supabase
        .from('chat_messages')
        .update({
          deleted_for: supabase.sql`array_append(deleted_for, ${userId})`
        })
        .eq('id', messageId)

      if (error) throw error

      // Update locally
      chatLocalStorage.deleteMessageForUser(messageId, userId)

      return true
    } catch (error) {
      console.error('Failed to delete message for user:', error)
      return false
    }
  }

  // Delete message for everyone
  async deleteMessageForEveryone(messageId: string): Promise<boolean> {
    try {
      // Delete from server
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', messageId)

      if (error) throw error

      // Delete locally
      chatLocalStorage.deleteMessageForEveryone(messageId)

      return true
    } catch (error) {
      console.error('Failed to delete message for everyone:', error)
      return false
    }
  }

  // Clear conversation
  async clearConversation(userId: string): Promise<boolean> {
    try {
      // Delete messages from server for this user
      const { error } = await supabase
        .from('chat_messages')
        .update({
          deleted_for: supabase.sql`array_append(deleted_for, ${localStorage.getItem('current_user_id')})`
        })
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${localStorage.getItem('current_user_id')}),and(sender_id.eq.${localStorage.getItem('current_user_id')},receiver_id.eq.${userId})`)

      if (error) throw error

      // Clear locally
      chatLocalStorage.clearConversation(userId)

      return true
    } catch (error) {
      console.error('Failed to clear conversation:', error)
      return false
    }
  }

  // Get sync status
  getSyncStatus(): {
    isOnline: boolean
    isSyncing: boolean
    lastSync: string | null
    pendingMessages: number
  } {
    return {
      isOnline: navigator.onLine,
      isSyncing: this.isSyncing,
      lastSync: localStorage.getItem('chat_last_sync'),
      pendingMessages: chatLocalStorage.getSyncQueue().length
    }
  }

  // Force sync now
  async forceSync(): Promise<SyncResult> {
    return await this.performSync()
  }

  // Cleanup resources
  destroy(): void {
    this.stopAutoSync()
  }
}

// Export singleton instance
export const chatSyncService = ChatSyncService.getInstance()
