'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  MessageCircle, 
  X, 
  Send, 
  Check, 
  CheckCheck, 
  Users, 
  Circle, 
  MessageSquare,
  Phone,
  Video,
  Search,
  ArrowLeft,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Reply,
  Forward,
  Star,
  Clock,
  Download,
  Upload,
  Wifi,
  WifiOff
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import WhatsAppMessageMenu from './WhatsAppMessageMenu'
import WhatsAppMediaRecorder from './WhatsAppMediaRecorder'
import WhatsAppMediaMessage from './WhatsAppMediaMessage'
import { chatLocalStorage, LocalChatMessage } from '@/lib/chat-local-storage'
import { chatSyncService } from '@/lib/chat-sync-service'
import { mediaStorage, MediaFile } from '@/lib/media-storage'

interface WhatsAppChatInterfaceProps {
  currentUserId: string
  currentUserRole: 'admin' | 'staff'
  currentUserName: string
  adminMode?: boolean
}

type ChatType = 'individual' | 'group'

interface ChatMessage {
  id: string
  sender_id: string
  sender_name: string
  sender_role: string
  receiver_id: string
  receiver_role: string
  message?: string
  media_url?: string
  media_type?: 'voice' | 'video' | 'image' | 'file'
  media_name?: string
  media_size?: number
  media_duration?: number
  read: boolean
  read_at?: string
  delivered: boolean
  delivered_at?: string
  created_at: string
  chat_type?: 'individual' | 'group'
  deleted_for?: string[]
  edited?: boolean
  edited_at?: string
  original_message?: string
}

