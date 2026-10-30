import { supabase } from './supabase'

// Auto-delete expired messages (older than 24 hours)
export async function deleteExpiredMessages() {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('id')

    if (error) {
      console.error('Error deleting expired messages:', error)
      return { success: false, error }
    }

    console.log(`Deleted ${data?.length || 0} expired messages`)
    return { success: true, deletedCount: data?.length || 0 }
  } catch (error) {
    console.error('Error in deleteExpiredMessages:', error)
    return { success: false, error }
  }
}

// Schedule auto-delete to run every hour
export function scheduleAutoDelete() {
  // Run immediately on load
  deleteExpiredMessages()
  
  // Then run every hour
  const interval = setInterval(deleteExpiredMessages, 60 * 60 * 1000) // 1 hour in milliseconds
  
  // Cleanup on page unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      clearInterval(interval)
    })
  }
  
  return interval
}

// Manual cleanup function for testing
export async function manualCleanup() {
  const result = await deleteExpiredMessages()
  return result
}
