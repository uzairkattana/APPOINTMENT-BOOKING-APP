-- ENHANCED CHAT SETUP - Auto-delete, Read Receipts, Online Status
-- Copy and paste this in Supabase SQL Editor

-- Step 1: Drop and recreate table with enhanced fields
DROP TABLE IF EXISTS chat_messages CASCADE;

CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('admin', 'staff')),
  receiver_id TEXT NOT NULL,
  receiver_role TEXT NOT NULL CHECK (receiver_role IN ('admin', 'staff')),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  delivered BOOLEAN DEFAULT FALSE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Step 2: Create indexes
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_receiver_id ON chat_messages(receiver_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_chat_messages_expires_at ON chat_messages(expires_at);

-- Step 3: Create online status table
CREATE TABLE IF NOT EXISTS user_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL CHECK (user_role IN ('admin', 'staff')),
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Disable RLS for now
ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_status DISABLE ROW LEVEL SECURITY;

-- Step 5: Auto-delete function for expired messages
CREATE OR REPLACE FUNCTION delete_expired_messages()
RETURNS void AS $$
BEGIN
  DELETE FROM chat_messages WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Step 6: Schedule auto-delete every hour (you may need to enable pg_cron extension)
-- For now, we'll call it manually when needed

-- Step 7: Insert test messages with enhanced fields
INSERT INTO chat_messages (sender_id, sender_name, sender_role, receiver_id, receiver_role, message, delivered, delivered_at) VALUES
('staff-user', 'Staff Member', 'staff', 'admin-user', 'admin', 'Test message from staff to admin', true, NOW()),
('admin-user', 'Admin', 'admin', 'staff-user', 'staff', 'Test message from admin to staff', true, NOW()),
('staff-user', 'Staff Member', 'staff', 'admin-user', 'admin', 'Another test from staff', true, NOW()),
('admin-user', 'Admin', 'admin', 'staff-user', 'staff', 'Another test from admin', true, NOW());

-- Step 8: Insert test online status
INSERT INTO user_status (user_id, user_name, user_role, is_online) VALUES
('staff-user', 'Staff Member', 'staff', true),
('admin-user', 'Admin', 'admin', true)
ON CONFLICT (user_id) DO UPDATE SET 
  is_online = EXCLUDED.is_online,
  updated_at = NOW();

-- Step 9: Verification
SELECT 'Enhanced chat setup completed!' as status;
SELECT COUNT(*) as message_count FROM chat_messages;
SELECT user_id, user_name, is_online, last_seen FROM user_status;
