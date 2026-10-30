# Unified Group Chat System

A single, modern group chat system for medical team communication with full administrative control.

## 🎯 Features

### **Core Functionality**
- **Single Group Chat** - One unified chat for all admin and staff communication
- **Real-time Messaging** - Instant message delivery and synchronization
- **Local Storage** - Fast WhatsApp-like messaging with offline capability
- **Modern UI** - Clean, professional interface (not WhatsApp-style)

### **Admin Controls**
- ✅ **Delete Any Message** - Remove messages for all users
- ✅ **Clear All Messages** - Reset entire chat history
- ✅ **Manage Settings** - Control group permissions and behavior
- ✅ **Disable Staff Messages** - Toggle staff messaging rights
- ✅ **Visual Indicators** - Crown icon shows admin status

### **Staff Restrictions**
- ❌ **No Message Deletion** - Cannot delete own or others' messages
- ❌ **No Chat Clearing** - Cannot clear chat history
- ❌ **No Settings Access** - Cannot modify group settings
- ❌ **Limited Permissions** - Only messaging when enabled by admin

### **Technical Features**
- **Hybrid Storage** - Local storage for speed + database for persistence
- **Real-time Sync** - Admin deletions instantly sync to all users
- **Role-based UI** - Different interfaces for admin vs staff
- **Message Status** - Read receipts and delivery confirmations
- **Auto-scroll** - Smooth scrolling to new messages

## 🚀 Setup Instructions

### **Step 1: Database Setup**

Run the SQL script in Supabase SQL Editor:

```sql
-- Copy contents of database/unified_group_chat.sql
-- Run in Supabase Dashboard → SQL Editor
```

This creates:
- `chat_messages` table with admin control fields
- `group_chat_settings` table for admin settings
- RLS policies for security
- Admin functions for message management

### **Step 2: Component Integration**

The system is already integrated into:
- **Admin Dashboard**: `/admin/dashboard`
- **Staff Dashboard**: `/staff-dashboard`

### **Step 3: Test the System**

1. **Admin Testing**:
   - Go to `/admin/dashboard`
   - Click chat icon (blue, bottom-right)
   - See crown icon indicating admin status
   - Test admin controls (settings, delete, clear)

2. **Staff Testing**:
   - Go to `/staff-dashboard`
   - Click chat icon (blue, bottom-right)
   - Verify limited permissions
   - Test messaging when enabled/disabled

## 🎨 UI Design

### **Modern Interface Elements**
- **Gradient Header** - Blue gradient with group name and online count
- **Role Indicators** - Crown icon for admin, color-coded messages
- **Message Bubbles** - Different colors for admin (purple) vs staff (gray)
- **Settings Panel** - Clean admin controls with toggle switches
- **Status Indicators** - Online status, read receipts, typing indicators

### **Color Scheme**
- **Primary**: Blue gradient (#0d5c75 to #1e40af)
- **Admin Messages**: Purple (#7c3aed)
- **Staff Messages**: Gray (#f3f4f6)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Error**: Red (#ef4444)

## 💾 Storage Strategy

### **Local Storage (Primary)**
- **Instant Display** - Messages appear immediately
- **Offline Capability** - Works without internet
- **Fast Performance** - No database delays
- **WhatsApp-like Experience** - Smooth, responsive messaging

### **Database (Secondary)**
- **Persistence** - Messages saved permanently
- **Sync Across Devices** - Consistent experience
- **Admin Control** - Centralized message management
- **Real-time Updates** - Live synchronization

### **Hybrid Approach**
1. **Message Sent** → Saved locally instantly → Synced to database
2. **Message Received** → From real-time subscription → Saved locally
3. **Admin Delete** → Database update → Real-time sync → Local removal
4. **Connection Lost** → Local storage continues → Sync when restored

## 🔐 Security & Permissions

### **Row Level Security (RLS)**
- **Authenticated Users** → Can view active messages
- **Admin Users** → Can view all messages (including deleted)
- **Message Insertion** → Users can insert their own messages
- **Admin Deletion** → Only admins can delete messages
- **Settings Management** → Admin-only access

### **Database Functions**
- `delete_message()` → Admin-only message deletion
- `clear_all_messages()` → Admin-only chat clearing
- **Role Verification** → Automatic admin role checking

### **Frontend Controls**
- **UI Visibility** → Admin controls only shown to admins
- **Permission Checks** → Client-side validation
- **Error Handling** → Graceful fallbacks for restricted actions

## 📱 User Experience

### **For Administrators**
1. **Full Chat Access** → See all messages and controls
2. **Message Management** → Delete any message instantly
3. **Settings Panel** → Toggle staff messaging, clear chat
4. **Visual Indicators** → Crown icon, admin badge
5. **Sync Controls** → Manual sync, refresh options

### **For Staff Members**
1. **Read/Write Access** → Send messages when enabled
2. **Clean Interface** → Focused on communication
3. **Status Awareness** → See online status, read receipts
4. **Limited Controls** → No management features
5. **Professional Layout** → Medical team appropriate

## 🔄 Real-time Features

### **Message Synchronization**
- **New Messages** → Instant delivery to all users
- **Message Deletions** → Real-time removal for everyone
- **Settings Changes** → Live permission updates
- **Online Status** → Live user presence indicators

### **Performance Optimization**
- **Local Caching** → Instant message display
- **Lazy Loading** → Efficient data fetching
- **Subscription Management** → Optimized real-time updates
- **Memory Management** → Clean message history

## 🛠 Technical Architecture

### **Frontend Components**
```
UnifiedGroupChat.tsx
├── Message Management
├── Real-time Subscriptions
├── Local Storage Integration
├── Admin Controls
├── Permission Handling
└── UI State Management
```

### **Database Schema**
```sql
chat_messages
├── id (UUID, Primary Key)
├── sender_id, sender_name, sender_role
├── message, message_type
├── is_deleted, deleted_by, deleted_at
├── read, delivered status
└── timestamps

group_chat_settings
├── setting_key, setting_value
├── updated_by, updated_at
└── admin controls
```

### **API Functions**
- **Message Operations** → Insert, update, delete
- **Admin Functions** → Delete message, clear chat
- **Settings Management** → Update group settings
- **Real-time Subscriptions** → Live updates

## 🎯 Use Cases

### **Medical Team Communication**
- **Quick Updates** → Patient status, schedule changes
- **Coordination** → Staff scheduling, task assignments
- **Emergencies** → Fast communication for urgent matters
- **Documentation** → Chat history for reference

### **Administrative Control**
- **Message Moderation** → Remove inappropriate content
- **Privacy Management** → Clear sensitive discussions
- **Permission Control** → Enable/disable staff messaging
- **Compliance** → Maintain professional communication standards

## 🔧 Maintenance

### **Database Maintenance**
- **Message Cleanup** → Automatic old message removal
- **Settings Backup** → Preserve admin preferences
- **Performance Monitoring** → Query optimization
- **Security Updates** → RLS policy maintenance

### **Feature Updates**
- **UI Enhancements** → Continuous interface improvements
- **Performance Optimization** → Speed and responsiveness
- **New Features** → Based on user feedback
- **Bug Fixes** → Ongoing issue resolution

---

## 📞 Support

For issues or questions about the Unified Group Chat System:
1. Check browser console for errors
2. Verify database setup with SQL script
3. Test admin and staff permissions separately
4. Ensure real-time subscriptions are active

The system is designed to be robust, secure, and user-friendly for medical team communication.
