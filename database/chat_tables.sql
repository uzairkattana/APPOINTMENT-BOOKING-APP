-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver_id ON chat_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_read ON chat_messages(read);

-- Enable Row Level Security (RLS)
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for chat messages
-- Users can see messages they sent or received
CREATE POLICY "Users can view their own messages" ON chat_messages
  FOR SELECT USING (
    auth.uid()::text = sender_id OR 
    auth.uid()::text = receiver_id OR
    -- Allow admin to see all messages
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.uid() = id AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Users can insert messages they sent
CREATE POLICY "Users can insert their own messages" ON chat_messages
  FOR INSERT WITH CHECK (
    auth.uid()::text = sender_id
  );

-- Users can update read status of messages they received
CREATE POLICY "Users can update read status" ON chat_messages
  FOR UPDATE USING (
    auth.uid()::text = receiver_id
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_chat_messages_updated_at
  BEFORE UPDATE ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create a view for admin to see all conversations
CREATE OR REPLACE VIEW admin_chat_conversations AS
SELECT 
  DISTINCT ON (LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id))
  LEAST(sender_id, receiver_id) as user1_id,
  GREATEST(sender_id, receiver_id) as user2_id,
  CASE 
    WHEN sender_id < receiver_id THEN sender_role 
    ELSE receiver_role 
  END as user1_role,
  CASE 
    WHEN sender_id > receiver_id THEN sender_role 
    ELSE receiver_role 
  END as user2_role,
  message as last_message,
  created_at as last_message_time,
  CASE 
    WHEN receiver_id != sender_id AND NOT read THEN 1 
    ELSE 0 
  END as unread_count
FROM chat_messages
ORDER BY LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id), created_at DESC;

-- Grant permissions
GRANT SELECT ON admin_chat_conversations TO authenticated;
