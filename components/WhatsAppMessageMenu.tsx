"use client"

import React, { useState, useRef, useEffect } from 'react'
import { MoreVertical, Edit, Trash2, Copy, Reply, Forward, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

interface WhatsAppMessageMenuProps {
  message: any
  currentUserId: string
  currentUserRole: string
  onEditMessage: (messageId: string, newMessage: string) => void
  onDeleteMessage: (messageId: string, deleteFor: 'self' | 'everyone') => void
  onReplyMessage: (message: any) => void
  onForwardMessage: (message: any) => void
  onStarMessage: (messageId: string) => void
  isOwnMessage: boolean
}

export default function WhatsAppMessageMenu({
  message,
  currentUserId,
  currentUserRole,
  onEditMessage,
  onDeleteMessage,
  onReplyMessage,
  onForwardMessage,
  onStarMessage,
  isOwnMessage
}: WhatsAppMessageMenuProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteFor, setDeleteFor] = useState<'self' | 'everyone'>('self')
  const [editedMessage, setEditedMessage] = useState(message.message)
  const [isLongPressing, setIsLongPressing] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const longPressTimer = useRef<NodeJS.Timeout>()
  const menuRef = useRef<HTMLDivElement>(null)

  // Handle long press for mobile
  const handleMouseDown = () => {
    setIsLongPressing(true)
    longPressTimer.current = setTimeout(() => {
      setIsLongPressing(false)
      setShowMenu(true)
    }, 500) // 500ms long press
  }

  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
    setIsLongPressing(false)
  }

  const handleTouchStart = () => {
    handleMouseDown()
  }

  const handleTouchEnd = () => {
    handleMouseUp()
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  const handleEdit = () => {
    setEditedMessage(message.original_message || message.message)
    setIsEditDialogOpen(true)
    setShowMenu(false)
  }

  const handleEditSave = () => {
    if (editedMessage.trim() && editedMessage !== message.message) {
      onEditMessage(message.id, editedMessage.trim())
      setIsEditDialogOpen(false)
    }
  }

  const handleDelete = (type: 'self' | 'everyone') => {
    setDeleteFor(type)
    setIsDeleteDialogOpen(true)
    setShowMenu(false)
  }

  const handleDeleteConfirm = () => {
    onDeleteMessage(message.id, deleteFor)
    setIsDeleteDialogOpen(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(message.message)
    setShowMenu(false)
  }

  const handleReply = () => {
    onReplyMessage(message)
    setShowMenu(false)
  }

  const handleForward = () => {
    onForwardMessage(message)
    setShowMenu(false)
  }

  const handleStar = () => {
    onStarMessage(message.id)
    setShowMenu(false)
  }

  return (
    <>
      <div
        ref={menuRef}
        className="relative"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Long press indicator */}
        {isLongPressing && (
          <div className="absolute inset-0 bg-gray-200 bg-opacity-20 rounded-lg pointer-events-none" />
        )}

        {/* Dropdown Menu */}
        <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align={isOwnMessage ? 'end' : 'start'} className="w-56">
            {/* Reply */}
            <DropdownMenuItem onClick={handleReply}>
              <Reply className="mr-2 h-4 w-4" />
              Reply
            </DropdownMenuItem>

            {/* Forward */}
            <DropdownMenuItem onClick={handleForward}>
              <Forward className="mr-2 h-4 w-4" />
              Forward
            </DropdownMenuItem>

            {/* Star */}
            <DropdownMenuItem onClick={handleStar}>
              <Star className="mr-2 h-4 w-4" />
              Star
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Copy */}
            <DropdownMenuItem onClick={handleCopy}>
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </DropdownMenuItem>

            {/* Edit - Only for own messages and within time limit */}
            {isOwnMessage && !message.edited && (
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}

            {/* Delete */}
            <DropdownMenuSeparator />
            
            <DropdownMenuItem onClick={() => handleDelete('self')} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete for me
            </DropdownMenuItem>

            {/* Delete for everyone - Only for own messages and within time limit */}
            {isOwnMessage && (
              <DropdownMenuItem onClick={() => handleDelete('everyone')} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete for everyone
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Message</DialogTitle>
            <DialogDescription>
              Edit your message. Changes will be visible to all participants.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Textarea
              value={editedMessage}
              onChange={(e) => setEditedMessage(e.target.value)}
              placeholder="Type your message..."
              className="min-h-[100px]"
              autoFocus
            />
            
            {message.original_message && (
              <div className="text-sm text-gray-500">
                Original message: "{message.original_message}"
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={!editedMessage.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteFor === 'everyone' ? 'Delete for everyone?' : 'Delete this message?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteFor === 'everyone' 
                ? "This will delete the message for all participants in this chat. This action cannot be undone."
                : "This will delete the message only for you. Other participants will still be able to see it."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