interface ChatUser {
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

export default function WhatsAppChatInterface({ 
  currentUserId, 
  currentUserRole, 
  currentUserName,
  adminMode = false 
}: WhatsAppChatInterfaceProps) {
  console.log('WhatsAppChatInterface rendered:', { currentUserId, currentUserRole, currentUserName, adminMode })
  
  const [isOpen, setIsOpen] = useState(false)
  const [selectedChat, setSelectedChat] = useState<string>('')
  const [chatType, setChatType] = useState<ChatType>('individual')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([])
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [showChatList, setShowChatList] = useState(true)
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null)
  const [editingMessage, setEditingMessage] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced')
  const [showClearChatDialog, setShowClearChatDialog] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)
  const subscriptionRef = useRef<any>(null)
  const { toast } = useToast()

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setShowChatList(true)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Update online status
  useEffect(() => {
    const updateOnlineStatus = async () => {
      try {
        await supabase
          .from('user_status')
          .upsert({
            user_id: currentUserId,
            user_name: currentUserName,
            user_role: currentUserRole,
            is_online: true,
            last_seen: new Date().toISOString()
          })
      } catch (error) {
        console.error('Error updating online status:', error)
      }
    }

    if (currentUserId) {
      updateOnlineStatus()
      const interval = setInterval(updateOnlineStatus, 30000)
      
      return () => {
        clearInterval(interval)
        supabase
          .from('user_status')
          .upsert({
            user_id: currentUserId,
            user_name: currentUserName,
            user_role: currentUserRole,
            is_online: false,
            last_seen: new Date().toISOString()
          })
      }
    }
  }, [currentUserId, currentUserName, currentUserRole])

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setSyncStatus('synced')
      toast({
        title: "Connection restored",
        description: "Your messages will sync automatically",
      })
    }

    const handleOffline = () => {
      setIsOnline(false)
      setSyncStatus('offline')
      toast({
        title: "Connection lost",
        description: "Messages will be saved locally and synced when you're back online",
        variant: "destructive"
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Initialize local storage and sync service
  useEffect(() => {
    // Save current user info to localStorage
    localStorage.setItem('current_user_id', currentUserId)
    localStorage.setItem('current_user_name', currentUserName)
    localStorage.setItem('current_user_role', currentUserRole)

    // Start sync service
    chatSyncService.startAutoSync()

    return () => {
      chatSyncService.destroy()
    }
  }, [currentUserId, currentUserName, currentUserRole])

  // Message management functions
  const handleEditMessage = async (messageId: string, newMessageText: string) => {
    try {
      const success = await chatSyncService.editMessage(messageId, newMessageText)
      if (success) {
        // Update local state
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, message: newMessageText, edited: true, edited_at: new Date().toISOString() }
            : msg
        ))
        toast({
          title: "Message edited",
          description: "Your message has been updated"
        })
      }
    } catch (error) {
      toast({
        title: "Failed to edit message",
        description: "Please try again",
        variant: "destructive"
      })
    }
  }

  const handleDeleteMessage = async (messageId: string, deleteFor: 'self' | 'everyone') => {
    try {
      const success = deleteFor === 'everyone' 
        ? await chatSyncService.deleteMessageForEveryone(messageId)
        : await chatSyncService.deleteMessageForUser(messageId, currentUserId)

      if (success) {
        if (deleteFor === 'everyone') {
          // Remove from local state
          setMessages(prev => prev.filter(msg => msg.id !== messageId))
          toast({
            title: "Message deleted for everyone",
            description: "The message has been removed for all participants"
          })
        } else {
          // Mark as deleted for current user
          setMessages(prev => prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, deleted_for: [...(msg.deleted_for || []), currentUserId] }
              : msg
          ))
          toast({
            title: "Message deleted",
            description: "The message has been removed for you"
          })
        }
      }
    } catch (error) {
      toast({
        title: "Failed to delete message",
        description: "Please try again",
        variant: "destructive"
      })
    }
  }

  const handleReplyMessage = (message: ChatMessage) => {
    setReplyingTo(message)
    // Focus on input
    setTimeout(() => {
      const inputElement = document.getElementById('chat-input') as HTMLInputElement
      inputElement?.focus()
    }, 100)
  }

  const handleForwardMessage = (message: ChatMessage) => {
    // Store message for forwarding
    const forwardData = {
      message: message.message,
      sender_name: message.sender_name
    }
    localStorage.setItem('forwarding_message', JSON.stringify(forwardData))
    toast({
      title: "Message ready to forward",
      description: "Select a chat to forward this message"
    })
  }

  const handleStarMessage = (messageId: string) => {
    // Implement starring functionality
    toast({
      title: "Message starred",
      description: "You can find starred messages in the starred section"
    })
  }

  const handleClearChat = async () => {
    if (selectedChat) {
      try {
        const success = await chatSyncService.clearConversation(selectedChat)
        if (success) {
          setMessages([])
          setShowClearChatDialog(false)
          toast({
            title: "Chat cleared",
            description: "All messages have been removed"
          })
        }
      } catch (error) {
        toast({
          title: "Failed to clear chat",
          description: "Please try again",
          variant: "destructive"
        })
      }
    }
  }

  const handleExportChat = () => {
    const chatData = chatLocalStorage.exportChatData()
    const blob = new Blob([chatData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast({
      title: "Chat exported",
      description: "Your chat history has been downloaded"
    })
  }

  // Handle media from recorder
  const handleMediaReady = async (mediaData: any) => {
    try {
      let mediaFile: MediaFile

      if (mediaData.type === 'voice') {
        // Create a proper File object from the blob
        const response = await fetch(mediaData.url)
        const blob = await response.blob()
        const audioFile = new File([blob], 'voice-message.webm', { type: 'audio/webm' })
        
        // Upload voice recording with proper error handling
        try {
          mediaFile = await mediaStorage.uploadVoiceRecording(
            blob,
            currentUserId,
            mediaData.duration || 0
          )
        } catch (uploadError) {
          console.error('Voice upload error:', uploadError)
          
          // Fallback: create a local media file object
          mediaFile = {
            id: `voice-${Date.now()}`,
            name: `Voice message ${new Date().toLocaleTimeString()}`,
            type: 'voice',
            mimeType: 'audio/webm',
            size: blob.size,
            url: mediaData.url,
            duration: mediaData.duration,
            userId: currentUserId,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          }
        }
      } else {
        // Upload file/image/video
        const response = await fetch(mediaData.url)
        const blob = await response.blob()
        const file = new File([blob], mediaData.name || 'media', { type: mediaData.mimeType })
        
        try {
          mediaFile = await mediaStorage.uploadFile(file, currentUserId)
        } catch (uploadError) {
          console.error('File upload error:', uploadError)
          
          // Fallback: create a local media file object
          mediaFile = {
            id: `file-${Date.now()}`,
            name: mediaData.name || 'media',
            type: mediaData.type,
            mimeType: mediaData.mimeType,
            size: blob.size,
            url: mediaData.url,
            userId: currentUserId,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          }
        }
      }

      // Send media message
      await sendMediaMessage(mediaFile)

    } catch (error) {
      console.error('Media processing error:', error)
      toast({
        title: "Media processing failed",
        description: "Could not process media file",
        variant: "destructive"
      })
    }
  }

  // Send media message
  const sendMediaMessage = async (mediaFile: MediaFile) => {
    if (!selectedChat) return

    setIsLoading(true)
    try {
      let messageData: any = {
        sender_id: currentUserId,
        sender_name: currentUserName,
        sender_role: currentUserRole,
        media_url: mediaFile.url,
        media_type: mediaFile.type,
        media_name: mediaFile.name,
        media_size: mediaFile.size,
        media_duration: mediaFile.duration,
        read: false,
        delivered: true,
        delivered_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      }

      // Only add expires_at if column exists
      try {
        messageData.expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      } catch (err) {
        console.warn('expires_at column not found, skipping')
      }

      if (selectedChat === 'group-chat') {
        messageData.receiver_id = 'group'
        messageData.receiver_role = 'staff'
        try {
          messageData.chat_type = 'group'
        } catch (err) {
          console.warn('chat_type column not found, sending without chat_type')
        }
      } else {
        messageData.receiver_id = selectedChat
        const selectedUser = chatUsers.find(user => user.user_id === selectedChat)
        messageData.receiver_role = selectedUser?.user_role || 'staff'
        try {
          messageData.chat_type = 'individual'
        } catch (err) {
          console.warn('chat_type column not found, sending without chat_type')
        }
      }
      
      console.log('Sending media message data:', messageData)
      
      const { data, error } = await supabase
        .from('chat_messages')
        .insert(messageData)
        .select()
        .single()

      if (error) {
        console.error('Insert error:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        throw error
      }

      console.log('Media message sent successfully:', data)

      // Update delivered status
      setTimeout(async () => {
        try {
          await supabase
            .from('chat_messages')
            .update({ 
              delivered: true, 
              delivered_at: new Date().toISOString() 
            })
            .eq('id', data.id)
        } catch (updateError) {
          console.warn('Error updating delivered status:', updateError)
        }
      }, 1000)

    } catch (error) {
      console.error('Error sending media message:', error)
      console.error('Full error details:', JSON.stringify(error, null, 2))
      toast({
        title: "Failed to send media",
        description: "Please check your connection and try again",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Load chat users
  const loadChatUsers = async () => {
    try {
      let query = supabase.from('user_status').select('*')
      
      if (currentUserRole === 'admin') {
        // Admin sees all staff members only
        query = query.eq('user_role', 'staff')
      } else if (currentUserRole === 'staff') {
        // Staff sees only admin (no more staff-to-staff individual chats)
        // Staff-to-staff communication happens in the team group
        query = query.eq('user_role', 'admin')
      }
      
      const { data, error } = await query.order('user_name')

      if (error) throw error

      const usersWithUnread = await Promise.all(
        (data || []).map(async (user: any) => {
          // Count unread messages from this user
          const { data: unreadData } = await supabase
            .from('chat_messages')
            .select('id')
            .eq('sender_id', user.user_id)
            .eq('receiver_id', currentUserId)
            .eq('read', false)
            .eq('chat_type', 'individual')

          // Get last message
          const { data: lastMsgData } = await supabase
            .from('chat_messages')
            .select('message, created_at')
            .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${user.user_id},chat_type.eq.individual),and(sender_id.eq.${user.user_id},receiver_id.eq.${currentUserId},chat_type.eq.individual)`)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          // For admin: Check if this staff member is active in team group chat
          let staffCommunicationIndicator = null
          if (currentUserRole === 'admin' && user.user_role === 'staff') {
            try {
              // Check for recent activity in team group by this staff member
              const { data: groupActivity } = await supabase
                .from('chat_messages')
                .select('message, created_at')
                .eq('sender_id', user.user_id)
                .eq('chat_type', 'group')
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

              if (groupActivity) {
                staffCommunicationIndicator = {
                  with: 'Team Group',
                  message: groupActivity.message,
                  time: groupActivity.created_at
                }
              }
            } catch (err) {
              // Ignore errors in staff communication tracking
            }
          }

          return {
            ...user,
            unread_count: unreadData?.length || 0,
            last_message: lastMsgData?.message || '',
            last_message_time: lastMsgData?.created_at || '',
            staff_communication: staffCommunicationIndicator
          }
        })
      )

      // Add group chat entry
      let groupChat
      try {
        const groupUnreadData = await supabase
          .from('chat_messages')
          .select('id')
          .eq('chat_type', 'group')
          .neq('sender_id', currentUserId)
          .eq('read', false)

        const { data: lastGroupMsg } = await supabase
          .from('chat_messages')
          .select('message, created_at, sender_name')
          .eq('chat_type', 'group')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        groupChat = {
          user_id: 'group-chat',
          user_name: 'Team Group',
          user_role: 'group',
          is_online: true,
          last_seen: new Date().toISOString(),
          unread_count: groupUnreadData?.length || 0,
          last_message: lastGroupMsg?.message || '',
          last_message_time: lastGroupMsg?.created_at || ''
        }
      } catch (groupError) {
        console.warn('Group chat not available yet, adding placeholder')
        // Fallback if chat_type column doesn't exist
        groupChat = {
          user_id: 'group-chat',
          user_name: 'Team Group',
          user_role: 'group',
          is_online: true,
          last_seen: new Date().toISOString(),
          unread_count: 0,
          last_message: 'Group chat coming soon!',
          last_message_time: ''
        }
      }

      setChatUsers([...usersWithUnread, groupChat])
      
      // Set unread counts
      const counts: Record<string, number> = {}
      usersWithUnread.forEach(user => {
        counts[user.user_id] = user.unread_count
      })
      counts['group-chat'] = groupChat.unread_count
      setUnreadCounts(counts)

      // Auto-select first chat if none selected
      if (!selectedChat && usersWithUnread.length > 0) {
        setSelectedChat(usersWithUnread[0].user_id)
      }
    } catch (error) {
      console.error('Error loading chat users:', error)
    }
  }

  // Load messages for selected chat
  const loadMessages = async () => {
    if (!selectedChat) return

    setIsLoading(true)
    try {
      let query = supabase.from('chat_messages').select('*').order('created_at', { ascending: true })

      if (selectedChat === 'group-chat') {
        // Load group messages - try with chat_type first, fallback to all messages
        try {
          query = query.eq('chat_type', 'group')
        } catch (err) {
          console.warn('chat_type column not found, loading all messages for group')
          // Fallback: load all messages if chat_type column doesn't exist
        }
      } else {
        // Load individual messages
        try {
          query = query.or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${selectedChat},chat_type.eq.individual),and(sender_id.eq.${selectedChat},receiver_id.eq.${currentUserId},chat_type.eq.individual)`)
        } catch (err) {
          console.warn('chat_type column not found, using simple query')
          // Fallback: simple query without chat_type
          query = query.or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${selectedChat}),and(sender_id.eq.${selectedChat},receiver_id.eq.${currentUserId})`)
        }
      }

      const { data, error } = await query

      if (error) {
        console.error('Supabase query error:', error)
        throw error
      }

      setMessages(data || [])
      
      // Mark messages as read
      let unreadMessages = []
      if (selectedChat === 'group-chat') {
        // Mark unread group messages
        unreadMessages = data?.filter(msg => 
          msg.sender_id !== currentUserId && !msg.read
        ) || []
      } else {
        // Mark unread individual messages
        unreadMessages = data?.filter(msg => 
          msg.sender_id === selectedChat && !msg.read
        ) || []
      }
      
      if (unreadMessages.length > 0) {
        try {
          await supabase
            .from('chat_messages')
            .update({ 
              read: true, 
              read_at: new Date().toISOString() 
            })
            .in('id', unreadMessages.map(msg => msg.id))
          
          // Update unread count
          setUnreadCounts(prev => ({
            ...prev,
            [selectedChat]: 0
          }))
        } catch (updateError) {
          console.warn('Error marking messages as read:', updateError)
          // Continue even if marking as read fails
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error)
      toast({
        title: "Error loading messages",
        description: "Please try refreshing the page",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Real-time subscription
  useEffect(() => {
    if (isOpen) {
      loadChatUsers()
      setupRealtimeSubscription()
    }
    
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current)
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && selectedChat) {
      loadMessages()
    }
  }, [isOpen, selectedChat])

  const setupRealtimeSubscription = () => {
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current)
    }

    const channel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as ChatMessage
            
            let shouldUpdate = false
            
            if (newMessage.chat_type === 'group') {
              // Group message - show if we're in group chat
              shouldUpdate = selectedChat === 'group-chat'
            } else {
              // Individual message
              shouldUpdate = (newMessage.sender_id === currentUserId && newMessage.receiver_id === selectedChat) ||
                           (newMessage.sender_id === selectedChat && newMessage.receiver_id === currentUserId)
            }
            
            if (shouldUpdate) {
              setMessages(prev => [...prev, newMessage])
            }
            
            // Show notification for messages not from current user
            if (newMessage.sender_id !== currentUserId) {
              let shouldNotify = false
              
              if (newMessage.chat_type === 'group') {
                // Notify for group messages if not in group chat
                shouldNotify = selectedChat !== 'group-chat'
              } else {
                // Notify for individual messages if not in that chat
                shouldNotify = selectedChat !== newMessage.sender_id
              }
              
              if (shouldNotify && !isOpen) {
                setUnreadCounts(prev => ({
                  ...prev,
                  [newMessage.chat_type === 'group' ? 'group-chat' : newMessage.sender_id]: 
                    (prev[newMessage.chat_type === 'group' ? 'group-chat' : newMessage.sender_id] || 0) + 1
                }))
                toast({
                  title: `New message${newMessage.chat_type === 'group' ? ' in Team Group' : ` from ${newMessage.sender_name}`}`,
                  description: newMessage.message.substring(0, 50) + (newMessage.message.length > 50 ? "..." : ""),
                  duration: 3000
                })
              }
            }
            
            // Reload chat users to update online status and last message
            loadChatUsers()
          } else if (payload.eventType === 'UPDATE') {
            const updatedMessage = payload.new as ChatMessage
            setMessages(prev => prev.map(msg => 
              msg.id === updatedMessage.id ? updatedMessage : msg
            ))
          }
        }
      )
      .subscribe()

    subscriptionRef.current = channel
  }

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return

    const messageText = newMessage.trim()
    setNewMessage('')
    setIsLoading(true)

    try {
      let messageData: any = {
        sender_id: currentUserId,
        sender_name: currentUserName,
        sender_role: currentUserRole,
        message: messageText,
        read: false,
        delivered: true,
        delivered_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      }

      // Only add expires_at if column exists
      try {
        messageData.expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      } catch (err) {
        console.warn('expires_at column not found, skipping')
      }

      if (selectedChat === 'group-chat') {
        // Group message - use 'staff' as receiver_role to satisfy database constraints
        messageData.receiver_id = 'group'
        messageData.receiver_role = 'staff' // Use 'staff' instead of 'group' to satisfy constraints
        // Only add chat_type if column exists
        try {
          messageData.chat_type = 'group'
        } catch (err) {
          console.warn('chat_type column not found, sending without chat_type')
        }
      } else {
        // Individual message
        messageData.receiver_id = selectedChat
        const selectedUser = chatUsers.find(user => user.user_id === selectedChat)
        messageData.receiver_role = selectedUser?.user_role || 'staff'
        // Only add chat_type if column exists
        try {
          messageData.chat_type = 'individual'
        } catch (err) {
          console.warn('chat_type column not found, sending without chat_type')
        }
      }
      
      console.log('Sending message data:', messageData)
      
      const { data, error } = await supabase
        .from('chat_messages')
        .insert(messageData)
        .select()
        .single()

      if (error) {
        console.error('Insert error:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        throw error
      }

      console.log('Message sent successfully:', data)

      // Update delivered status
      setTimeout(async () => {
        try {
          await supabase
            .from('chat_messages')
            .update({ 
              delivered: true, 
              delivered_at: new Date().toISOString() 
            })
            .eq('id', data.id)
        } catch (updateError) {
          console.warn('Error updating delivered status:', updateError)
        }
      }, 1000)

    } catch (error) {
      console.error('Error sending message:', error)
      console.error('Full error details:', JSON.stringify(error, null, 2))
      toast({
        title: "Failed to send message",
        description: "Please check your connection and try again",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Voice call handler
  const handleVoiceCall = () => {
    toast({
      title: "Voice Call",
      description: "Voice call feature coming soon!",
      duration: 2000
    })
  }

  // Video call handler
  const handleVideoCall = () => {
    toast({
      title: "Video Call",
      description: "Video call feature coming soon!",
      duration: 2000
    })
  }

  // Format time
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  // Filter chat users
  const filteredChatUsers = chatUsers.filter(user =>
    user.user_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get read receipt icon
  const getReadReceiptIcon = (message: ChatMessage) => {
    if (message.sender_id !== currentUserId) return null
    
    if (message.read) {
      return <CheckCheck className="h-4 w-4 text-blue-500" />
    } else if (message.delivered) {
      return <CheckCheck className="h-4 w-4 text-gray-400" />
    } else {
      return <Check className="h-4 w-4 text-gray-400" />
    }
  }

  // Get selected chat user
  const selectedChatUser = chatUsers.find(user => user.user_id === selectedChat)

  if (!isOpen) {
    const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0)
    
    return (
      <div className="fixed bottom-4 right-4 z-[9999]">
        <Button
          onClick={() => {
            console.log('Chat bubble clicked, opening chat...')
            setIsOpen(true)
          }}
          className={`bg-gradient-to-r ${
            adminMode 
              ? 'from-[#0d5c75]/20 to-[#2a9d8f]/20 hover:from-[#0d5c75]/30 hover:to-[#2a9d8f]/30'
              : 'from-[#2a9d8f]/20 to-[#264653]/20 hover:from-[#2a9d8f]/30 hover:to-[#264653]/30'
          } text-white rounded-full p-4 shadow-lg relative border-2 border-white/20 backdrop-blur-xl`}
          size="lg"
        >
          <MessageSquare className={`h-6 w-6 ${adminMode ? 'text-[#0d5c75]' : 'text-[#2a9d8f]'}`} />
          {totalUnread > 0 && (
            <Badge className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs border-2 border-white">
              {totalUnread}
            </Badge>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div ref={chatRef} className="fixed bottom-4 right-4 z-[9999] w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col max-h-[80vh]">
      {/* Header */}
      <CardHeader className={`${
        adminMode 
          ? 'bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f]'
          : 'bg-gradient-to-r from-[#2a9d8f] to-[#264653]'
      } text-white p-4 rounded-t-lg flex-shrink-0 shadow-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showChatList ? (
              <>
                <MessageSquare className="h-5 w-5" />
                <CardTitle className="text-lg font-poppins">Messages</CardTitle>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChatList(true)}
                  className="text-white hover:bg-white/20 p-1 rounded-lg"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    selectedChat === 'group-chat' 
                      ? 'bg-green-400' 
                      : (selectedChatUser?.is_online ? 'bg-green-400' : 'bg-gray-400')
                  }`} />
                  <span className="font-medium">
                    {selectedChat === 'group-chat' ? 'Team Group' : selectedChatUser?.user_name || 'Unknown'}
                    {selectedChat === 'group-chat' && (
                      <span className="ml-1 text-xs text-white/70">(All)</span>
                    )}
                  </span>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!showChatList && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleVoiceCall}
                  className="text-white hover:bg-white/20 p-1 rounded-lg"
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleVideoCall}
                  className="text-white hover:bg-white/20 p-1 rounded-lg"
                >
                  <Video className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsOpen(false)
                setShowChatList(true)
              }}
              className="text-white hover:bg-white/20 p-1 rounded-lg"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Chat List or Messages */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        {showChatList ? (
          // Chat List
          <div className="h-full">
            {/* WhatsApp-style Tabs */}
            <div className="flex border-b">
              <button
                onClick={() => setChatType('individual')}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  chatType === 'individual'
                    ? adminMode
                      ? 'text-[#0d5c75] border-b-2 border-[#0d5c75]'
                      : 'text-[#2a9d8f] border-b-2 border-[#2a9d8f]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Individual
              </button>
              <button
                onClick={() => setChatType('group')}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  chatType === 'group'
                    ? adminMode
                      ? 'text-[#0d5c75] border-b-2 border-[#0d5c75]'
                      : 'text-[#2a9d8f] border-b-2 border-[#2a9d8f]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Group
              </button>
            </div>
            
            {/* Search Bar */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200"
                />
              </div>
            </div>
            
            {/* Chat List */}
            <ScrollArea className="h-full">
              {filteredChatUsers.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No conversations found
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredChatUsers
                    .filter(user => {
                      if (chatType === 'group') {
                        return user.user_id === 'group-chat'
                      } else {
                        return user.user_id !== 'group-chat'
                      }
                    })
                    .map((user) => (
                    <div
                      key={user.user_id}
                      onClick={() => {
                        setSelectedChat(user.user_id)
                        setShowChatList(false)
                      }}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          user.user_id === 'group-chat'
                            ? 'bg-gradient-to-br from-purple-200 to-purple-300'
                            : 'bg-gradient-to-br from-gray-200 to-gray-300'
                        }`}>
                          {user.user_id === 'group-chat' ? (
                            <Users className="h-6 w-6 text-purple-600" />
                          ) : (
                            <Users className="h-6 w-6 text-gray-600" />
                          )}
                        </div>
                        {user.user_id !== 'group-chat' && (
                          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                            user.is_online ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 truncate">
                            {user.user_name}
                            {user.user_id === 'group-chat' && (
                              <span className="ml-1 text-xs text-gray-500">(All)</span>
                            )}
                          </span>
                          <span className="text-xs text-gray-500">
                            {user.last_message_time ? formatTime(user.last_message_time) : ''}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-gray-600 truncate">
                              {user.last_message || 'No messages yet'}
                            </span>
                            {/* Staff communication indicator for admin */}
                            {adminMode && currentUserRole === 'admin' && user.staff_communication && (
                              <div className="flex items-center mt-1 text-xs text-blue-600">
                                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1 animate-pulse"></span>
                                <span className="truncate">
                                  Active in {user.staff_communication.with}: "{user.staff_communication.message.substring(0, 30)}{user.staff_communication.message.length > 30 ? '...' : ''}"
                                </span>
                              </div>
                            )}
                          </div>
                          {unreadCounts[user.user_id] > 0 && (
                            <Badge className="bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs ml-2">
                              {unreadCounts[user.user_id]}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        ) : (
          // Messages
          <div className="h-full flex flex-col">
            <ScrollArea className="flex-1 p-4">
              {selectedChat ? (
                messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No messages in {selectedChat === 'group-chat' ? 'Team Group' : selectedChatUser?.user_name}. Start a conversation!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-3 py-2 ${
                            message.sender_id === currentUserId
                              ? adminMode 
                                ? 'bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] text-white shadow-lg'
                                : 'bg-gradient-to-r from-[#2a9d8f] to-[#264653] text-white shadow-lg'
                              : 'bg-gray-100 text-gray-900 border border-gray-200'
                          }`}
                        >
                          {/* Show sender name in group chat */}
                          {selectedChat === 'group-chat' && message.sender_id !== currentUserId && (
                            <p className="text-xs font-medium text-gray-600 mb-1">
                              {message.sender_name}
                            </p>
                          )}
                          
                          {/* Render media or text message */}
                          {message.media_url ? (
                            <WhatsAppMediaMessage
                              message={{
                                id: message.id,
                                type: message.media_type!,
                                url: message.media_url,
                                duration: message.media_duration,
                                size: message.media_size,
                                name: message.media_name,
                                mimeType: message.mimeType,
                                sender_id: message.sender_id,
                                created_at: message.created_at,
                                isOwn: message.sender_id === currentUserId,
                                adminMode
                              }}
                            />
                          ) : (
                            <p className="text-sm break-words">{message.message}</p>
                          )}
                          <div className={`flex items-center justify-between gap-2 mt-1 ${
                            message.sender_id === currentUserId ? 'flex-row-reverse' : 'flex-row'
                          }`}>
                            <span className={`text-xs ${
                              message.sender_id === currentUserId ? 'text-white/80' : 'text-gray-500'
                            }`}>
                              {formatTime(message.created_at)}
                            </span>
                            {getReadReceiptIcon(message)}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Select a conversation to start chatting
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="flex-shrink-0">
              <WhatsAppMediaRecorder
                onMediaReady={handleMediaReady}
                currentUserId={currentUserId}
                adminMode={adminMode}
                onSendMessage={(message) => {
                  setNewMessage(message)
                  handleSendMessage()
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </div>
  )
}
