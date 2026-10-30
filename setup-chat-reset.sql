-- COMPLETE RESET - Drops everything and recreates
-- Use this if you want to completely reset the chat system

-- Step 1: Drop the entire table and recreate
DROP TABLE IF EXISTS chat_messages CASCADE;

-- Step 2: Recreate the chat messages table
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('admin', 'staff')),
  receiver_id TEXT NOT NULL,
  receiver_role TEXT NOT NULL CHECK (receiver_role IN ('admin', 'staff')),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create indexes for better performance
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_receiver_id ON chat_messages(receiver_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

-- Step 4: Enable Row Level Security (RLS)
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Step 5: Create policies for chat messages
-- Allow users to view messages where they are sender or receiver
CREATE POLICY "Users can view their own messages" ON chat_messages
  FOR SELECT USING (
    sender_id = auth.email() OR 
    receiver_id = auth.email()
  );

-- Allow users to insert messages where they are the sender
CREATE POLICY "Users can insert their own messages" ON chat_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.email()
  );

-- Allow users to update read status where they are the receiver
CREATE POLICY "Users can update read status" ON chat_messages
  FOR UPDATE USING (
    receiver_id = auth.email()
  );

-- Step 6: Test the table
SELECT 'Chat tables completely reset and created!' as status;
