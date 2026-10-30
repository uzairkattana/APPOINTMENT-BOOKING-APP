"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface ChatNotificationBadgeProps {
  currentUserId: string
  currentUserRole: 'admin' | 'staff'
  className?: string
}

export default function ChatNotificationBadge({ 
  currentUserId, 
  currentUserRole, 
  className = "" 
}: ChatNotificationBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  // Fetch unread messages count
  const fetchUnreadCount = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('read', false)
        .neq('sender_id', currentUserId) // Only count messages from others
        .in('message_type', ['text', 'file', 'call']) // Exclude system messages

      if (!error && data) {
        setUnreadCount(data.length)
        setIsVisible(data.length > 0)
      }
    } catch (error) {
      console.error('Error fetching unread messages:', error)
    }
  }

  // Listen for new messages in real-time
  useEffect(() => {
    fetchUnreadCount()

    // Set up real-time subscription
    const channel = supabase
      .channel('chat_notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `receiver_id=eq.${currentUserRole}` // Filter by role
        },
        (payload) => {
          // When new message arrives, update count
          if (payload.eventType === 'INSERT' && payload.new?.sender_id !== currentUserId) {
            setUnreadCount(prev => prev + 1)
            setIsVisible(true)
          }
          // When message is read, update count
          else if (payload.eventType === 'UPDATE' && payload.new?.read === true) {
            setUnreadCount(prev => Math.max(0, prev - 1))
            if (unreadCount <= 1) {
              setIsVisible(false)
            }
          }
        }
      )
      .subscribe()

    // Also listen for read status changes
    const readChannel = supabase
      .channel('chat_read_status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `read=eq.true`
        },
        () => {
          // Refetch count when messages are marked as read
          fetchUnreadCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(readChannel)
    }
  }, [currentUserId, currentUserRole, unreadCount])

  // Mark all messages as read when chat is opened
  const markAllAsRead = async () => {
    try {
      await supabase
        .from('chat_messages')
        .update({ 
          read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('read', false)
        .neq('sender_id', currentUserId)

      setUnreadCount(0)
      setIsVisible(false)
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  // Expose markAllAsRead function to parent
  React.useImperativeHandle(React.createRef(), () => ({
    markAllAsRead
  }))

  if (!isVisible || unreadCount === 0) {
    return null
  }

  return (
    <div 
      className={`absolute -top-1 -right-1 z-20 ${className}`}
      style={{
        animation: 'badgePulse 2s infinite'
      }}
    >
      {/* Badge shadow for depth */}
      <div 
        className="absolute inset-0 bg-red-500/30 rounded-full blur-sm"
        style={{
          transform: 'scale(1.2)'
        }}
      />
      
      {/* Main badge */}
      <div 
        className="relative bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-bold rounded-full min-w-[18px] h-5 flex items-center justify-center border border-white/20 shadow-md"
        style={{
          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          fontSize: unreadCount > 99 ? '10px' : '11px',
          padding: unreadCount > 99 ? '0 3px' : '0',
          minWidth: unreadCount > 99 ? '20px' : '18px'
        }}
      >
        {unreadCount > 99 ? '99+' : unreadCount}
      </div>
      
      {/* Badge highlight for premium look */}
      <div 
        className="absolute top-0.5 left-0.5 w-1 h-1 bg-white/50 rounded-full"
      />
      
      {/* CSS for pulse animation */}
      <style jsx>{`
        @keyframes badgePulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.9;
          }
        }
      `}</style>
    </div>
  )
}
