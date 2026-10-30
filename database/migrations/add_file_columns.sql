-- Add file-related columns to chat_messages table
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_name TEXT,
ADD COLUMN IF NOT EXISTS file_size BIGINT,
ADD COLUMN IF NOT EXISTS file_type TEXT;

-- Create index for file_url for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_file_url ON chat_messages(file_url);

-- Update existing file messages to have proper message_type
UPDATE chat_messages 
SET message_type = 'file' 
WHERE message LIKE '📎%' OR message LIKE '%Voice message%';

-- Add RLS policies for file access if needed
-- (This depends on your existing RLS setup)
