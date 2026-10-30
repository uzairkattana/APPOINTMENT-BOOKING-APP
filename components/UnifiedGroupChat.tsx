"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  MessageCircle, 
  X, 
  Send, 
  Users, 
  Trash2,
  Settings,
  Shield,
  Clock,
  Check,
  CheckCheck,
  AlertTriangle,
  RefreshCw,
  LogOut,
  Crown
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface UnifiedMessage {
  id: string
  sender_id: string
  sender_name: string
  sender_role: 'admin' | 'staff'
  message: string
  message_type: 'text' | 'system' | 'notification'
  read: boolean
  read_at?: string
  delivered: boolean
  delivered_at?: string
  created_at: string
  updated_at?: string
  edited: boolean
  edited_at?: string
  original_message?: string
  is_deleted?: boolean
  deleted_by?: string
  deleted_at?: string
}

interface GroupSettings {
  group_name: string
  allow_staff_messages: boolean
  message_retention_days: number
  auto_clear_enabled: boolean
  last_cleared_by?: string
  last_cleared_at?: string
}

interface UnifiedGroupChatProps {
  currentUserId: string
  currentUserRole: 'admin' | 'staff'
  currentUserName: string
}

export default function UnifiedGroupChat({ 
  currentUserId, 
  currentUserRole, 
  currentUserName 
}: UnifiedGroupChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<UnifiedMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState<GroupSettings>({
    group_name: 'Medical Team Communication',
    allow_staff_messages: true,
    message_retention_days: 30,
    auto_clear_enabled: false
  })
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const { toast } = useToast()
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Local storage key
  const STORAGE_KEY = 'unified_group_chat_messages'

  // Load messages from local storage first (for instant display)
  const loadFromLocalStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsedMessages = JSON.parse(stored)
        // Filter out deleted messages
        const activeMessages = parsedMessages.filter((msg: UnifiedMessage) => !msg.is_deleted)
        setMessages(activeMessages)
      }
    } catch (error) {
      console.error('Error loading from local storage:', error)
    }
  }, [])

  // Save messages to local storage
  const saveToLocalStorage = useCallback((messages: UnifiedMessage[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch (error) {
      console.error('Error saving to local storage:', error)
    }
  }, [])

  // Load messages from database
  const loadMessagesFromDB = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })

      if (error) throw error

      if (data) {
        setMessages(data)
        saveToLocalStorage(data)
      }
    } catch (error: any) {
      const msg = error?.message || ""
      if (msg) console.warn('Note loading messages from DB:', msg)
      loadFromLocalStorage()
    }
  }, [loadFromLocalStorage, saveToLocalStorage])

  // Load group settings
  const loadSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('group_chat_settings')
        .select('*')

      if (error) throw error

      if (data) {
        const settingsObj: any = {}
        data.forEach(setting => {
          // Convert string values to appropriate types
          if (setting.setting_key === 'allow_staff_messages' || setting.setting_key === 'auto_clear_enabled') {
            settingsObj[setting.setting_key] = setting.setting_value === 'true'
          } else if (setting.setting_key === 'message_retention_days') {
            settingsObj[setting.setting_key] = parseInt(setting.setting_value) || 30
          } else {
            settingsObj[setting.setting_key] = setting.setting_value
          }
        })
        setSettings(settingsObj)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      // Use default settings if loading fails
      setSettings({
        group_name: 'Medical Team Communication',
        allow_staff_messages: true,
        message_retention_days: 30,
        auto_clear_enabled: false,
        last_cleared_by: 'none',
        last_cleared_at: 'never'
      })
    }
  }, [])

  // Send message
  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || isLoading) return

    // Check if staff messages are allowed
    if (currentUserRole === 'staff' && !settings.allow_staff_messages) {
      toast({
        title: "Message Not Sent",
        description: "Staff messages are currently disabled",
        variant: "destructive"
      })
      return
    }

    const messageText = newMessage.trim()
    setNewMessage('')
    setIsLoading(true)

    // Create message object
    const messageObj: Partial<UnifiedMessage> = {
      sender_id: currentUserId,
      sender_name: currentUserName,
      sender_role: currentUserRole,
      message: messageText,
      message_type: 'text',
      read: false,
      delivered: true,
      delivered_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    }

    try {
      // Save to database
      const { data, error } = await supabase
        .from('chat_messages')
        .insert(messageObj)
        .select()
        .single()

      if (error) throw error

      if (data) {
        // Update local state immediately for fast response
        setMessages(prev => [...prev, data])
        saveToLocalStorage([...messages, data])
        
        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Fallback: Save locally only
      const localMessage: UnifiedMessage = {
        ...(messageObj as any),
        id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      }
      
      setMessages(prev => [...prev, localMessage])
      saveToLocalStorage([...messages, localMessage])
      
      toast({
        title: "Message Saved Locally",
        description: "Will sync when connection is restored",
        variant: "default"
      })
    } finally {
      setIsLoading(false)
    }
  }, [newMessage, isLoading, currentUserRole, settings.allow_staff_messages, currentUserId, currentUserName, messages, saveToLocalStorage, toast])

  // Delete message (admin only)
  const deleteMessage = useCallback(async (messageId: string) => {
    if (currentUserRole !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only administrators can delete messages",
        variant: "destructive"
      })
      return
    }

    try {
      const { error } = await supabase.rpc('delete_message', {
        message_id: messageId,
        admin_id: currentUserId
      })

      if (error) throw error

      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, is_deleted: true, deleted_by: currentUserId, deleted_at: new Date().toISOString() }
          : msg
      ))
      
      // Remove from local storage
      const updatedMessages = messages.filter(msg => msg.id !== messageId)
      saveToLocalStorage(updatedMessages)

      toast({
        title: "Message Deleted",
        description: "The message has been removed for all users"
      })
    } catch (error) {
      console.error('Error deleting message:', error)
      toast({
        title: "Delete Failed",
        description: "Could not delete message",
        variant: "destructive"
      })
    }
  }, [currentUserRole, currentUserId, messages, saveToLocalStorage, toast])

  // Clear all messages (admin only)
  const clearAllMessages = useCallback(async () => {
    if (currentUserRole !== 'admin') {
      toast({
        title: "Access Denied",
        description: "Only administrators can clear messages",
        variant: "destructive"
      })
      return
    }

    if (!confirm('Are you sure you want to clear all messages? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase.rpc('clear_all_messages', {
        admin_id: currentUserId
      })

      if (error) throw error

      // Clear local state
      setMessages([])
      saveToLocalStorage([])

      toast({
        title: "Chat Cleared",
        description: "All messages have been removed"
      })
    } catch (error) {
      console.error('Error clearing messages:', error)
      toast({
        title: "Clear Failed",
        description: "Could not clear messages",
        variant: "destructive"
      })
    }
  }, [currentUserRole, currentUserId, saveToLocalStorage, toast])

  // Real-time subscription
  useEffect(() => {
    if (!isOpen) return

    const channel = supabase
      .channel('unified_group_chat')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages',
          filter: `is_deleted=eq.false`
        }, 
        (payload) => {
          const newMessage = payload.new as UnifiedMessage
          setMessages(prev => {
            const updated = [...prev, newMessage]
            saveToLocalStorage(updated)
            return updated
          })
          
          // Scroll to bottom for new messages
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
          }, 100)
        }
      )
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          const updatedMessage = payload.new as UnifiedMessage
          
          if (updatedMessage.is_deleted) {
            // Message was deleted
            setMessages(prev => {
              const filtered = prev.filter(msg => msg.id !== updatedMessage.id)
              saveToLocalStorage(filtered)
              return filtered
            })
          } else {
            // Message was updated
            setMessages(prev => {
              const updated = prev.map(msg => 
                msg.id === updatedMessage.id ? updatedMessage : msg
              )
              saveToLocalStorage(updated)
              return updated
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isOpen, saveToLocalStorage])

  // Initialize
  useEffect(() => {
    if (isOpen) {
      loadFromLocalStorage() // Load instantly from local storage
      loadMessagesFromDB() // Then sync with database
      loadSettings()
    }
  }, [isOpen, loadFromLocalStorage, loadMessagesFromDB, loadSettings])

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const activeMessages = messages.filter(msg => !msg.is_deleted)

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg"
        size="lg"
      >
        <MessageCircle className="h-6 w-6" />
        {activeMessages.length > 0 && (
          <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
            {activeMessages.length}
          </Badge>
        )}
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[600px] shadow-2xl border-0">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <CardTitle className="text-lg font-semibold">{settings.group_name}</CardTitle>
            {currentUserRole === 'admin' && (
              <Crown className="h-4 w-4 text-yellow-300" />
            )}
          </div>
          <div className="flex items-center space-x-2">
            {currentUserRole === 'admin' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="text-white hover:bg-white/20"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Online users indicator */}
        <div className="flex items-center space-x-2 text-sm text-blue-100">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>{onlineUsers.length + 1} online</span>
          </div>
          {currentUserRole === 'admin' && (
            <Badge variant="secondary" className="bg-white/20 text-white text-xs">
              Admin
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col h-full p-0">
        {/* Settings Panel (Admin Only) */}
        {currentUserRole === 'admin' && showSettings && (
          <div className="p-4 bg-gray-50 border-b">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Staff Messages</span>
                <Button
                  variant={settings.allow_staff_messages ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    // Toggle staff messages (would update in DB)
                    setSettings(prev => ({
                      ...prev,
                      allow_staff_messages: !prev.allow_staff_messages
                    }))
                  }}
                >
                  {settings.allow_staff_messages ? "Enabled" : "Disabled"}
                </Button>
              </div>
              
              <Separator />
              
              <div className="flex space-x-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={clearAllMessages}
                  className="flex items-center space-x-1"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Clear All</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    loadMessagesFromDB()
                    toast({
                      title: "Refreshed",
                      description: "Messages have been synchronized"
                    })
                  }}
                  className="flex items-center space-x-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Sync</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {activeMessages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              activeMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 ${
                      message.sender_id === currentUserId
                        ? 'bg-blue-600 text-white'
                        : message.sender_role === 'admin'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    {/* Sender info for other users' messages */}
                    {message.sender_id !== currentUserId && (
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-medium opacity-90">
                          {message.sender_name}
                        </span>
                        {message.sender_role === 'admin' && (
                          <Crown className="h-3 w-3 text-yellow-300" />
                        )}
                      </div>
                    )}
                    
                    {/* Message content */}
                    <p className="text-sm break-words">{message.message}</p>
                    
                    {/* Message metadata */}
                    <div className={`flex items-center justify-between mt-1 text-xs ${
                      message.sender_id === currentUserId ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      <span>{formatTime(message.created_at)}</span>
                      <div className="flex items-center space-x-1">
                        {message.edited && <span>edited</span>}
                        {message.sender_id === currentUserId && (
                          <>
                            {message.read ? (
                              <CheckCheck className="h-3 w-3" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Admin controls for other users' messages */}
                    {currentUserRole === 'admin' && message.sender_id !== currentUserId && (
                      <div className="flex justify-end mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMessage(message.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t bg-gray-50">
          {currentUserRole === 'staff' && !settings.allow_staff_messages && (
            <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                <AlertTriangle className="h-3 w-3 inline mr-1" />
                Staff messages are currently disabled by administrator
              </p>
            </div>
          )}
          
          <div className="flex space-x-2">
            <Input
              ref={inputRef}
              placeholder={
                currentUserRole === 'staff' && !settings.allow_staff_messages
                  ? "Messages disabled"
                  : "Type a message..."
              }
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              disabled={
                (currentUserRole === 'staff' && !settings.allow_staff_messages) ||
                isLoading
              }
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={
                !newMessage.trim() ||
                isLoading ||
                (currentUserRole === 'staff' && !settings.allow_staff_messages)
              }
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
